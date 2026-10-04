import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const galleryImages = [
  {
    title: "Editorial I",
    tag: "Portrait",
    url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1400&q=85",
    sortOrder: 1,
  },
  {
    title: "Editorial II",
    tag: "Fashion",
    url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
    sortOrder: 2,
  },
  {
    title: "Editorial III",
    tag: "Portrait",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85",
    sortOrder: 3,
  },
  {
    title: "Campaign I",
    tag: "Campaign",
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85",
    sortOrder: 4,
  },
  {
    title: "Campaign II",
    tag: "Campaign",
    url: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1400&q=85",
    sortOrder: 5,
  },
  {
    title: "Studio",
    tag: "Beauty",
    url: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1400&q=85",
    sortOrder: 6,
  },
];

async function main() {
  for (const image of galleryImages) {
    const tag = await prisma.tag.upsert({
      where: { name: image.tag },
      update: {},
      create: { name: image.tag },
    });

    const media = await prisma.media.create({
      data: {
        type: "IMAGE",
        title: image.title,
        url: image.url,
        published: true,
        sortOrder: image.sortOrder,
      },
    });

    await prisma.mediaTag.create({
      data: {
        mediaId: media.id,
        tagId: tag.id,
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "default-site-settings" },
    update: {},
    create: {
      id: "default-site-settings",
      name: "Avery",
      bio: "Editorial and commercial model working across fashion, beauty, lifestyle and creative campaigns.",
      email: "hello@example.com",
      acceptingBookings: true,
    },
  });

  console.log("Database seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
