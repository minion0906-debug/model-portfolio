import { NextResponse } from "next/server";
import { getUsdtWallet } from "@/lib/ethereum-usdt";
export const dynamic = "force-dynamic";
export async function GET() {
  const wallet = getUsdtWallet();
  return NextResponse.json({ enabled: Boolean(wallet && process.env.ETHEREUM_RPC_URL), network: "Ethereum Mainnet", token: "USDT", tokenContract: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, wallet: wallet || null, requiredConfirmations: Number(process.env.ERC20_REQUIRED_CONFIRMATIONS || "12") }, { headers: { "Cache-Control": "no-store" } });
}
