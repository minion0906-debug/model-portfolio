import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { verifyUsdtTransfer } from "@/lib/ethereum-usdt";
import { ensureSiteSettings } from "@/lib/admin-settings";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Context) {
  let paymentId = "";
  let actorEmail: string | null = null;
  try {
    const admin = await requireAdmin();
    actorEmail = admin.email;
    const { id } = await params;
    paymentId = id;
    const payment = await prisma.payment.findUnique({ where: { id }, select: { id: true, paymentMethod: true, status: true, cryptoTxHash: true, amountCents: true, currency: true } });
    if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    if (payment.paymentMethod !== "ERC20_USDT") return NextResponse.json({ error: "Only Ethereum USDT payments can be reconciled here." }, { status: 400 });
    if (payment.status === "COMPLETED") return NextResponse.json({ error: "This payment is already completed." }, { status: 409 });
    if (payment.status === "REFUNDED" || payment.status === "FAILED") return NextResponse.json({ error: `Payments with status ${payment.status} cannot be reconciled.` }, { status: 409 });
    if (!payment.cryptoTxHash || !/^0x[a-fA-F0-9]{64}$/.test(payment.cryptoTxHash)) return NextResponse.json({ error: "No valid transaction hash is stored for this payment." }, { status: 400 });
    if (payment.currency.toUpperCase() !== "USD") return NextResponse.json({ error: "USDT reconciliation currently supports USD-priced payments only." }, { status: 400 });

    const paymentSettings = await ensureSiteSettings();
    const verified = await verifyUsdtTransfer({ txHash: payment.cryptoTxHash, expectedAmountBaseUnits: BigInt(payment.amountCents) * 10_000n, requiredConfirmations: paymentSettings.usdtRequiredConfirmations });
    if (!verified.confirmed) {
      await prisma.paymentAuditEvent.create({ data: { paymentId: payment.id, action: "USDT_RECONCILIATION_PENDING", details: `Confirmations ${verified.confirmations}/${verified.requiredConfirmations}`, actorEmail } });
      return NextResponse.json({ pending: true, confirmations: verified.confirmations, requiredConfirmations: verified.requiredConfirmations, message: `Still awaiting blockchain confirmations (${verified.confirmations}/${verified.requiredConfirmations}).` }, { status: 202, headers: { "Cache-Control": "no-store" } });
    }

    const result = await prisma.$transaction(async (tx) => {
      const changed = await tx.payment.updateMany({ where: { id: payment.id, status: "PENDING", paymentMethod: "ERC20_USDT" }, data: { status: "COMPLETED", capturedAt: new Date(), cryptoAmountBaseUnits: verified.amountBaseUnits } });
      if (changed.count !== 1) return false;
      await tx.paymentAuditEvent.create({ data: { paymentId: payment.id, action: "USDT_RECONCILED_COMPLETED", details: `Verified ${verified.confirmations}/${verified.requiredConfirmations} confirmations at block ${verified.blockNumber}`, actorEmail } });
      return true;
    });
    if (!result) return NextResponse.json({ error: "Payment status changed during reconciliation. Refresh and review the current status." }, { status: 409 });
    return NextResponse.json({ success: true, status: "COMPLETED", confirmations: verified.confirmations, requiredConfirmations: verified.requiredConfirmations });
  } catch (error) {
    if (paymentId) {
      const safeMessage = error instanceof Error ? error.message.slice(0, 300) : "Unknown verification error";
      await prisma.paymentAuditEvent.create({ data: { paymentId, action: "USDT_RECONCILIATION_FAILED", details: safeMessage, actorEmail } }).catch(() => undefined);
    }
    console.error("Admin USDT reconciliation failed:", error);
    const message = error instanceof Error && !/UNAUTHORIZED|AUTH_SECRET/.test(error.message) ? error.message : "Unable to reconcile this payment.";
    return NextResponse.json({ error: message }, { status: /UNAUTHORIZED/.test(error instanceof Error ? error.message : "") ? 401 : 500, headers: { "Cache-Control": "no-store" } });
  }
}
