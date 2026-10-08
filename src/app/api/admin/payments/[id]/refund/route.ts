import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getPayPalOrder, refundPayPalCapture } from "@/lib/paypal";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => ({})) as { reason?: string };
    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    if (payment.status !== "COMPLETED") return NextResponse.json({ error: "Only completed payments can be refunded." }, { status: 400 });
    if (payment.refundedAt || payment.refundId) return NextResponse.json({ error: "This payment has already been refunded." }, { status: 409 });

    const order = await getPayPalOrder(payment.paypalOrderId);
    const capture = order.purchase_units?.[0]?.payments?.captures?.find((item: { id?: string; status?: string }) => item.status === "COMPLETED");
    if (!capture?.id) return NextResponse.json({ error: "No completed PayPal capture was found." }, { status: 400 });

    const refund = await refundPayPalCapture({
      captureId: capture.id,
      currency: payment.currency,
      note: body.reason || "Refund issued by administrator.",
    });

    const refundAmountCents = refund.amount?.value ? Math.round(Number(refund.amount.value) * 100) : payment.amountCents;
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
        refundId: refund.id,
        refundAmountCents,
        refundReason: body.reason?.trim().slice(0, 500) || null,
      },
    });

    return NextResponse.json({ success: true, refundId: refund.id, status: "REFUNDED" });
  } catch (error) {
    console.error("Admin PayPal refund failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to refund payment." }, { status: 500 });
  }
}
