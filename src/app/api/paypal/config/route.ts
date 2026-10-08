import { NextResponse } from "next/server";
import { getPayPalClientId, getPayPalClientScriptUrl } from "@/lib/paypal";

export async function GET() {
  try {
    return NextResponse.json({
      clientId: getPayPalClientId(),
      scriptUrl: getPayPalClientScriptUrl(),
      environment: process.env.PAYPAL_ENVIRONMENT === "production" ? "production" : "sandbox",
    });
  } catch {
    return NextResponse.json(
      { error: "PayPal is not configured yet." },
      { status: 503 },
    );
  }
}
