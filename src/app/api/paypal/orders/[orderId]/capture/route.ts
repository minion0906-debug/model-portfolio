import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/paypal";

type Context = { params: Promise<{ orderId: string }> };

export async function POST(_: Request, { params }: Context) {
  const { orderId } = await params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { paypalOrderId: orderId },
      include: {
        media: {
          select: { id: true, published: true, priceCents: true, currency: true },
        },
      },
    });

    if (!payment || !payment.media.published) {
      return NextResponse.json({ error: "Payment session not found." }, { status: 404 });
    }

    if (payment.status === "COMPLETED") {
      const cookieStore = await cookies();
      cookieStore.set(`media_access_${payment.mediaId}`, payment.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return NextResponse.json({ success: true, mediaId: payment.mediaId });
    }

    const data = await capturePayPalOrder(orderId);
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    const paidValue = Number(capture?.amount?.value || 0);
    const paidCurrency = capture?.amount?.currency_code || "";

    if (
      data.status !== "COMPLETED" ||
      capture?.status !== "COMPLETED" ||
      paidValue !== payment.amountCents / 100 ||
      paidCurrency !== payment.currency
    ) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "PayPal payment verification failed." }, { status: 400 });
    }

    const customId = data.purchase_units?.[0]?.custom_id;
    if (customId !== payment.mediaId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Payment item verification failed." }, { status: 400 });
    }

    const payerName = [data.payer?.name?.given_name, data.payer?.name?.surname]
      .filter(Boolean)
      .join(" ") || null;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        capturedAt: new Date(),
        payerName,
        payerEmail: data.payer?.email_address || null,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(`media_access_${payment.mediaId}`, payment.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({ success: true, mediaId: payment.mediaId });
  } catch (error) {
    console.error("PayPal capture failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to capture PayPal payment." },
      { status: 500 },
    );
  }
}
