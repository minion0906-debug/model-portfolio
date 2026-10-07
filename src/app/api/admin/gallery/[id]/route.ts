import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePublicPortfolio } from "@/lib/public-cache";
import { getAdminForApi } from "@/lib/admin-api";
import { deleteLocalGalleryFile } from "@/lib/media-storage";

const editSchema = z.object({
  title: z.string().trim().max(120),
  description: z.string().trim().max(1000),
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
  const body = await request.json();
  const parsed = editSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gallery data." }, { status: 400 });
  }

  const media = await prisma.media.findFirst({
    where: { id, type: "IMAGE" },
    select: { id: true },
  });

  if (!media) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  const updated = await prisma.media.update({
    where: { id },
    data: {
      title: parsed.data.title || null,
      description: parsed.data.description || null,
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  revalidatePath("/");
  revalidatePublicPortfolio();
  revalidatePath("/admin/gallery");

  return NextResponse.json({ media: updated });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = publishSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid publish value." }, { status: 400 });
  }

  const media = await prisma.media.findFirst({
    where: { id, type: "IMAGE" },
    select: { id: true },
  });

  if (!media) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
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
  revalidatePath("/admin/gallery");

  return NextResponse.json({ media: updated });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const media = await prisma.media.findFirst({
    where: { id, type: "IMAGE" },
    select: {
      id: true,
      url: true,
    },
  });

  if (!media) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  await prisma.media.delete({
    where: { id },
  });

  try {
    await deleteLocalGalleryFile(media.url);
  } catch (error) {
    console.error("Could not delete local gallery file:", error);
  }

  revalidatePath("/");
  revalidatePublicPortfolio();
  revalidatePath("/admin/gallery");

  return NextResponse.json({ success: true });
}
