import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/customer-auth";
import { sendMagicLink } from "@/lib/magic-email";

const schema = z.object({ email: z.string().trim().email().max(320) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    const email = parsed.data.email.toLowerCase();

    const purchase = await prisma.payment.findFirst({ where: { payerEmail: email, status: "COMPLETED" }, select: { id: true } });
    // Always return the same public response to avoid account/purchase enumeration.
    if (!purchase) return NextResponse.json({ ok: true, message: "If purchases exist for that email, a secure link has been sent." });

    await prisma.magicLink.deleteMany({ where: { email, usedAt: null } });
    const raw = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.magicLink.create({ data: { email, tokenHash: hashToken(raw), expiresAt } });

    const origin = new URL(request.url).origin;
    const result = await sendMagicLink(email, `${origin}/api/customer/verify?token=${raw}`);
    return NextResponse.json({ ok: true, message: "If purchases exist for that email, a secure link has been sent.", ...(result.developmentLink ? { developmentLink: result.developmentLink } : {}) });
  } catch (error) {
    console.error("Magic link request failed:", error);
    return NextResponse.json({ error: "Unable to send the access link right now." }, { status: 500 });
  }
}
