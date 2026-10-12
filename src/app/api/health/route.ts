import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel-friendly readiness check. Do not expose connection strings or raw
// database errors from a public endpoint.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", database: "ok" },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
