import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const mediaId = typeof body.mediaId === "string" ? body.mediaId : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : "";

    if (!mediaId) {
      return NextResponse.json({ error: "An image is required." }, { status: 400 });
    }

    const media = await prisma.media.findFirst({
      where: { id: mediaId, type: "IMAGE", published: true },
      select: { id: true },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Only published gallery images can be added to the hero." },
        { status: 400 },
      );
    }

    const existing = await prisma.heroSlide.findFirst({
      where: { mediaId },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "That image is already in the hero." },
        { status: 409 },
      );
    }

    const last = await prisma.heroSlide.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const slide = await prisma.heroSlide.create({
      data: {
        mediaId,
        title: title || null,
        subtitle: subtitle || null,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        active: true,
      },
      include: {
        media: {
          select: { id: true, url: true, thumbnail: true, title: true },
        },
      },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error("Create hero slide error:", error);
    return NextResponse.json({ error: "Unauthorized or invalid request." }, { status: 401 });
  }
}
