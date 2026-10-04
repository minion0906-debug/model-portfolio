import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : "";

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        title: title || null,
        subtitle: subtitle || null,
      },
    });

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Update hero slide error:", error);
    return NextResponse.json({ error: "Unable to update hero slide." }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (typeof body.active !== "boolean") {
      return NextResponse.json({ error: "active must be a boolean." }, { status: 400 });
    }

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: { active: body.active },
    });

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Toggle hero slide error:", error);
    return NextResponse.json({ error: "Unable to update hero slide." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.heroSlide.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete hero slide error:", error);
    return NextResponse.json({ error: "Unable to remove hero slide." }, { status: 400 });
  }
}
