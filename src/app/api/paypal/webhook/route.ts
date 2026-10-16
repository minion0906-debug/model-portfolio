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
    let event: PayPalEvent;
    try {
      event = JSON.parse(rawBody) as PayPalEvent;
    } catch {
      return NextResponse.json({ error: "Invalid PayPal webhook." }, { status: 400 });
    }
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

    const orderId =
      event.resource?.supplementary_data?.related_ids?.order_id ||
      event.resource?.id;

    // Record the event and apply its state transition in one transaction. The
    // unique eventId constraint makes duplicate/concurrent deliveries idempotent.
    try {
      await prisma.$transaction(async (tx) => {
        await tx.payPalWebhookEvent.create({
          data: {
            eventId: event.id!,
            eventType: event.event_type!,
            resourceId: event.resource?.id || null,
          },
        });

        if (["PAYMENT.CAPTURE.COMPLETED", "PAYMENT.CAPTURE.REFUNDED"].includes(event.event_type!) && orderId) {
          const payment = await tx.payment.findUnique({ where: { paypalOrderId: orderId } });
          if (payment && !(event.event_type === "PAYMENT.CAPTURE.COMPLETED" && payment.status === "REFUNDED")) {
            await tx.payment.update({
              where: { id: payment.id },
              data: event.event_type === "PAYMENT.CAPTURE.REFUNDED"
                ? {
                    status: "REFUNDED",
                    refundedAt: new Date(),
                    refundId: event.resource?.id || undefined,
                    refundAmountCents: event.resource?.amount?.value && Number.isFinite(Number(event.resource.amount.value))
                      ? Math.round(Number(event.resource.amount.value) * 100)
                      : payment.amountCents,
                    refundReason: "PayPal refund webhook",
                  }
                : {
                    status: "COMPLETED",
                    capturedAt: payment.capturedAt || new Date(),
                    paymentMethod: "PAYPAL",
                    cryptoAllocationCents: Math.round(payment.amountCents * 0.4),
                    paypalAllocationCents: payment.amountCents - Math.round(payment.amountCents * 0.4),
                    cryptoAllocationStatus: "MANUAL_REQUIRED",
                  },
            });
          }
        }
      });
    } catch (error) {
      // Another delivery may have inserted the unique event ID first.
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook failed:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
