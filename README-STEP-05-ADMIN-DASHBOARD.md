# Step 5 — Admin dashboard upgrade

This step upgrades the existing protected admin dashboard without changing the database schema.

## What's included
- Booking pipeline counts for New, Reviewing, Accepted, and Completed requests.
- Proportional bars showing each status as a share of all booking requests.
- Image/video publication progress and percentage summaries.
- Inbox summary showing total and unread messages.
- Direct links to the relevant admin management pages.
- Keeps existing dashboard statistics, recent activity, and quick actions.

## Test locally
1. Extract this ZIP into a new folder.
2. Run `npm install`.
3. Run `npm run typecheck`.
4. Run `npm run dev` and visit `/admin` after signing in.

No migration is required. The dashboard uses the existing Prisma models and enum values.
