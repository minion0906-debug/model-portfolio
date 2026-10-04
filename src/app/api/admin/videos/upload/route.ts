import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";
import { storeVideo, storeVideoThumbnail } from "@/lib/media-storage";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
const allowedVideos = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const video = formData.get("video");
  const thumbnail = formData.get("thumbnail");

  if (!(video instanceof File)) {
    return NextResponse.json({ error: "Video is required." }, { status: 400 });
  }

  if (!allowedVideos.has(video.type)) {
    return NextResponse.json({ error: "Unsupported video type." }, { status: 400 });
  }

  if (video.size > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: "Video exceeds the 100MB limit." }, { status: 400 });
  }

  if (thumbnail instanceof File) {
    if (!allowedImages.has(thumbnail.type)) {
      return NextResponse.json({ error: "Unsupported thumbnail type." }, { status: 400 });
    }

    if (thumbnail.size > MAX_THUMBNAIL_SIZE) {
      return NextResponse.json({ error: "Thumbnail exceeds the 5MB limit." }, { status: 400 });
    }
  }

  const storedVideo = await storeVideo(video);
  const storedThumbnail =
    thumbnail instanceof File ? await storeVideoThumbnail(thumbnail) : null;

  const media = await prisma.media.create({
    data: {
      type: "VIDEO",
      title: video.name.replace(/\.[^/.]+$/, ""),
      url: storedVideo.url,
      thumbnail: storedThumbnail?.url || null,
      size: storedVideo.size,
      published: false,
    },
  });

  return NextResponse.json({ media }, { status: 201 });
}
