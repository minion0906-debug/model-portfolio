# Step 16 — PayPal Webhook Hardening

This step adds a server-side PayPal webhook endpoint at `/api/paypal/webhook`.

## Environment

Add this to `.env.local`:

```env
PAYPAL_WEBHOOK_ID="YOUR_PAYPAL_WEBHOOK_ID"
```

Create/register the webhook in the PayPal Developer dashboard for the same REST app used by this project. Subscribe to `PAYMENT.CAPTURE.COMPLETED`. PayPal sends webhook notifications to an HTTPS endpoint and recommends signature verification before processing them.

## Database

After extracting the project:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

Do **not** run `npx prisma migrate reset` against the existing production database.

## Endpoint

Production URL:

```text
https://YOUR-DOMAIN.com/api/paypal/webhook
```

The endpoint verifies the PayPal transmission with PayPal's `verify-webhook-signature` API, records the event ID for idempotency, and marks the matching payment completed when `PAYMENT.CAPTURE.COMPLETED` is received.

PayPal can retry unsuccessful webhook deliveries, so the unique event ID prevents the same notification from being processed twice.
