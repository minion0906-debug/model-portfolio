import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/admin-api";

export async function GET() {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const videos = await prisma.media.findMany({
    where: { type: "VIDEO" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      url: true,
      thumbnail: true,
      published: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ videos });
}
