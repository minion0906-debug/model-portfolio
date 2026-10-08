# Production Readiness & Security Review

This is a code-level hardening pass, not a certification or proof that the application is safe to launch. Run the checklist in the target deployment environment before accepting real payments.

## Changes in this pass

- Added baseline security response headers: MIME sniffing protection, clickjacking protection, a strict referrer policy, and a restrictive permissions policy.
- Added HSTS for production mode only. Deploy behind HTTPS before enabling production traffic; HSTS does not replace TLS configuration.
- Removed duplicate `Content-Disposition` header construction in the local-media response.
- Changed public PayPal order/capture error responses to generic messages so provider/configuration details are not exposed to visitors. Detailed diagnostics remain server-side.
- Added `.env.example` with placeholders only; never copy real credentials into source control.

## Must-pass checks before launch

1. **Secrets and environment**
   - Generate a unique, high-entropy `AUTH_SECRET` for production. Do not use a sample value.
   - Keep PayPal live credentials, database credentials, and S3 secrets in the hosting provider's secret manager.
   - Confirm `.env*` files containing real credentials are not committed.
   - Set `PAYPAL_ENVIRONMENT=production` only with live credentials and a verified live webhook ID.

2. **Authentication and authorization**
   - Verify unauthenticated requests to every `/api/admin/*` endpoint return `401` and do not mutate data.
   - Verify expired/tampered admin cookies fail, logout clears the cookie, and production cookies are `HttpOnly`, `Secure`, and `SameSite`.
   - Add distributed login rate limiting (for example, a shared Redis-backed limiter or hosting/WAF rule). An in-memory limiter alone is not sufficient for multi-instance production.
   - Review all state-changing endpoints for CSRF/origin protections appropriate to the deployment.

3. **Payments and customer access**
   - Test sandbox purchases for success, cancellation, duplicate capture, mismatched amount/currency, invalid order ID, and network failures.
   - Verify webhook signatures using the configured webhook ID; test duplicate and out-of-order webhook delivery.
   - Ensure refund events revoke purchased access if that is the intended business rule. Confirm partial refunds and refund retries are handled consistently.
   - Test magic-link expiry, one-time use, concurrent requests, and email ownership. Consider scanners that pre-open email links before users click them.
   - Do not treat a browser return URL or client-side status as proof of payment; only verified PayPal server responses/webhooks should grant access.

4. **Uploads and media delivery**
   - Verify upload routes require an admin session and validate content type, file size, and generated object keys.
   - Enforce size limits at the storage layer as well as in application validation; a client-supplied size field is not proof of the actual uploaded size.
   - Ensure private paid media is not also publicly served from a predictable `/public` URL or public object bucket.
   - Test byte-range video requests, malformed ranges, missing files, unauthorized downloads, and remote-storage failures.

5. **Database and recovery**
   - Take a restorable production backup before migrations. Test restore into a separate database.
   - Apply reviewed migrations in staging before production; never run destructive schema resets against production.
   - Confirm database TLS, least-privilege credentials, connection limits, and retention policies.

6. **Build and operational tests**
   - Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run db:health`, and `npm run build` in a clean environment.
   - Run dependency vulnerability review (`npm audit`) and review/fix production-relevant findings before deployment.
   - Exercise public contact/booking endpoints with invalid input, oversized bodies, repeated submissions, and malformed JSON.
   - Configure error monitoring, uptime checks, alerts, log redaction, and a documented rollback procedure.

## Important limitations / findings to resolve

- No distributed rate limiter is configured in this repository. Add one at the edge or with shared storage before exposing admin login and public write endpoints to the internet.
- Presigned upload requests validate a declared size in application code; enforce the actual size at the object-storage boundary too.
- Customer magic-link verification currently changes state on a `GET` request. Email security scanners may prefetch links; consider a confirmation page followed by a one-time `POST` redemption and atomic token consumption.
- Review webhook event handling for race conditions and out-of-order events. Unique event IDs should be handled idempotently even when concurrent deliveries arrive.
- Verify paid-media origin URLs and storage bucket ACLs in production. Database-level authorization cannot protect files that are also publicly reachable directly from the origin.

## Suggested staging test matrix

| Area | Test | Expected result |
| --- | --- | --- |
| Admin | Request admin API without session | `401`, no mutation |
| Admin | Use modified/expired session cookie | Rejected |
| Upload | Unsupported MIME type / oversized file | Rejected at app and storage layers |
| Purchase | Alter client-side amount/media ID | Server uses persisted media price and validates order metadata |
| Capture | Capture same order more than once | No duplicate grant or duplicate charge |
| Webhook | Invalid signature | Rejected, no database mutation |
| Webhook | Deliver same event twice | Idempotent success, one state transition |
| Media | Fetch paid item without entitlement | No media bytes returned |
| Media | Fetch paid item with valid entitlement | Correct content and range behavior |
| Refund | Refund completed purchase | Database state and access follow documented refund policy |
| Recovery | Expired/reused magic link | Rejected |
| Deployment | Clean install, typecheck, lint, build | All pass |
