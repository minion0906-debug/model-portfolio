-- Idempotent so this can be used with an existing schema or after `prisma db push`.
DO $$
BEGIN
  IF to_regclass('public."Payment"') IS NOT NULL THEN
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT NOT NULL DEFAULT 'PAYPAL';
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "cryptoTxHash" TEXT;
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "cryptoAmountBaseUnits" TEXT;
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "cryptoAllocationCents" INTEGER;
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paypalAllocationCents" INTEGER;
    ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "cryptoAllocationStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED';
    CREATE UNIQUE INDEX IF NOT EXISTS "Payment_cryptoTxHash_key" ON "Payment"("cryptoTxHash");
  END IF;
END $$;
