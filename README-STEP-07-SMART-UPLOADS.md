# Step 7 — Smart Media Uploads

This step builds on Step 6 and improves image upload validation and processing.

## Included
- Defaults category selection to Auto so filename/dimension-based suggestions are applied unless a category is explicitly selected.
- Performs quick client-side checks for supported image MIME types and the 10MB limit, while keeping server-side checks authoritative.
- Validates the actual image format with Sharp instead of trusting the browser's MIME type.
- Applies EXIF orientation, converts originals to WebP, records normalized dimensions, and generates a 640px maximum preview thumbnail.
- Stores the thumbnail URL in the existing `Media.thumbnail` field; no database migration is required.
- Limits decoded image size to 40 megapixels to reduce decompression-bomb risk.
- Shows per-file upload success/failure details.

## Test
1. Run `npm install`.
2. Run `npm run typecheck` and `npm run build`.
3. Run `npm run dev`, sign in to Admin → Gallery, and upload JPG/PNG/WebP files in portrait, landscape, and square orientations.
4. Verify the media records include width, height, category, orientation, and thumbnail.
5. Try a renamed non-image file and an image over 10MB; both should be rejected.

The generated preview is stored as a separate MediaBlob. If deleting media records in custom code, delete both `url` and `thumbnail` blobs to avoid orphaned thumbnail data. Build/runtime checks have not been run in this packaging environment.
