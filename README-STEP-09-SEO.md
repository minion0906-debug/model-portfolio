# Step 9 — SEO and Discoverability

This step adds framework-generated `sitemap.xml` and `robots.txt`, dynamic homepage metadata based on the configured site profile, canonical homepage URL, Open Graph/Twitter preview metadata, and Person structured data.

## Required production setting

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin, including `https://` and no trailing slash, for example `https://your-domain.com`. The sitemap and robots file use this value. Replace the example fallback before production.

## Verify

1. Run `npm install`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run the site and visit `/sitemap.xml` and `/robots.txt`.
5. Share the homepage URL in a social preview debugger to confirm the configured portrait is publicly reachable.

The sitemap currently includes the homepage and the single configured model profile. Private admin, API, account, and purchase paths are disallowed for crawlers.
