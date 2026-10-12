# Vercel + Managed PostgreSQL deployment runbook

This project uses Next.js App Router, Prisma 6, PostgreSQL, S3-compatible object storage, and PayPal. Use a Vercel Preview deployment and a separate staging database before changing Production.

## 1. Project settings

- Framework preset: **Next.js**
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: leave the Vercel/Next.js default
- Node.js: **22.x** (also recorded in `.nvmrc`)
- Do not set a custom `output: "export"`; this app needs server routes and database access.

## 2. Environment variables

Set variables in Vercel Project → Settings → Environment Variables. Configure Preview and Production separately. Never commit `.env` files or paste secret values into issue trackers.

Required/commonly used values (check the code paths and existing deployment before changing names):

- `DATABASE_URL`: PostgreSQL connection URL for the matching environment. Prefer the provider's pooled/runtime URL if recommended for serverless access.
- `NEXT_PUBLIC_SITE_URL`: canonical origin for that environment, e.g. `https://your-preview-domain.vercel.app` for Preview and your real HTTPS domain for Production. Use only scheme + hostname + optional port; no path, query, or trailing route.
- `AUTH_SECRET`: long, random, unique secret; use a different value for Preview and Production.
- PayPal credentials and `PAYPAL_WEBHOOK_ID`: use sandbox credentials and the Preview webhook ID in Preview; use live credentials and the production webhook ID only in Production.
- Object-storage credentials and bucket/endpoint settings: scope to the correct staging/production bucket. Do not make paid/private assets public just to make previews work.
- Email provider settings, if used by the configured magic-link email transport.

Set secret variables as **Sensitive** in Vercel where available. `NEXT_PUBLIC_*` variables are bundled for browsers; never put secrets in them. Redeploy after changing environment variables.

## 3. Database safety

**This repository currently has no `prisma/migrations/` directory.** Do not run `prisma migrate reset`, `prisma db push`, or `prisma migrate dev` against Production as part of deployment. Those are not a safe production migration strategy.

1. Take a managed-provider backup/snapshot and verify you can restore it to a separate database.
2. Create a staging database from a recent backup (or an appropriately scrubbed copy).
3. Compare `prisma/schema.prisma` with the actual staging database before changing schema.
4. If a schema change is needed, create and review a migration in development against a disposable database, commit the migration directory, then apply the reviewed migration in staging first. Introduce a migration baseline carefully if the existing database was originally created with `db push`.
5. Do not point Preview at the Production database.

## 4. Pre-deployment checks

Run from the project root:

```bash
npm ci
npm run db:health
npm run typecheck
npm run lint
npm run build
```

The `db:health` script validates the Prisma schema; it does not prove the deployed database is reachable. The deployed runtime check is `GET /api/health`, which returns `200 {"status":"ok","database":"ok"}` when PostgreSQL responds, or `503 {"status":"unavailable"}` without exposing database details.

## 5. Preview smoke test

- Open the public portfolio and confirm images/videos load from the expected storage host.
- Sign in to the admin; verify gallery, hero, videos, settings, bookings, and messages.
- Submit a test contact form and booking, then verify the records in the admin.
- Test customer purchase recovery end-to-end; opening the email URL alone must not log the customer in, and the confirmation should only work once.
- In PayPal Sandbox, test order creation, capture, duplicate webhook delivery, refund, and duplicate refund delivery. Confirm a refunded payment cannot return to completed due to a late capture event.
- Confirm private/paid media is not accessible by a direct unauthenticated storage URL.
- Check `/api/health` returns 200. Do not use it as a replacement for functional checks.

## 6. Production rollout

1. Record the currently deployed Production deployment URL and commit SHA.
2. Confirm a recent restorable database backup and current environment variable configuration.
3. Merge the tested commit and deploy through Vercel; avoid manual edits to generated build output.
4. Smoke-test `/api/health`, public pages, admin login, a contact/booking submission, and the configured PayPal webhook.
5. Watch Vercel function logs and payment/webhook status for errors. Avoid logging tokens, passwords, connection URLs, or full payment payloads.

## 7. Rollback

- For an application-only regression, use Vercel's Deployments page to promote/redeploy the last known-good deployment. Verify environment variables still match the intended environment.
- Rolling back application code does **not** roll back database changes. This release adds no schema migration. For future schema changes, use backward-compatible expand/contract migrations and keep a separate database restore plan.
- Restore a database snapshot only when necessary and after evaluating data loss since the snapshot; coordinate this with the database provider and do not casually restore Production.
- After rollback, recheck `/api/health`, admin login, customer recovery, and PayPal event handling.

## Known remaining production work

- Add distributed rate limiting (Vercel WAF/edge protection or a shared Redis-compatible store) for admin login, contact, booking, and magic-link endpoints.
- Enforce upload size/type limits at the storage boundary and review direct-upload completion checks.
- Confirm private paid-media access uses authenticated/short-lived access and the bucket/origin does not expose original files publicly.
- Run `npm audit` in CI and review advisories rather than automatically applying major dependency upgrades.

## Gallery and video upload troubleshooting

See [`GALLERY-VIDEO-UPLOAD-FIX.md`](./GALLERY-VIDEO-UPLOAD-FIX.md) for required S3-compatible storage variables, bucket CORS configuration, and step-by-step upload verification.
