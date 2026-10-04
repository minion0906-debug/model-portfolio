import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type StorageKind = "image" | "video" | "video-thumbnail";

type StoredMedia = {
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  size: number;
};

const localRoots = {
  image: path.join(process.cwd(), "public/uploads/gallery"),
  video: path.join(process.cwd(), "public/uploads/videos"),
  "video-thumbnail": path.join(process.cwd(), "public/uploads/video-thumbnails"),
};

function useS3() {
  return process.env.MEDIA_STORAGE === "s3" && Boolean(
    process.env.S3_BUCKET &&
    process.env.S3_REGION &&
    process.env.S3_ENDPOINT,
  );
}

function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT;

  return new S3Client({
    region: process.env.S3_REGION,
    endpoint,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
}

function publicUrl(key: string) {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
  if (!base) throw new Error("S3_PUBLIC_URL is required for S3 media storage.");
  return `${base}/${key}`;
}

function extensionForMime(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return map[mime] || "bin";
}

function safeStem(name: string) {
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "media";
}

async function putS3(key: string, body: Buffer, contentType: string) {
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return publicUrl(key);
}

async function putLocal(kind: StorageKind, filename: string, body: Buffer) {
  const root = localRoots[kind];
  await mkdir(root, { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ root, filename), body);

  const folder =
    kind === "image"
      ? "gallery"
      : kind === "video"
        ? "videos"
        : "video-thumbnails";

  return `/uploads/${folder}/${filename}`;
}

async function deleteS3(url: string) {
  const publicBase = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicBase || !url.startsWith(`${publicBase}/`)) return;

  const key = url.slice(publicBase.length + 1);
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }),
  );
}

async function deleteLocal(url: string) {
  if (!url.startsWith("/uploads/")) return;

  const relative = url.replace(/^\/+/, "");
  const absolute = path.resolve(process.cwd(), "public", relative);

  if (!absolute.startsWith(path.resolve(process.cwd(), "public/uploads"))) return;

  try {
    await unlink(absolute);
  } catch {
    // Missing local files are already deleted.
  }
}

export async function deleteStoredMedia(url: string | null | undefined) {
  if (!url) return;
  if (useS3()) return deleteS3(url);
  return deleteLocal(url);
}

export async function deleteLocalGalleryFile(url: string | null | undefined) {
  return deleteStoredMedia(url);
}

export async function deleteLocalVideoFile(url: string | null | undefined) {
  return deleteStoredMedia(url);
}

export async function deleteLocalVideoThumbnail(url: string | null | undefined) {
  return deleteStoredMedia(url);
}

export async function storeImage(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(input).metadata();

  const processed = await sharp(input)
    .rotate()
    .webp({ quality: 88 })
    .toBuffer();

  const filename = `${safeStem(file.name)}-${randomUUID()}.webp`;
  const url = useS3()
    ? await putS3(`gallery/${filename}`, processed, "image/webp")
    : await putLocal("image", filename, processed);

  return {
    url,
    width: metadata.width,
    height: metadata.height,
    size: processed.byteLength,
  };
}

export async function storeVideo(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());
  const filename = `${safeStem(file.name)}-${randomUUID()}.${extensionForMime(file.type)}`;

  const url = useS3()
    ? await putS3(`videos/${filename}`, input, file.type)
    : await putLocal("video", filename, input);

  return {
    url,
    size: input.byteLength,
  };
}

export async function storeVideoThumbnail(file: File): Promise<StoredMedia> {
  const input = Buffer.from(await file.arrayBuffer());

  const processed = await sharp(input)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();

  const filename = `${safeStem(file.name)}-${randomUUID()}.webp`;
  const metadata = await sharp(processed).metadata();

  const url = useS3()
    ? await putS3(`video-thumbnails/${filename}`, processed, "image/webp")
    : await putLocal("video-thumbnail", filename, processed);

  return {
    url,
    width: metadata.width,
    height: metadata.height,
    size: processed.byteLength,
  };
}
