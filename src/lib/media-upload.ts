import { randomUUID } from "node:crypto";
import { z } from "zod";

export const directUploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  kind: z.enum(["image", "video", "video-thumbnail"]),
  size: z.number().int().positive(),
});

const limits = {
  image: 10 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  "video-thumbnail": 5 * 1024 * 1024,
};

const allowedTypes = {
  image: new Set(["image/jpeg", "image/png", "image/webp"]),
  video: new Set(["video/mp4", "video/webm", "video/quicktime"]),
  "video-thumbnail": new Set(["image/jpeg", "image/png", "image/webp"]),
};

export function validateDirectUpload(input: unknown) {
  const parsed = directUploadSchema.parse(input);

  if (!allowedTypes[parsed.kind].has(parsed.contentType)) {
    throw new Error("Unsupported media type.");
  }

  if (parsed.size > limits[parsed.kind]) {
    throw new Error(`File exceeds the ${Math.round(limits[parsed.kind] / 1024 / 1024)}MB limit.`);
  }

  return parsed;
}

function safeStem(name: string) {
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "media";
}

export function createUploadKey(filename: string, kind: "image" | "video" | "video-thumbnail") {
  const extension = filename.includes(".")
    ? filename.split(".").pop()?.toLowerCase() || "bin"
    : "bin";

  const folder =
    kind === "image"
      ? "gallery"
      : kind === "video"
        ? "videos"
        : "video-thumbnails";

  return `${folder}/${safeStem(filename)}-${randomUUID()}.${extension}`;
}

export function getUploadLimit(kind: "image" | "video" | "video-thumbnail") {
  return limits[kind];
}
