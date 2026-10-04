import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id: unknown): id is string => typeof id === "string")
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "No slide order supplied." }, { status: 400 });
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.heroSlide.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reorder hero slides error:", error);
    return NextResponse.json({ error: "Unable to reorder hero slides." }, { status: 400 });
  }
}
