# Step 08 — Hero CMS

This milestone makes the homepage hero manageable from the admin dashboard.

## Included

- `/admin/hero` Hero CMS page
- Add existing published gallery images to the hero
- Prevent duplicate hero media
- Edit slide title/subtitle
- Activate/deactivate slides
- Reorder slides
- Remove a slide without deleting its gallery image
- Public hero reads active slides whose underlying image is published
- Existing Unsplash hero remains as a fallback when no CMS slides are available
- `package.json` included

## Run

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Then open:

- Public site: `http://localhost:3000`
- Admin hero CMS: `http://localhost:3000/admin/hero`

## Important

A hero slide references an existing `Media` record. Removing a hero slide only removes the `HeroSlide` record; the gallery image remains available in Gallery CMS.

Only published gallery images can be added to the hero. If an image is later unpublished, it will no longer appear publicly in the hero.

The current local upload implementation remains development-oriented. Production media should move to object storage/CDN such as S3/R2/Cloudinary, while PostgreSQL continues to store media metadata.
