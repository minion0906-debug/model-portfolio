import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-api";
import { ensureSiteSettings } from "@/lib/admin-settings";
import { prisma } from "@/lib/prisma";
import { getUsdtWallet } from "@/lib/ethereum-usdt";

export const dynamic = "force-dynamic";
const schema = z.object({
  usdtPaymentsEnabled: z.boolean(),
  usdtRequiredConfirmations: z.number().int().min(1).max(1000),
  usdtPaymentInstructions: z.string().trim().max(1000),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await ensureSiteSettings();
  const walletConfigured = Boolean(getUsdtWallet());
  const rpcConfigured = Boolean(process.env.ETHEREUM_RPC_URL?.trim());
  const paypalConfigured = Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
  return NextResponse.json({
    settings: {
      usdtPaymentsEnabled: settings.usdtPaymentsEnabled,
      usdtRequiredConfirmations: settings.usdtRequiredConfirmations,
      usdtPaymentInstructions: settings.usdtPaymentInstructions || "",
    },
    checks: { walletConfigured, rpcConfigured, paypalConfigured },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment settings. Confirmations must be between 1 and 1000." }, { status: 400 });
  const settings = await ensureSiteSettings();
  const updated = await prisma.siteSettings.update({
    where: { id: settings.id },
    data: parsed.data,
    select: { usdtPaymentsEnabled: true, usdtRequiredConfirmations: true, usdtPaymentInstructions: true },
  });
  return NextResponse.json({ settings: { ...updated, usdtPaymentInstructions: updated.usdtPaymentInstructions || "" } }, { headers: { "Cache-Control": "no-store" } });
}
