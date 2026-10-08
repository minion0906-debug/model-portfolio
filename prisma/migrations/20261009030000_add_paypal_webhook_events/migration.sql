CREATE TABLE "PayPalWebhookEvent" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "resourceId" TEXT,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayPalWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PayPalWebhookEvent_eventId_key" ON "PayPalWebhookEvent"("eventId");
CREATE INDEX "PayPalWebhookEvent_eventType_idx" ON "PayPalWebhookEvent"("eventType");
CREATE INDEX "PayPalWebhookEvent_processedAt_idx" ON "PayPalWebhookEvent"("processedAt");
