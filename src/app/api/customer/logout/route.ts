import { NextResponse } from "next/server";
import { clearCustomerSession } from "@/lib/customer-auth";

export async function POST(request: Request) {
  await clearCustomerSession();
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/html")) return NextResponse.redirect(new URL("/purchases", request.url));
  return NextResponse.json({ ok: true });
}
