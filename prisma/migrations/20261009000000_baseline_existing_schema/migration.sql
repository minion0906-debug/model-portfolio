-- Baseline migration for the existing model-portfolio database.
-- On an existing database, mark this migration as applied with:
-- npx prisma migrate resolve --applied 20261009000000_baseline_existing_schema
-- Do NOT execute this migration against the existing database.

CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE "BookingStatus" AS ENUM ('NEW', 'REVIEWING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "size" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Media_type_idx" ON "Media"("type");
CREATE INDEX "Media_published_idx" ON "Media"("published");
CREATE INDEX "Media_sortOrder_idx" ON "Media"("sortOrder");

CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HeroSlide_sortOrder_idx" ON "HeroSlide"("sortOrder");
CREATE INDEX "HeroSlide_active_idx" ON "HeroSlide"("active");
CREATE INDEX "HeroSlide_mediaId_idx" ON "HeroSlide"("mediaId");
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

CREATE TABLE "MediaTag" (
    "mediaId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "MediaTag_pkey" PRIMARY KEY ("mediaId", "tagId")
);
CREATE INDEX "MediaTag_tagId_idx" ON "MediaTag"("tagId");
ALTER TABLE "MediaTag" ADD CONSTRAINT "MediaTag_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaTag" ADD CONSTRAINT "MediaTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,
    "location" TEXT,
    "height" TEXT,
    "clothingSize" TEXT,
    "shoeSize" TEXT,
    "languages" TEXT,
    "specialties" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "youtube" TEXT,
    "acceptingBookings" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "bookingType" TEXT,
    "preferredDate" TIMESTAMP(3),
    "location" TEXT,
    "budget" TEXT,
    "usageRights" TEXT,
    "message" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BookingRequest_status_idx" ON "BookingRequest"("status");
CREATE INDEX "BookingRequest_createdAt_idx" ON "BookingRequest"("createdAt");

CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ContactMessage_read_idx" ON "ContactMessage"("read");
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");
