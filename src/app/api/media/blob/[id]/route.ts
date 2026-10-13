import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blob = await prisma.mediaBlob.findUnique({ where: { id } });
  if (!blob) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(blob.data, {
    headers: {
      "Content-Type": blob.contentType,
      "Content-Length": String(blob.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
