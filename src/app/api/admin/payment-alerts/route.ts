import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [logs, sent24h, failed, processing, pendingPayments, failedPayments] = await Promise.all([
      prisma.paymentAlertLog.findMany({
        orderBy: { createdAt: "desc" }, take: 100,
        include: { payment: { select: { id: true, paypalOrderId: true, paymentMethod: true, amountCents: true, currency: true, payerEmail: true, status: true, createdAt: true, cryptoTxHash: true, media: { select: { title: true } } } } },
      }),
      prisma.paymentAlertLog.count({ where: { status: "SENT", createdAt: { gte: since } } }),
      prisma.paymentAlertLog.count({ where: { status: "FAILED" } }),
      prisma.paymentAlertLog.count({ where: { status: "PROCESSING" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "FAILED", createdAt: { gte: since } } }),
    ]);
    return NextResponse.json({ logs, summary: { sent24h, failed, processing, pendingPayments, failedPayments } });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Unauthorized" : "Unable to load payment alerts." }, { status: unauthorized ? 401 : 500 });
  }
}
