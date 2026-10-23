# Step 15 — Payments Dashboard and CSV Export

This step includes the protected `/admin/payments` dashboard and adds CSV export for the transactions currently loaded under the active search, status, and date filters.

## Included

- Revenue, successful sales, refunds, and pending-payment summaries
- Search by buyer name/email, PayPal order ID, and media title
- Status and date filtering
- Responsive transaction list with payment method, buyer, media, and transaction identifiers
- PayPal refund action with a confirmation prompt
- CSV export for up to 250 currently loaded transactions
- CSV escaping and spreadsheet formula-injection mitigation for user-controlled fields
- Clear refunded-status presentation

## Database

The payments dashboard uses the `payerName` and `payerEmail` fields on `Payment`. If your database has not applied the migration, back up the database and run:

```bash
npm install
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
```

Do not run `prisma migrate reset` on a database containing production data.

## PayPal environment

Use PayPal Sandbox credentials for testing:

```env
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

CSV export contains the currently loaded filtered results and is capped at 250 rows. For a larger accounting export, use a server-side paginated export endpoint.
