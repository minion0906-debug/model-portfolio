import { promises as fs } from "node:fs";
import path from "node:path";

const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
const galleryRoot = path.join(uploadsRoot, "gallery");
const videosRoot = path.join(uploadsRoot, "videos");
const videoThumbnailsRoot = path.join(uploadsRoot, "video-thumbnails");

export function getGalleryUploadDirectory() {
  return galleryRoot;
}

export function getVideoUploadDirectory() {
  return videosRoot;
}

export function getVideoThumbnailDirectory() {
  return videoThumbnailsRoot;
}

export function isLocalGalleryUrl(url: string) {
  return url.startsWith("/uploads/gallery/");
}

export function isLocalVideoUrl(url: string) {
  return url.startsWith("/uploads/videos/");
}

export function isLocalVideoThumbnailUrl(url: string) {
  return url.startsWith("/uploads/video-thumbnails/");
}

function getSafeLocalPath(url: string, prefix: string, root: string) {
  if (!url.startsWith(prefix)) return null;

  const relativePath = url.replace(prefix, "");
  const resolved = path.resolve(root, relativePath);

  if (!resolved.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return resolved;
}

export function getLocalGalleryPath(url: string) {
  return getSafeLocalPath(url, "/uploads/gallery/", galleryRoot);
}

export function getLocalVideoPath(url: string) {
  return getSafeLocalPath(url, "/uploads/videos/", videosRoot);
}

export function getLocalVideoThumbnailPath(url: string) {
  return getSafeLocalPath(
    url,
    "/uploads/video-thumbnails/",
    videoThumbnailsRoot,
  );
}

async function deleteLocalFile(filePath: string | null) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? error.code : undefined;
    if (code !== "ENOENT") throw error;
  }
}

export async function deleteLocalGalleryFile(url: string) {
  await deleteLocalFile(getLocalGalleryPath(url));
}

export async function deleteLocalVideoFile(url: string) {
  await deleteLocalFile(getLocalVideoPath(url));
}

export async function deleteLocalVideoThumbnail(url: string | null) {
  if (!url) return;
  await deleteLocalFile(getLocalVideoThumbnailPath(url));
}

export function titleFromFilename(filename: string) {
  const withoutExtension = filename.replace(/\.[^/.]+$/, "");

  return withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .slice(0, 120);
}

export function extensionForMimeType(type: string) {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };

  return extensions[type];
}
