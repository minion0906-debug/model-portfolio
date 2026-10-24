CREATE TABLE "PaymentAuditEvent" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "actorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentAuditEvent_paymentId_createdAt_idx" ON "PaymentAuditEvent"("paymentId", "createdAt");
CREATE INDEX "PaymentAuditEvent_action_createdAt_idx" ON "PaymentAuditEvent"("action", "createdAt");
ALTER TABLE "PaymentAuditEvent" ADD CONSTRAINT "PaymentAuditEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
