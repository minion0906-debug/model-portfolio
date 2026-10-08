# Step 19 — Refunds & reconciliation

Admin payments now support PayPal refunds. Refunds are server-side only, require an admin session, verify the original completed PayPal capture, and mark the payment REFUNDED. Paid-media access is denied after the payment is refunded because access checks payment status.

Run:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Do not run `prisma migrate reset` on an existing database.

The refund endpoint is POST `/api/admin/payments/:id/refund` and accepts `{ "reason": "..." }`.
