import { NextResponse } from "next/server";
import { getUsdtWallet } from "@/lib/ethereum-usdt";
import { ensureSiteSettings } from "@/lib/admin-settings";
export const dynamic = "force-dynamic";
export async function GET() {
  const [settings, wallet] = await Promise.all([ensureSiteSettings(), Promise.resolve(getUsdtWallet())]);
  const enabled = Boolean(settings.usdtPaymentsEnabled && wallet && process.env.ETHEREUM_RPC_URL);
  return NextResponse.json({ enabled, network: "Ethereum Mainnet", token: "USDT", tokenContract: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, wallet: enabled ? wallet : null, requiredConfirmations: settings.usdtRequiredConfirmations, instructions: settings.usdtPaymentInstructions || null }, { headers: { "Cache-Control": "no-store" } });
}
