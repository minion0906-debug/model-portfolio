import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyUsdtTransfer } from "@/lib/ethereum-usdt";

export const runtime = "nodejs";
const schema = z.object({ mediaId: z.string().min(1), txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Provide a valid media item and Ethereum transaction hash." }, { status: 400 });
  try {
    const media = await prisma.media.findFirst({ where: { id: parsed.data.mediaId, published: true }, select: { id: true, priceCents: true, currency: true } });
    if (!media || media.priceCents <= 0) return NextResponse.json({ error: "Paid media item not found." }, { status: 404 });
    if (media.currency.toUpperCase() !== "USD") return NextResponse.json({ error: "USDT checkout currently supports USD-priced items only." }, { status: 400 });
    const existing = await prisma.payment.findUnique({ where: { cryptoTxHash: parsed.data.txHash.toLowerCase() } });
    if (existing) return NextResponse.json({ error: "This transaction has already been used." }, { status: 409 });
    const verified = await verifyUsdtTransfer({ txHash: parsed.data.txHash, expectedAmountBaseUnits: BigInt(media.priceCents) * 10_000n });
    const token = randomBytes(32).toString("hex");
    const payment = await prisma.payment.create({ data: {
      mediaId: media.id,
      paypalOrderId: `CRYPTO_${parsed.data.txHash.toLowerCase()}`,
      paymentMethod: "ERC20_USDT",
      cryptoTxHash: parsed.data.txHash.toLowerCase(),
      cryptoAmountBaseUnits: verified.amountBaseUnits,
      amountCents: media.priceCents,
      currency: "USD",
      status: "COMPLETED",
      cryptoAllocationStatus: "NOT_REQUIRED",
      accessToken: token,
      capturedAt: new Date(),
    } });
    const cookieStore = await cookies();
    cookieStore.set(`media_access_${payment.mediaId}`, payment.accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return NextResponse.json({ success: true, mediaId: payment.mediaId, txHash: parsed.data.txHash, amountBaseUnits: verified.amountBaseUnits, confirmations: verified.confirmations });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "This transaction has already been used." }, { status: 409 });
    console.error("ERC-20 payment verification failed:", error);
    const message = error instanceof Error && /confirmations|transaction|USDT|wallet|price|Ethereum/i.test(error.message) ? error.message : "Unable to verify this blockchain payment right now.";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
