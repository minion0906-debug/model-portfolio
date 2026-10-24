import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRecovery: Promise<void> | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? error.code : undefined;
  if (code === "P1017" || code === "P1001" || code === "P1002") {
    return true;
  }

  const message =
    ("message" in error && typeof error.message === "string" ? error.message : "") +
    ("cause" in error && error.cause && typeof error.cause === "object" && "message" in error.cause && typeof error.cause.message === "string" ? ` ${error.cause.message}` : "");

  if (!message) return false;

  const normalized = message.toLowerCase();
  return (
    normalized.includes("can\'t reach database server") ||
    normalized.includes("please make sure your database server is running") ||
    normalized.includes("database server is running at") ||
    normalized.includes("could not connect to server") ||
    normalized.includes("connection refused") ||
    normalized.includes("econnrefused") ||
    normalized.includes("timeout while connecting to the database") ||
    normalized.includes("tcp connect") ||
    normalized.includes("connection to database failed")
  );
}

async function recoverConnection() {
  if (!globalForPrisma.prismaRecovery) {
    globalForPrisma.prismaRecovery = (async () => {
      try {
        await prisma.$disconnect();
      } catch {
        // The connection may already be gone.
      }

      await prisma.$connect();
    })().finally(() => {
      globalForPrisma.prismaRecovery = undefined;
    });
  }

  return globalForPrisma.prismaRecovery;
}

/**
 * Executes a Prisma operation once and transparently recovers from a stale
 * PostgreSQL connection. It intentionally retries only connection failures;
 * application/query errors must still fail normally.
 */
export async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isConnectionError(error)) throw error;

    console.warn("[db] PostgreSQL connection was closed; reconnecting once.");
    await recoverConnection();
    return operation();
  }
}

export function shouldSkipDatabaseForBuild(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" &&
    process.env.SKIP_DB_DURING_BUILD !== "false"
  );
}

export function logDatabaseError(scope: string, error: unknown) {
  console.error(`[db:${scope}]`, error);
}
