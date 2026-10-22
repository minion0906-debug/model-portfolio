# Step 14 — Admin Analytics

Adds a protected `/admin/analytics` page with six-month booking request trends, completed-sales/revenue trends, all-time booking and payment KPIs, and an accepted/completed booking share. Adds Analytics to the admin navigation and dashboard quick actions.

## Notes
- Uses existing Prisma models and requires no schema migration.
- Booking trends are grouped by submission date.
- Sales trends use `capturedAt` when present, otherwise the payment creation date, and include only `COMPLETED` payments.
- Revenue is formatted as USD and does not subtract refunds; review the Payments page for refund details.
- The page loads from the server and is protected by the existing admin layout.

## Verify locally

```bash
npm install
npx prisma generate
npm run typecheck
npm run build
```

This ZIP was integrity-checked. Full application typechecking/build must be run in the project environment with dependencies and a configured database.
