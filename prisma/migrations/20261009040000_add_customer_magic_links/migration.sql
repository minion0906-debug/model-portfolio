CREATE TABLE "CustomerSession" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CustomerSession_tokenHash_key" ON "CustomerSession"("tokenHash");
CREATE INDEX "CustomerSession_email_idx" ON "CustomerSession"("email");
CREATE INDEX "CustomerSession_expiresAt_idx" ON "CustomerSession"("expiresAt");

CREATE TABLE "MagicLink" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MagicLink_tokenHash_key" ON "MagicLink"("tokenHash");
CREATE INDEX "MagicLink_email_idx" ON "MagicLink"("email");
CREATE INDEX "MagicLink_expiresAt_idx" ON "MagicLink"("expiresAt");
