import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";

const schema = z.object({ mediaId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid media item." }, { status: 400 });
    }

    const media = await prisma.media.findFirst({
      where: { id: parsed.data.mediaId, published: true },
      select: { id: true, type: true, title: true, priceCents: true, currency: true },
    });

    if (!media) return NextResponse.json({ error: "Media not found." }, { status: 404 });
    if (media.priceCents <= 0) {
      return NextResponse.json({ error: "This media item is free." }, { status: 400 });
    }

    const amount = (media.priceCents / 100).toFixed(2);
    const order = await createPayPalOrder({
      mediaId: media.id,
      title: media.title || `${media.type === "IMAGE" ? "Image" : "Video"} purchase`,
      amount,
      currency: media.currency || "USD",
    });

    const payment = await prisma.payment.create({
      data: {
        mediaId: media.id,
        paypalOrderId: order.id,
        amountCents: media.priceCents,
        currency: media.currency || "USD",
        accessToken: randomBytes(32).toString("hex"),
      },
      select: { id: true },
    });

    return NextResponse.json({ orderId: order.id, paymentId: payment.id });
  } catch (error) {
    console.error("PayPal order creation failed:", error);
    // Keep provider errors and configuration details in server logs only.
    return NextResponse.json(
      { error: "Unable to start PayPal checkout. Please try again later." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
