import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (typeof body.read !== "boolean") {
      return NextResponse.json({ error: "read must be a boolean." }, { status: 400 });
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read: body.read },
    });

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Unable to update message." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete message." }, { status: 400 });
  }
}
