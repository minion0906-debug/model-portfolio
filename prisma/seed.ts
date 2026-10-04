import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });

  for (const image of galleryImages) {
    const tag = await prisma.tag.upsert({
      where: {
        name: image.tag,
      },
      update: {},
      create: {
        name: image.tag,
      },
    });

    const existing = await prisma.media.findFirst({
      where: {
        url: image.url,
      },
    });

    const media =
      existing ||
      (await prisma.media.create({
        data: {
          type: "IMAGE",
          title: image.title,
          url: image.url,
          published: true,
          sortOrder: image.sortOrder,
        },
      }));

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

  await prisma.siteSettings.upsert({
    where: {
      id: "default-site-settings",
    },
    update: {},
    create: {
      id: "default-site-settings",
      name: "Avery",
      bio: "Editorial and commercial model working across fashion, beauty, lifestyle and creative campaigns.",
      email: "hello@example.com",
      acceptingBookings: true,
    },
  });

  console.log(`Admin account created/updated: ${adminEmail}`);
  console.log(`Development password: ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
