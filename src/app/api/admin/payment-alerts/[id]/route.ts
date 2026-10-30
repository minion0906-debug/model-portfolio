import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ensureSiteSettings } from "@/lib/admin-settings";
import { sendPaymentOperationalAlert } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const existing = await prisma.paymentAlertLog.findUnique({ where: { id }, include: { payment: { include: { media: { select: { title: true } } } } } });
    if (!existing) return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    if (existing.status !== "FAILED") return NextResponse.json({ error: "Only failed alerts can be retried." }, { status: 409 });
    const claimed = await prisma.paymentAlertLog.updateMany({ where: { id, status: "FAILED" }, data: { status: "PROCESSING", attempts: { increment: 1 }, lastError: null } });
    if (claimed.count !== 1) return NextResponse.json({ error: "This alert is already being processed." }, { status: 409 });
    const settings = await ensureSiteSettings();
    const to = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || settings.email?.trim();
    if (!to) {
      await prisma.paymentAlertLog.update({ where: { id }, data: { status: "FAILED", lastError: "No admin notification email is configured." } });
      return NextResponse.json({ error: "Configure ADMIN_NOTIFICATION_EMAIL or the site contact email." }, { status: 503 });
    }
    const payment = existing.payment;
    const ok = await sendPaymentOperationalAlert({
      to,
      title: existing.alertType === "PAYMENT_FAILED" ? "Payment failed — manual alert retry" : "Payment pending — manual alert retry",
      intro: `An administrator manually retried this alert. Retried by ${admin.email}.`,
      fields: [
        { label: "Payment record", value: payment.id },
        { label: "Order reference", value: payment.paypalOrderId },
        { label: "Method", value: payment.paymentMethod },
        { label: "Amount", value: `${(payment.amountCents / 100).toFixed(2)} ${payment.currency}` },
        { label: "Payment status", value: payment.status },
        { label: "Customer email", value: payment.payerEmail || "Not provided" },
        { label: "Media", value: payment.media.title || "Untitled media" },
        { label: "Created at (UTC)", value: payment.createdAt.toISOString() },
        ...(payment.cryptoTxHash ? [{ label: "Blockchain transaction", value: payment.cryptoTxHash }] : []),
      ],
    });
    await prisma.paymentAlertLog.update({ where: { id }, data: { status: ok ? "SENT" : "FAILED", lastError: ok ? null : "Manual email delivery failed." } });
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Email delivery failed. Check your Resend configuration and retry later." }, { status: 502 });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json({ error: unauthorized ? "Unauthorized" : "Unable to retry payment alert." }, { status: unauthorized ? 401 : 500 });
  }
}
