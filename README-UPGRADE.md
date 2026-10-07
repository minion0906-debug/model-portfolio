# Model Portfolio — Stability Upgrade

## What changed

- Added Prisma connection recovery for P1001/P1002/P1017 connection failures.
- Added structured database logging instead of silently swallowing failures.
- Added 60-second cached public portfolio reads with the `public-portfolio` cache tag.
- Added `/api/health` for a direct PostgreSQL connectivity check.
- Hardened the image lightbox for arbitrary S3/R2/CDN URLs without Next Image remote-host configuration.
- Added graceful image-load failure UI.
- Prevented gallery pagination from becoming invalid after filtering.
- Added TypeScript `noImplicitReturns` and `noFallthroughCasesInSwitch` checks.
- Added `typecheck`, `db:studio`, and `db:health` scripts.

## Database diagnosis

Run:

```bash
npm run db:health
npm run typecheck
```

With the dev server running, visit:

```text
/api/health
```

A healthy database should return JSON containing `"ok": true` and a `latencyMs` value.

If it returns HTTP 503, fix `DATABASE_URL`, PostgreSQL availability, SSL, or pooler settings before troubleshooting the UI.

## Public data cache

Public gallery, video, hero, and settings data is cached for 60 seconds. After admin mutations, call `revalidateTag("public-portfolio", "max")` from the mutation layer to publish changes immediately instead of waiting for the TTL.
