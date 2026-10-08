# Step 18 — Customer purchase recovery

Customers can recover purchases on a new browser/device using a one-time magic link.

## Environment
Set `RESEND_API_KEY` and `RESEND_FROM` for production email delivery.

For local development, if these are omitted, the API returns a development-only link in its JSON response so the flow can be tested without an email provider.

## Database
Run:

```bash
npx prisma generate
npx prisma migrate deploy
```

Do not run `prisma migrate reset` on an existing database.

## Flow
1. Customer visits `/account`.
2. Enters the email used for PayPal.
3. Server checks for a completed payment without revealing whether an email has purchases.
4. A single-use token expires after 15 minutes.
5. Verification creates a 30-day HttpOnly customer session.
6. Paid media access accepts either the original purchase token or the authenticated customer session.
