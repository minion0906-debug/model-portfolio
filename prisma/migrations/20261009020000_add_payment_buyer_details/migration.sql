ALTER TABLE "Payment" ADD COLUMN "payerName" TEXT;
ALTER TABLE "Payment" ADD COLUMN "payerEmail" TEXT;
CREATE INDEX "Payment_payerEmail_idx" ON "Payment"("payerEmail");
