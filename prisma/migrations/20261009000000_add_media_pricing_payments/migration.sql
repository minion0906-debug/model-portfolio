ALTER TABLE "Media"
ADD COLUMN "priceCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

CREATE TABLE "Payment" (
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

CREATE UNIQUE INDEX "Payment_paypalOrderId_key" ON "Payment"("paypalOrderId");
CREATE UNIQUE INDEX "Payment_accessToken_key" ON "Payment"("accessToken");
CREATE INDEX "Payment_mediaId_idx" ON "Payment"("mediaId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_mediaId_fkey"
FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
