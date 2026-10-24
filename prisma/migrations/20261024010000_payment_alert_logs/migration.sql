CREATE TABLE "PaymentAlertLog" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentAlertLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentAlertLog_dedupeKey_key" ON "PaymentAlertLog"("dedupeKey");
CREATE INDEX "PaymentAlertLog_status_updatedAt_idx" ON "PaymentAlertLog"("status", "updatedAt");
CREATE INDEX "PaymentAlertLog_paymentId_alertType_idx" ON "PaymentAlertLog"("paymentId", "alertType");
ALTER TABLE "PaymentAlertLog" ADD CONSTRAINT "PaymentAlertLog_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
