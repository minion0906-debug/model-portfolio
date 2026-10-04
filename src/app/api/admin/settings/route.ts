import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";
import { ensureSiteSettings } from "@/lib/admin-settings";

const settingsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  bio: z.string().trim().max(2000),
  email: z.string().trim().email().max(320).or(z.literal("")),
  phone: z.string().trim().max(80),
  instagram: z.string().trim().url().max(500).or(z.literal("")),
  tiktok: z.string().trim().url().max(500).or(z.literal("")),
  youtube: z.string().trim().url().max(500).or(z.literal("")),
  profileImage: z.string().trim().max(1000).or(z.literal("")),
  acceptingBookings: z.boolean(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await ensureSiteSettings();
  const images = await prisma.media.findMany({
    where: { type: "IMAGE", published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, url: true, thumbnail: true, title: true },
  });

  return NextResponse.json({
    settings,
    images: images.map((image) => ({
      id: image.id,
      url: image.thumbnail || image.url,
      title: image.title || "Untitled image",
    })),
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = settingsSchema.parse(await request.json());

    if (body.profileImage) {
      const matchingImage = await prisma.media.findFirst({
        where: {
          type: "IMAGE",
          published: true,
          OR: [{ url: body.profileImage }, { thumbnail: body.profileImage }],
        },
        select: { id: true },
      });

      if (!matchingImage) {
        return NextResponse.json(
          { error: "Profile image must be selected from a published gallery image." },
          { status: 400 },
        );
      }
    }

    const current = await ensureSiteSettings();

    const settings = await prisma.siteSettings.update({
      where: { id: current.id },
      data: body,
    });

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Invalid settings." }, { status: 400 });
  }
}
