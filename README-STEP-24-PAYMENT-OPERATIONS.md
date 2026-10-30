# Step 24 — Payment Operations Dashboard

Adds an authenticated admin workspace at `/admin/payment-operations`.

## Included
- Payment alert delivery history (latest 100 records)
- Summary counts for sent alerts in the last 24 hours, failed alerts, processing alerts, pending payments, and recent failed payments
- Manual retry for failed alert emails, with an atomic status claim to prevent two admins from retrying the same alert simultaneously
- Admin-only API endpoints; no new database migration is required

## Setup
This feature reuses the Step 23 `PaymentAlertLog` table and existing Resend configuration:
- `RESEND_API_KEY`
- `RESEND_FROM`
- `ADMIN_NOTIFICATION_EMAIL` (or the site contact email in settings)

Ensure the Step 23 database migration has been applied before deploying. Sign in to the admin panel and open **Payment operations** in the sidebar.

## Safety notes
Manual retry resends an operational email only. It does not alter payment status, issue refunds, capture funds, or change customer access. Retry is available only for alert records in `FAILED` state.
