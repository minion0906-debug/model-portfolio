import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const statuses = ["NEW", "REVIEWING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"] as const;
type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const input = body as { status?: unknown; internalNotes?: unknown };
    const data: { status?: (typeof statuses)[number]; internalNotes?: string | null } = {};

    if (Object.prototype.hasOwnProperty.call(input, "status")) {
      if (typeof input.status !== "string" || !statuses.includes(input.status as (typeof statuses)[number])) {
        return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
      }
      data.status = input.status as (typeof statuses)[number];
    }
    if (Object.prototype.hasOwnProperty.call(input, "internalNotes")) {
      if (input.internalNotes !== null && typeof input.internalNotes !== "string") {
        return NextResponse.json({ error: "Internal notes must be text." }, { status: 400 });
      }
      if (typeof input.internalNotes === "string" && input.internalNotes.length > 10000) {
        return NextResponse.json({ error: "Internal notes are too long." }, { status: 400 });
      }
      data.internalNotes = input.internalNotes as string | null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No supported changes provided." }, { status: 400 });
    }

    const booking = await prisma.bookingRequest.update({ where: { id }, data });
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
