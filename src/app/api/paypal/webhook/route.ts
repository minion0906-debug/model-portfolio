import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PayPalEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { value?: string; currency_code?: string };
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
};

function amountToCents(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

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

    // Capture/refund events identify the order through related_ids.order_id.
    // resource.id is a capture/refund ID, not the checkout order ID.
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    const isCaptureCompleted = event.event_type === "PAYMENT.CAPTURE.COMPLETED";
    const isCaptureRefunded = event.event_type === "PAYMENT.CAPTURE.REFUNDED";

    try {
      await prisma.$transaction(async (tx) => {
        await tx.payPalWebhookEvent.create({
          data: {
            eventId: event.id!,
            eventType: event.event_type!,
            resourceId: event.resource?.id || null,
          },
        });

        // Acknowledge and record other valid PayPal event types without applying
        // payment state changes. PayPal retries are made idempotent by eventId.
        if ((!isCaptureCompleted && !isCaptureRefunded) || !orderId) return;

        const payment = await tx.payment.findUnique({ where: { paypalOrderId: orderId } });
        if (!payment) return;

        if (isCaptureCompleted) {
          const eventCents = amountToCents(event.resource?.amount?.value);
          const eventCurrency = event.resource?.amount?.currency_code;
          // Never mark a payment paid unless the signed event agrees with our
          // persisted amount/currency. Never resurrect refunded/failed payments.
          if (
            event.resource?.status !== "COMPLETED" ||
            eventCents !== payment.amountCents ||
            eventCurrency !== payment.currency ||
            payment.status === "REFUNDED" ||
            payment.status === "FAILED"
          ) return;

          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "COMPLETED",
              capturedAt: payment.capturedAt || new Date(),
              paymentMethod: "PAYPAL",
              cryptoAllocationCents: Math.round(payment.amountCents * 0.4),
              paypalAllocationCents: payment.amountCents - Math.round(payment.amountCents * 0.4),
              cryptoAllocationStatus: payment.cryptoAllocationStatus === "NOT_REQUIRED"
                ? "MANUAL_REQUIRED"
                : payment.cryptoAllocationStatus,
            },
          });
          return;
        }

        // Do not allow a stale refund notification to overwrite a failed or
        // unrelated payment, and require a valid amount in the payment currency.
        if (payment.status !== "COMPLETED" && payment.status !== "REFUNDED") return;
        const refundCents = amountToCents(event.resource?.amount?.value);
        const refundCurrency = event.resource?.amount?.currency_code;
        if (refundCurrency !== payment.currency || refundCents === null || refundCents > payment.amountCents) return;

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "REFUNDED",
            refundedAt: payment.refundedAt || new Date(),
            refundId: event.resource?.id || undefined,
            refundAmountCents: refundCents,
            refundReason: "PayPal refund webhook",
          },
        });
      });
    } catch (error) {
      // Concurrent duplicate deliveries can race on the unique eventId.
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw error;
    }

    return NextResponse.json({ received: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PayPal webhook failed:", error);
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
