import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/admin-api";
import {
  extensionForMimeType,
  getVideoThumbnailDirectory,
  getVideoUploadDirectory,
  titleFromFilename,
} from "@/lib/media-storage";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const ALLOWED_THUMBNAIL_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const video = formData.get("video");
  const thumbnail = formData.get("thumbnail");

  if (!(video instanceof File)) {
    return NextResponse.json({ error: "Select a video file." }, { status: 400 });
  }

  if (!ALLOWED_VIDEO_TYPES.has(video.type) || video.size > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      { error: "Use MP4, WebM or MOV up to 100 MB." },
      { status: 400 },
    );
  }

  if (
    thumbnail instanceof File &&
    (!ALLOWED_THUMBNAIL_TYPES.has(thumbnail.type) ||
      thumbnail.size > MAX_THUMBNAIL_SIZE)
  ) {
    return NextResponse.json(
      { error: "The thumbnail must be JPG, PNG or WebP up to 5 MB." },
      { status: 400 },
    );
  }

  const videoDirectory = getVideoUploadDirectory();
  const thumbnailDirectory = getVideoThumbnailDirectory();

  await fs.mkdir(videoDirectory, { recursive: true });
  await fs.mkdir(thumbnailDirectory, { recursive: true });

  const latest = await prisma.media.findFirst({
    where: { type: "VIDEO" },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const sortOrder = (latest?.sortOrder ?? -1) + 1;

  const videoExtension = extensionForMimeType(video.type);

  if (!videoExtension) {
    return NextResponse.json({ error: "Unsupported video type." }, { status: 400 });
  }

  const videoFilename = `${randomUUID()}.${videoExtension}`;
  const videoPath = path.join(videoDirectory, videoFilename);
  const videoUrl = `/uploads/videos/${videoFilename}`;

  let thumbnailPath: string | null = null;
  let thumbnailUrl: string | null = null;

  try {
    await fs.writeFile(videoPath, Buffer.from(await video.arrayBuffer()));

    if (thumbnail instanceof File) {
      const thumbnailExtension = extensionForMimeType(thumbnail.type);

      if (!thumbnailExtension) {
        throw new Error("Unsupported thumbnail type.");
      }

      const thumbnailFilename = `${randomUUID()}.${thumbnailExtension}`;
      thumbnailPath = path.join(thumbnailDirectory, thumbnailFilename);
      thumbnailUrl = `/uploads/video-thumbnails/${thumbnailFilename}`;

      await fs.writeFile(
        thumbnailPath,
        Buffer.from(await thumbnail.arrayBuffer()),
      );
    }

    const media = await prisma.media.create({
      data: {
        type: "VIDEO",
        title: titleFromFilename(video.name),
        url: videoUrl,
        thumbnail: thumbnailUrl,
        size: video.size,
        published: false,
        sortOrder,
      },
      select: {
        id: true,
        url: true,
        thumbnail: true,
        title: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/videos");

    return NextResponse.json({ media });
  } catch (error) {
    try {
      await fs.unlink(videoPath);
    } catch {}

    if (thumbnailPath) {
      try {
        await fs.unlink(thumbnailPath);
      } catch {}
    }

    console.error("Video upload failed:", error);

    return NextResponse.json(
      { error: "The video could not be saved." },
      { status: 500 },
    );
  }
}
