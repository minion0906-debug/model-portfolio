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

function isConnectionError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? error.code : undefined;
  return code === "P1017" || code === "P1001" || code === "P1002";
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

export function logDatabaseError(scope: string, error: unknown) {
  console.error(`[db:${scope}]`, error);
}
