import sharp from "sharp";
import { prisma } from "@/lib/prisma";

export type StorageKind = "image" | "video" | "video-thumbnail";

type StoredMedia = {
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  size: number;
};

function extensionForMime(mime: string) {
  return ({"video/mp4":"mp4","video/webm":"webm","video/quicktime":"mov"} as Record<string,string>)[mime] || "bin";
}

async function storeBlob(body: Buffer, contentType: string) {
  const bytes = new Uint8Array(new ArrayBuffer(body.byteLength));
  bytes.set(body);
  const blob = await prisma.mediaBlob.create({
    data: { data: bytes, contentType, size: body.byteLength },
  });
  return `/api/media/blob/${blob.id}`;
}

export async function deleteStoredMedia(url: string | null | undefined) {
  if (!url) return;
  const id = url.match(/\/api\/media\/blob\/([^/?]+)/)?.[1];
  if (id) await prisma.mediaBlob.deleteMany({ where: { id } });
}

export const deleteLocalGalleryFile = deleteStoredMedia;
export const deleteLocalVideoFile = deleteStoredMedia;
export const deleteLocalVideoThumbnail = deleteStoredMedia;

/** Validates actual image content, normalizes orientation, and stores a small WebP preview. */
export async function storeImage(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());
  if (!input.length) throw new Error("The image file is empty.");

  // Pixel limit helps protect the server from extremely large/decompression-bomb images.
  const source = sharp(input, { limitInputPixels: 40_000_000, failOn: "error" });
  const sourceMeta = await source.metadata();
  if (!sourceMeta.format || !["jpeg", "png", "webp"].includes(sourceMeta.format)) {
    throw new Error("Unsupported image contents. Upload a valid JPG, PNG, or WebP image.");
  }
  if (!sourceMeta.width || !sourceMeta.height) throw new Error("Could not read image dimensions.");

  const processed = await sharp(input, { limitInputPixels: 40_000_000, failOn: "error" })
    .rotate()
    .webp({ quality: 88, effort: 4 })
    .toBuffer();
  const processedMeta = await sharp(processed).metadata();
  const thumbnailBytes = await sharp(input, { limitInputPixels: 40_000_000, failOn: "error" })
    .rotate()
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();

  const [url, thumbnail] = await Promise.all([
    storeBlob(processed, "image/webp"),
    storeBlob(thumbnailBytes, "image/webp"),
  ]);

  return {
    url,
    thumbnail,
    width: processedMeta.width,
    height: processedMeta.height,
    size: processed.byteLength,
  };
}

export async function storeVideo(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());
  return { url: await storeBlob(input, file.type || `video/${extensionForMime(file.type)}`), size: input.byteLength };
}

export async function storeVideoThumbnail(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({width:1600, withoutEnlargement:true}).webp({quality:86}).toBuffer();
  const meta = await sharp(processed).metadata();
  return { url: await storeBlob(processed, "image/webp"), width: meta.width, height: meta.height, size: processed.byteLength };
}
