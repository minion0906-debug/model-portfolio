import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/admin-api";
import {
  extensionForMimeType,
  getGalleryUploadDirectory,
  titleFromFilename,
} from "@/lib/media-storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 20;

const ALLOWED_TYPES = new Set([
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
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "Select at least one image." }, { status: 400 });
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `You can upload up to ${MAX_FILES} images at once.` },
      { status: 400 },
    );
  }

  const invalidFile = files.find(
    (file) => !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE,
  );

  if (invalidFile) {
    return NextResponse.json(
      {
        error: `Invalid file: ${invalidFile.name}. Use JPG, PNG or WebP up to 10 MB each.`,
      },
      { status: 400 },
    );
  }

  const uploadDirectory = getGalleryUploadDirectory();
  await fs.mkdir(uploadDirectory, { recursive: true });

  const latest = await prisma.media.findFirst({
    where: { type: "IMAGE" },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  let nextSortOrder = (latest?.sortOrder ?? -1) + 1;
  const created: Array<{
    id: string;
    url: string;
    title: string;
  }> = [];

  for (const file of files) {
    const extension = extensionForMimeType(file.type);

    if (!extension) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
    }

    const filename = `${randomUUID()}.${extension}`;
    const filePath = path.join(uploadDirectory, filename);
    const publicUrl = `/uploads/gallery/${filename}`;

    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, bytes);

      const media = await prisma.media.create({
        data: {
          type: "IMAGE",
          title: titleFromFilename(file.name),
          url: publicUrl,
          thumbnail: publicUrl,
          size: file.size,
          published: false,
          sortOrder: nextSortOrder,
        },
        select: {
          id: true,
          url: true,
          title: true,
        },
      });

      created.push({
        id: media.id,
        url: media.url,
        title: media.title ?? "Untitled",
      });

      nextSortOrder += 1;
    } catch (error) {
      try {
        await fs.unlink(filePath);
      } catch {}

      console.error("Gallery upload failed:", error);

      return NextResponse.json(
        { error: "One of the images could not be saved." },
        { status: 500 },
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/gallery");

  return NextResponse.json({ created });
}
