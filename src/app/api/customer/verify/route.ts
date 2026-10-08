import { NextResponse } from "next/server";
import { createCustomerSession, hashToken } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/purchases?error=invalid-link", request.url));

  const link = await prisma.magicLink.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!link || link.usedAt || link.expiresAt <= new Date()) {
    return NextResponse.redirect(new URL("/purchases?error=expired-link", request.url));
  }

  const purchase = await prisma.payment.findFirst({ where: { payerEmail: link.email, status: "COMPLETED" }, select: { id: true } });
  if (!purchase) return NextResponse.redirect(new URL("/purchases?error=no-purchases", request.url));

  await prisma.magicLink.update({ where: { id: link.id }, data: { usedAt: new Date() } });
  await createCustomerSession(link.email);
  return NextResponse.redirect(new URL("/purchases", request.url));
}
