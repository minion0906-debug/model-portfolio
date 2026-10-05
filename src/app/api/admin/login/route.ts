import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please enter a valid email and password." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const email = result.data.email.trim().toLowerCase();

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const validPassword = await bcrypt.compare(
      result.data.password,
      admin.passwordHash,
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    await createAdminSession(admin.id);

    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 },
    );
  }
}
