import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

const mediaBlobClient = prisma as typeof prisma & {
  mediaBlob: {
    create: (args: any) => Promise<{ id: string }>;
    deleteMany: (args: any) => Promise<any>;
    findUnique: (args: any) => Promise<{ id: string; data: Uint8Array; contentType: string; size: number } | null>;
  };
};

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
  const bytes = new Uint8Array(body);
  const blob = await mediaBlobClient.mediaBlob.create({
    data: { data: bytes, contentType, size: body.byteLength },
  });
  return `/api/media/blob/${blob.id}`;
}

export async function deleteStoredMedia(url: string | null | undefined) {
  if (!url) return;
  const id = url.match(/\/api\/media\/blob\/([^/?]+)/)?.[1];
  if (id) await mediaBlobClient.mediaBlob.deleteMany({ where: { id } });
}

export const deleteLocalGalleryFile = deleteStoredMedia;
export const deleteLocalVideoFile = deleteStoredMedia;
export const deleteLocalVideoThumbnail = deleteStoredMedia;

export async function storeImage(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input).metadata();
  const processed = await sharp(input).rotate().webp({ quality: 88 }).toBuffer();
  return { url: await storeBlob(processed, "image/webp"), width: meta.width, height: meta.height, size: processed.byteLength };
}

export async function storeVideo(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());
  return { url: await storeBlob(input, file.type || `video/${extensionForMime(file.type)}`), size: input.byteLength };
}

export async function storeVideoThumbnail(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(input).rotate().resize({width:1600, withoutEnlargement:true}).webp({quality:86}).toBuffer();
  const meta = await sharp(processed).metadata();
  return { url: await storeBlob(processed, "image/webp"), width: meta.width, height: meta.height, size: processed.byteLength };
}
