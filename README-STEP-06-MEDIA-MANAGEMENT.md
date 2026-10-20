# Step 6 — Advanced Media Management

This upgrade adds media-library search, category and publication filters, sorting, selection, and bulk publish/hide/category actions for gallery images.

## Changes
- Search by title, description, category, or orientation.
- Filter by category and publication status.
- Sort alphabetically by title or category; default/reverse the API's stable gallery order.
- Select visible items or individual images.
- Bulk publish, hide, or assign a category.
- New authenticated endpoint: `POST /api/admin/gallery/bulk`.
- Single-image editing accepts an optional category.

## Test
1. Run `npm install`.
2. Run `npm run typecheck`.
3. Run `npm run dev` and open Admin → Gallery.
4. Test filters, selection, bulk actions, and confirm public visibility changes.

No Prisma schema migration is required; `Media.category` already exists. Build/runtime behavior has not been verified in this environment.
