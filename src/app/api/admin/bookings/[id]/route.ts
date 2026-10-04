import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const statuses = ["NEW", "REVIEWING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"] as const;

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (!statuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
    }

    const booking = await prisma.bookingRequest.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Unable to update booking." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.bookingRequest.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete booking." }, { status: 400 });
  }
}
