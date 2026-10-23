# Step 16 — PayPal Webhook Reliability and Payment-State Hardening

This step hardens the server-side endpoint at `/api/paypal/webhook`.

## Configure PayPal

Add the webhook ID for the same PayPal REST app as your API credentials:

```env
PAYPAL_WEBHOOK_ID="YOUR_PAYPAL_WEBHOOK_ID"
```

Register this HTTPS endpoint in the PayPal Developer dashboard:

```text
https://YOUR-DOMAIN.com/api/paypal/webhook
```

Subscribe to `PAYMENT.CAPTURE.COMPLETED` and `PAYMENT.CAPTURE.REFUNDED`. The handler verifies each transmission with PayPal's signature-verification API before processing it.

## What changed

- Uses the related PayPal order ID for capture/refund events; it does not confuse a capture resource ID with the checkout order ID.
- Checks the signed capture event's status, amount, and currency against the locally created payment before marking it complete.
- Validates refund amount and currency before updating refund state.
- Prevents stale capture notifications from changing a failed or refunded payment back to completed.
- Records verified event IDs transactionally, so duplicate webhook deliveries are idempotent.
- Records and acknowledges other verified event types without accidentally changing payment state.
- Adds no database schema change.

## Deploy

```bash
npm install
npx prisma generate
npm run typecheck
npm run build
```

No migration is required for this step. Do not run `prisma migrate reset` against a production database. Configure `PAYPAL_WEBHOOK_ID` in your hosting provider and redeploy after registering the webhook. Use PayPal sandbox first, then production credentials and the production webhook ID.

## Important operational note

A verified webhook is authoritative only when its event details match the stored order. Review PayPal's event delivery dashboard and server logs when events are repeatedly retried. Test both successful captures and refunds in sandbox before relying on this in production.
