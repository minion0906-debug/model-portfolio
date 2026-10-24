import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentOperationalAlert } from "@/lib/notifications";
import { ensureSiteSettings } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PENDING_AFTER_MINUTES = 30;
const FAILED_LOOKBACK_HOURS = 24;
const MAX_PER_RUN = 50;

function safeError(error: unknown) {
  return (error instanceof Error ? error.message : "Email delivery failed").slice(0, 500);
}

async function claimAlert(paymentId: string, alertType: string) {
  const dedupeKey = `${paymentId}:${alertType}`;
  try {
    return await prisma.paymentAlertLog.create({
      data: { paymentId, alertType, dedupeKey, status: "PROCESSING", attempts: 1 },
    });
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "P2002")) throw error;
    const existing = await prisma.paymentAlertLog.findUnique({ where: { dedupeKey } });
    if (!existing) return null;
    // Recover a worker that crashed after claiming the alert, and retry failed delivery after five minutes.
    const retryBefore = new Date(Date.now() - 5 * 60_000);
    if (existing.status === "PROCESSING" && existing.updatedAt < new Date(Date.now() - 15 * 60_000)) {
      await prisma.paymentAlertLog.updateMany({
        where: { id: existing.id, status: "PROCESSING", updatedAt: { lt: new Date(Date.now() - 15 * 60_000) } },
        data: { status: "FAILED", lastError: "Previous alert worker did not finish; safe to retry." },
      });
    }
    const claimed = await prisma.paymentAlertLog.updateMany({
      where: { id: existing.id, status: "FAILED", updatedAt: { lt: retryBefore } },
      data: { status: "PROCESSING", attempts: { increment: 1 }, lastError: null },
    });
    if (claimed.count !== 1) return null;
    return prisma.paymentAlertLog.findUnique({ where: { id: existing.id } });
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 24) {
    return NextResponse.json({ error: "Payment alert job is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await ensureSiteSettings();
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || settings.email?.trim();
    if (!adminEmail) return NextResponse.json({ error: "Set ADMIN_NOTIFICATION_EMAIL or a site contact email." }, { status: 503 });

    const now = Date.now();
    const pendingCutoff = new Date(now - PENDING_AFTER_MINUTES * 60_000);
    const failedCutoff = new Date(now - FAILED_LOOKBACK_HOURS * 60 * 60_000);
    const [pending, failed] = await Promise.all([
      prisma.payment.findMany({
        where: { status: "PENDING", createdAt: { lte: pendingCutoff } },
        orderBy: { createdAt: "asc" }, take: MAX_PER_RUN,
        select: { id: true, paypalOrderId: true, paymentMethod: true, amountCents: true, currency: true, payerEmail: true, createdAt: true, cryptoTxHash: true, media: { select: { title: true } } },
      }),
      prisma.payment.findMany({
        where: { status: "FAILED", createdAt: { gte: failedCutoff } },
        orderBy: { createdAt: "desc" }, take: MAX_PER_RUN,
        select: { id: true, paypalOrderId: true, paymentMethod: true, amountCents: true, currency: true, payerEmail: true, createdAt: true, cryptoTxHash: true, media: { select: { title: true } } },
      }),
    ]);

    let sent = 0;
    let skipped = 0;
    let failedDeliveries = 0;
    const candidates = [
      ...pending.map((payment) => ({ payment, alertType: "PENDING_30_MIN", title: "Payment pending for over 30 minutes", intro: "A payment has remained pending and may need review." })),
      ...failed.map((payment) => ({ payment, alertType: "PAYMENT_FAILED", title: "Payment failed", intro: "A payment failed within the last 24 hours." })),
    ];

    for (const item of candidates) {
      const log = await claimAlert(item.payment.id, item.alertType);
      if (!log) { skipped++; continue; }
      const ok = await sendPaymentOperationalAlert({
        to: adminEmail, title: item.title, intro: item.intro,
        fields: [
          { label: "Payment record", value: item.payment.id },
          { label: "Order reference", value: item.payment.paypalOrderId },
          { label: "Method", value: item.payment.paymentMethod },
          { label: "Amount", value: `${(item.payment.amountCents / 100).toFixed(2)} ${item.payment.currency}` },
          { label: "Customer email", value: item.payment.payerEmail || "Not provided" },
          { label: "Media", value: item.payment.media.title || "Untitled media" },
          { label: "Created at (UTC)", value: item.payment.createdAt.toISOString() },
          ...(item.payment.cryptoTxHash ? [{ label: "Blockchain transaction", value: item.payment.cryptoTxHash }] : []),
        ],
      });
      await prisma.paymentAlertLog.update({
        where: { id: log!.id },
        data: { status: ok ? "SENT" : "FAILED", lastError: ok ? null : "Email delivery failed; it can be retried by a later scheduled run." },
      });
      if (ok) sent++; else failedDeliveries++;
    }

    return NextResponse.json({ ok: true, scanned: candidates.length, sent, skippedAsDuplicate: skipped, failedDeliveries });
  } catch (error) {
    console.error("Payment alert cron failed:", error);
    return NextResponse.json({ error: "Unable to process payment alerts." }, { status: 500 });
  }
}
