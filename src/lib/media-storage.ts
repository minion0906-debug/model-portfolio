import { promises as fs } from "node:fs";
import path from "node:path";

const galleryRoot = path.resolve(process.cwd(), "public", "uploads", "gallery");

export function getGalleryUploadDirectory() {
  return galleryRoot;
}

export function isLocalGalleryUrl(url: string) {
  return url.startsWith("/uploads/gallery/");
}

export function getLocalGalleryPath(url: string) {
  if (!isLocalGalleryUrl(url)) return null;

  const relativePath = url.replace(/^\/uploads\/gallery\//, "");
  const resolved = path.resolve(galleryRoot, relativePath);

  if (!resolved.startsWith(`${galleryRoot}${path.sep}`)) {
    return null;
  }

  return resolved;
}

export async function deleteLocalGalleryFile(url: string) {
  const filePath = getLocalGalleryPath(url);
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? error.code : undefined;
    if (code !== "ENOENT") throw error;
  }
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
  };

  return extensions[type];
}
