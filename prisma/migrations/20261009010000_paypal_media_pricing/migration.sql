-- Add per-media pricing and one-time PayPal payment records.
ALTER TABLE "Media"
  ADD COLUMN IF NOT EXISTS "priceCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "paypalOrderId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "accessToken" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "capturedAt" TIMESTAMP(3),
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_paypalOrderId_key" ON "Payment"("paypalOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_accessToken_key" ON "Payment"("accessToken");
CREATE INDEX IF NOT EXISTS "Payment_mediaId_idx" ON "Payment"("mediaId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Payment_mediaId_fkey'
  ) THEN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_mediaId_fkey"
      FOREIGN KEY ("mediaId") REFERENCES "Media"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
