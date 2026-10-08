import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/paypal";

export const runtime = "nodejs";

type PayPalEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { value?: string; currency_code?: string };
    supplementary_data?: { related_ids?: { order_id?: string } };
    custom_id?: string;
    purchase_units?: Array<{ custom_id?: string }>;
  };
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody) as PayPalEvent;
    const transmissionId = request.headers.get("paypal-transmission-id");
    const transmissionTime = request.headers.get("paypal-transmission-time");
    const transmissionSig = request.headers.get("paypal-transmission-sig");
    const certUrl = request.headers.get("paypal-cert-url");
    const authAlgo = request.headers.get("paypal-auth-algo") || "SHA256withRSA";

    if (!event.id || !event.event_type || !transmissionId || !transmissionTime || !transmissionSig || !certUrl) {
      return NextResponse.json({ error: "Invalid PayPal webhook." }, { status: 400 });
    }

    const valid = await verifyPayPalWebhook({
      transmissionId,
      transmissionTime,
      transmissionSig,
      certUrl,
      authAlgo,
      webhookEvent: event,
    });

    if (!valid) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });

    const existing = await prisma.payPalWebhookEvent.findUnique({ where: { eventId: event.id } });
    if (existing) return NextResponse.json({ received: true, duplicate: true });

    const orderId =
      event.resource?.supplementary_data?.related_ids?.order_id ||
      event.resource?.id;

    if (["PAYMENT.CAPTURE.COMPLETED", "PAYMENT.CAPTURE.REFUNDED"].includes(event.event_type) && orderId) {
      const payment = await prisma.payment.findUnique({ where: { paypalOrderId: orderId } });
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: event.event_type === "PAYMENT.CAPTURE.REFUNDED"
            ? {
                status: "REFUNDED",
                refundedAt: new Date(),
                refundId: event.resource?.id || undefined,
                refundAmountCents: event.resource?.amount?.value ? Math.round(Number(event.resource.amount.value) * 100) : payment.amountCents,
                refundReason: "PayPal refund webhook",
              }
            : {
                status: "COMPLETED",
                capturedAt: payment.capturedAt || new Date(),
              },
        });
      }
    }

    await prisma.payPalWebhookEvent.create({
      data: {
        eventId: event.id,
        eventType: event.event_type,
        resourceId: event.resource?.id || null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook failed:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
