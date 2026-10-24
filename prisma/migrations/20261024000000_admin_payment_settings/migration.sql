ALTER TABLE "SiteSettings"
ADD COLUMN "usdtPaymentsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "usdtRequiredConfirmations" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN "usdtPaymentInstructions" TEXT;
