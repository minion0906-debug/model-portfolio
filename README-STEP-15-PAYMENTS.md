# Step 15 — Admin Payments Dashboard

This step adds a protected `/admin/payments` dashboard for PayPal sales.

## Included

- Revenue total for completed payments
- Completed / pending / failed counters
- Search by buyer name, buyer email, PayPal order ID, or media title
- Status filter
- From/to date filters
- Responsive transaction table
- Media thumbnail/type/title
- Buyer name/email captured from PayPal when available
- PayPal order ID
- Amount/currency
- Capture/payment date
- Payments link in the admin sidebar
- Payment sales/revenue summary on the main admin dashboard

## Database migration

A new migration was added:

`prisma/migrations/20261009020000_add_payment_buyer_details/migration.sql`

It adds `payerName` and `payerEmail` to `Payment`.

For an existing database, DO NOT run `prisma migrate reset`.

After installing dependencies:

```bash
npm install
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
```

If the database already contains the changes from this migration but Prisma says it is pending, verify the columns first and then mark only this migration as applied:

```bash
npx prisma migrate resolve --applied 20261009020000_add_payment_buyer_details
```

Do not mark a migration as applied unless its SQL changes are already present in the database.

## PayPal

Existing PayPal environment variables remain required:

```env
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

Use Sandbox credentials for testing.
