import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const mediaSeed = [
  {
    type: "IMAGE" as const,
    title: "Editorial Portrait I",
    tag: "Portrait",
    url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1400&q=85",
  },
  {
    type: "IMAGE" as const,
    title: "Fashion Editorial",
    tag: "Fashion",
    url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    type: "IMAGE" as const,
    title: "Beauty Campaign",
    tag: "Beauty",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85",
  },
  {
    type: "VIDEO" as const,
    title: "Fashion Show Reel",
    tag: "Video",
    url: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Admin ready: ${email}`);
}

async function seedMedia() {
  for (let index = 0; index < mediaSeed.length; index++) {
    const item = mediaSeed[index];

    const tag = await prisma.tag.upsert({
      where: { name: item.tag },
      update: {},
      create: { name: item.tag },
    });

    const media = await prisma.media.upsert({
      where: { url: item.url },
      update: {
        title: item.title,
        published: true,
        sortOrder: index + 1,
        type: item.type,
      },
      create: {
        title: item.title,
        url: item.url,
        type: item.type,
        published: true,
        sortOrder: index + 1,
      },
    });

    await prisma.mediaTag.upsert({
      where: {
        mediaId_tagId: {
          mediaId: media.id,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        mediaId: media.id,
        tagId: tag.id,
      },
    });
  }
}

async function seedSettings() {
  await prisma.siteSettings.upsert({
    where: { id: "default-site-settings" },
    update: {
      name: "Lera Aumila",
      bio: "Editorial and commercial model working across fashion, beauty, lifestyle and creative campaigns.",
      location: "Las Vegas, USA",
      height: "5'10\" / 178 cm",
      clothingSize: "US 4 / EU 34",
      shoeSize: "US 8 / EU 39",
      languages: "English",
      specialties: "Editorial, beauty, commercial, high-fashion",
      email: "hello@example.com",
      acceptingBookings: true,
    },
    create: {
      id: "default-site-settings",
      name: "Lera Aumila",
      bio: "Editorial and commercial model working across fashion, beauty, lifestyle and creative campaigns.",
      location: "Las Vegas, USA",
      height: "5'10\" / 178 cm",
      clothingSize: "US 4 / EU 34",
      shoeSize: "US 8 / EU 39",
      languages: "English",
      specialties: "Editorial, beauty, commercial, high-fashion",
      email: "hello@example.com",
      acceptingBookings: true,
    },
  });
}

async function main() {
  await seedAdmin();
  await seedMedia();
  await seedSettings();

  console.log("Database seed completed successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
