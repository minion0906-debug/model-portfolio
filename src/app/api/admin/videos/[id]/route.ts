import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePublicPortfolio } from "@/lib/public-cache";
import { getAdminForApi } from "@/lib/admin-api";
import {
  deleteLocalVideoFile,
  deleteLocalVideoThumbnail,
} from "@/lib/media-storage";

const editSchema = z.object({
  title: z.string().trim().max(120),
  description: z.string().trim().max(1000),
  priceCents: z.number().int().min(0).max(100000000),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
});

const publishSchema = z.object({
  published: z.boolean(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = editSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid video data." }, { status: 400 });
  }

  const video = await prisma.media.findFirst({
    where: { id, type: "VIDEO" },
    select: { id: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  const updated = await prisma.media.update({
    where: { id },
    data: {
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      priceCents: parsed.data.priceCents,
      currency: parsed.data.currency,
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  revalidatePath("/");
  revalidatePublicPortfolio();
  revalidatePath("/admin/videos");

  return NextResponse.json({ media: updated });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = publishSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid publish value." }, { status: 400 });
  }

  const video = await prisma.media.findFirst({
    where: { id, type: "VIDEO" },
    select: { id: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  const updated = await prisma.media.update({
    where: { id },
    data: { published: parsed.data.published },
    select: {
      id: true,
      published: true,
    },
  });

  revalidatePath("/");
  revalidatePublicPortfolio();
  revalidatePath("/admin/videos");

  return NextResponse.json({ media: updated });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const video = await prisma.media.findFirst({
    where: { id, type: "VIDEO" },
    select: {
      id: true,
      url: true,
      thumbnail: true,
    },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  await prisma.media.delete({
    where: { id },
  });

  try {
    await deleteLocalVideoFile(video.url);
    await deleteLocalVideoThumbnail(video.thumbnail);
  } catch (error) {
    console.error("Could not delete local video files:", error);
  }

  revalidatePath("/");
  revalidatePublicPortfolio();
  revalidatePath("/admin/videos");

  return NextResponse.json({ success: true });
}
