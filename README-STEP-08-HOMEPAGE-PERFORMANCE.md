# Step 8 — Homepage Media Performance and Resilience

This upgrade builds on Step 7 and focuses on the public homepage gallery.

## Changes

- Keeps the existing thumbnail-first gallery data flow, which prefers `Media.thumbnail` and falls back to the original URL for free media.
- Adds responsive `sizes` hints so browsers can make a better image download choice for the rendered gallery width.
- Prioritizes the first gallery image and keeps later images lazy-loaded with async decoding.
- Adds a local SVG fallback when a remote image URL fails, avoiding a blank/broken-image icon. The fallback handler only runs once per image to prevent loops.
- Adds `public/media-unavailable.svg`; no database schema changes are required.

## Test

1. Run `npm install`.
2. Run `npm run typecheck`.
3. Run `npm run dev`.
4. Check the homepage on desktop and mobile widths.
5. Temporarily use an invalid image URL on a test media item and confirm the fallback graphic appears.
6. Verify that the first image loads promptly and images farther down the page load as you scroll.

## Notes

This step does not generate new responsive image variants or rewrite S3 objects. It improves browser loading hints and gracefully handles broken remote URLs while preserving the existing storage and access-control flow. Run a production build before deploying.
