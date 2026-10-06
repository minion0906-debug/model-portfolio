import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/admin-api";

export async function GET() {
  const admin = await getAdminForApi();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const media = await prisma.media.findMany({
    where: { type: "IMAGE" },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      thumbnail: true,
      published: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ media });
}
