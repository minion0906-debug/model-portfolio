import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function startOfDay(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function endOfDay(value: string) {
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() || "";
    const status = url.searchParams.get("status")?.trim() || "ALL";
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const take = Math.min(Math.max(Number(url.searchParams.get("take") || 100), 1), 250);

    const createdAt: { gte?: Date; lte?: Date } = {};
    if (from) { const date = startOfDay(from); if (date) createdAt.gte = date; }
    if (to) { const date = endOfDay(to); if (date) createdAt.lte = date; }

    const where = {
      ...(status !== "ALL" ? { status } : {}),
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
      ...(q ? {
        OR: [
          { payerEmail: { contains: q, mode: "insensitive" as const } },
          { payerName: { contains: q, mode: "insensitive" as const } },
          { paypalOrderId: { contains: q, mode: "insensitive" as const } },
          { media: { title: { contains: q, mode: "insensitive" as const } } },
        ],
      } : {}),
    };

    const [payments, completedAggregate, refundedAggregate, allCount, completedCount, pendingCount, failedCount, refundedCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true, paypalOrderId: true, amountCents: true, currency: true, status: true,
          payerName: true, payerEmail: true, createdAt: true, capturedAt: true, refundedAt: true, refundId: true, refundAmountCents: true, refundReason: true,
          media: { select: { id: true, title: true, type: true, thumbnail: true, url: true } },
        },
      }),
      prisma.payment.aggregate({ where: { ...where, status: "COMPLETED" }, _sum: { amountCents: true } }),
      prisma.payment.aggregate({ where: { ...where, status: "REFUNDED" }, _sum: { refundAmountCents: true } }),
      prisma.payment.count({ where }),
      prisma.payment.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.payment.count({ where: { ...where, status: "PENDING" } }),
      prisma.payment.count({ where: { ...where, status: "FAILED" } }),
      prisma.payment.count({ where: { ...where, status: "REFUNDED" } }),
    ]);

    return NextResponse.json({
      payments,
      summary: {
        revenueCents: (completedAggregate._sum.amountCents || 0) - (refundedAggregate._sum.refundAmountCents || 0),
        refundedCents: refundedAggregate._sum.refundAmountCents || 0,
        total: allCount,
        completed: completedCount,
        pending: pendingCount,
        failed: failedCount,
        refunded: refundedCount,
      },
    });
  } catch (error) {
    console.error("Admin payments failed:", error);
    return NextResponse.json({ error: "Unauthorized or unable to load payments." }, { status: 401 });
  }
}
