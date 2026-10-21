# Step 10 — Security and Production Readiness

This step adds best-effort rate limiting to public endpoints:

- Contact form: 5 submissions per IP per 10 minutes
- Booking form: 5 submissions per IP per 10 minutes
- Admin login: 8 attempts per IP per 15 minutes
- Customer magic-link requests: 3 requests per IP per 15 minutes

When a limit is exceeded, the endpoint returns HTTP 429 and a `Retry-After` header. The shared helper is in `src/lib/rate-limit.ts`.

## Important production limitation

The limiter stores counters in process memory. This is useful as a lightweight abuse speed bump, but counters are not shared between serverless instances and may reset when an instance restarts. For reliable production enforcement, configure a CDN/WAF rate limit or use a shared store (for example Redis/Upstash) and trust only forwarding headers sanitized by your hosting platform.

## Deployment checklist

- Set a strong, unique `AUTH_SECRET` in production; never commit `.env` files.
- Keep database and S3 credentials in the hosting provider's environment settings.
- Confirm admin API routes call `requireAdmin()` or equivalent authorization checks before performing protected actions.
- Configure a shared rate limiter/WAF before accepting significant public traffic.
- Run `npm install`, `npm run typecheck`, and `npm run build` before deploying.
- Review logs and never log passwords, session tokens, magic-link tokens, or payment secrets.

The existing `next.config.ts` already applies baseline security headers, including content-type protection, clickjacking protection, a referrer policy, and production-only HSTS. This step preserves those settings.
