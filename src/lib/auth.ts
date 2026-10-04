import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "model_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  adminId: string;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function createSessionToken(adminId: string) {
  const payload = encodePayload({
    adminId,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  });

  return `${payload}.${signPayload(payload)}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (
      typeof parsed.adminId !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Date.now()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function createAdminSession(adminId: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: createSessionToken(adminId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = verifySessionToken(token);

  if (!session) return null;

  return prisma.admin.findUnique({
    where: {
      id: session.adminId,
    },
    select: {
      id: true,
      email: true,
    },
  });
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }

  return admin;
}

export function generateAuthSecret() {
  return randomBytes(32).toString("hex");
}
