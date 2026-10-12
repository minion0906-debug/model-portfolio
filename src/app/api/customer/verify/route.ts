import { NextResponse } from "next/server";
import { createCustomerSession, hashToken } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

// Email security scanners often prefetch GET links. A GET must never consume a
// one-time token or create a session; it only sends the user to a confirmation page.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return NextResponse.redirect(new URL("/purchases?error=invalid-link", url));
  }

  return NextResponse.redirect(new URL(`/purchases/verify?token=${encodeURIComponent(token)}`, url));
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    return NextResponse.redirect(new URL("/purchases?error=invalid-link", request.url), 303);
  }

  try {
    const now = new Date();
    const link = await prisma.magicLink.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!link || link.usedAt || link.expiresAt <= now) {
      return NextResponse.redirect(new URL("/purchases?error=expired-link", request.url), 303);
    }

    const purchase = await prisma.payment.findFirst({
      where: { payerEmail: link.email, status: "COMPLETED" },
      select: { id: true },
    });
    if (!purchase) {
      return NextResponse.redirect(new URL("/purchases?error=no-purchases", request.url), 303);
    }

    // Conditional update makes token redemption single-use under concurrent POSTs.
    const consumed = await prisma.magicLink.updateMany({
      where: { id: link.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (consumed.count !== 1) {
      return NextResponse.redirect(new URL("/purchases?error=expired-link", request.url), 303);
    }

    await createCustomerSession(link.email);
    return NextResponse.redirect(new URL("/purchases", request.url), 303);
  } catch (error) {
    console.error("Customer verification failed:", error);
    return NextResponse.redirect(new URL("/purchases?error=verification-failed", request.url), 303);
  }
}
