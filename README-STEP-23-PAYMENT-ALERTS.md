# Step 23 — Payment Operations Alerts

Adds a scheduled endpoint for admin email alerts when a payment has remained `PENDING` for at least 30 minutes or a payment has `FAILED` within the last 24 hours. Alerts are deduplicated per payment and alert type in `PaymentAlertLog`; failed email deliveries can be retried by a later run. The job processes up to 50 candidates per category per run.

## Environment variables

- `CRON_SECRET` — a random secret of at least 24 characters. The scheduled request must send `Authorization: Bearer <CRON_SECRET>`.
- `RESEND_API_KEY` and `RESEND_FROM` — required for production email delivery.
- `ADMIN_NOTIFICATION_EMAIL` — preferred alert recipient; falls back to the site contact email in admin settings.

## Schedule

Configure your hosting provider's scheduler to send a `GET` request to `/api/cron/payment-alerts` every 5–15 minutes with the authorization header. Do not expose the secret in a public URL or browser code. For example, use a secured server-side cron job rather than a client-side timer.

## Deploy

Back up the database, then run:

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run typecheck
npm run build
```

This job does not automatically retry or charge a payment, and it does not mark payments as successful. It only sends operational alerts. A pending alert is sent once per payment; a failed email delivery can be retried after five minutes. Test the scheduler and email delivery in staging first.
