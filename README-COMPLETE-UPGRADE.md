# Complete upgrade notes

This upgrade is designed to preserve the existing Next.js, Prisma, PostgreSQL, admin CMS, media storage, and PayPal architecture. It does not require a schema migration.

## Changes included

- Customer purchase recovery links no longer create a session or consume the token on `GET`. The email link now opens a confirmation page, and an explicit `POST` redeems the token.
- Magic-link redemption uses a conditional database update so two concurrent submissions cannot both consume the same token.
- PayPal webhook event insertion and payment status changes now happen in one database transaction. The unique event ID is used to safely acknowledge duplicate/concurrent deliveries, and a late capture event cannot change an already-refunded payment back to completed.
- Malformed PayPal webhook JSON returns `400` instead of being treated as a server error.
- Added this deployment and verification guide.

## Safe deployment procedure

1. Back up the production PostgreSQL database and verify the backup can be restored to a separate database.
2. Deploy to staging with the same environment variable names but sandbox PayPal credentials and a staging webhook ID.
3. Install from the lockfile and run checks:

   ```bash
   npm ci
   npm run db:health
   npm run typecheck
   npm run lint
   npm run build
   ```

4. Test purchase recovery: request an email link, open it without pressing the confirmation button (no login should occur), then confirm it once (login should succeed); re-submit the same link (it should fail).
5. Test PayPal in sandbox: successful capture, duplicate webhook delivery, refund, duplicate refund event, and a capture-completed event arriving after refund.
6. Confirm the deployed environment uses a unique `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` set to the canonical HTTPS origin, production PayPal credentials only when ready, and the matching `PAYPAL_WEBHOOK_ID`.
7. Roll out during a low-traffic window and keep the previous deployment available for rollback. No database migration is introduced by this patch.

## Production items that still need infrastructure or manual verification

- Add distributed rate limiting at the hosting edge/WAF or a shared Redis-compatible store for admin login, contact, booking, and magic-link requests. In-memory limits do not work reliably across serverless instances.
- Enforce upload byte-size limits at the object-storage boundary, not only from client-declared metadata.
- Verify private paid media cannot be fetched directly from a public storage bucket or predictable origin URL.
- Verify the production database backup/restore, PayPal webhook configuration, refund policy, TLS, monitoring, log redaction, and rollback plan.
- Run `npm audit` and review findings in the actual deployment environment. Do not automatically apply major-version upgrades to a live site without staging tests.

## Important

The uploaded project archive does not include production environment secrets, hosting configuration, or access to the live database. This patch can be prepared and statically checked here, but deployment and real PayPal/database verification must be done in your hosting environment.
