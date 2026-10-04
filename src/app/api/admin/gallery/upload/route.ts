import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";
import { storeImage } from "@/lib/media-storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 20;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "No images supplied." }, { status: 400 });
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Maximum ${MAX_FILES} images per upload.` }, { status: 400 });
  }

  const created = [];

  for (const file of files) {
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: `Unsupported image type: ${file.type}` }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `${file.name} exceeds the 10MB limit.` }, { status: 400 });
    }

    const stored = await storeImage(file);

    const media = await prisma.media.create({
      data: {
        type: "IMAGE",
        title: file.name.replace(/\.[^/.]+$/, ""),
        url: stored.url,
        width: stored.width,
        height: stored.height,
        size: stored.size,
        published: false,
      },
    });

    created.push(media);
  }

  return NextResponse.json({ media: created }, { status: 201 });
}
