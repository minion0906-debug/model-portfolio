import { NextResponse } from "next/server";
import { prisma, withDatabaseRetry, logDatabaseError } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/admin-api";

export async function GET() {
  const admin = await getAdminForApi();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const videos = await withDatabaseRetry(() => prisma.media.findMany({
      where: { type: "VIDEO" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        thumbnail: true,
        published: true,
        priceCents: true,
        currency: true,
        createdAt: true,
      },
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    logDatabaseError("admin/videos", error);
    return NextResponse.json(
      { error: "Database temporarily unavailable. Please retry." },
      { status: 503 },
    );
  }
}
