import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 100);
    const search = searchParams.get("search")?.trim() || "";

    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { message: { contains: search, mode: "insensitive" as const } },
      ],
    } : undefined;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({ messages, pagination: { page, limit, total } });
  } catch {
    return NextResponse.json({ error: "Unable to load messages." }, { status: 500 });
  }
}
