import { prisma } from "@/lib/prisma";

export async function ensureSiteSettings() {
  const existing = await prisma.siteSettings.findFirst();

  if (existing) return existing;

  return prisma.siteSettings.create({
    data: {
      name: "Lera Aumila",
      bio: "Model, creative and editorial talent available for selected projects.",
      location: "London, UK",
      height: "5'10\" / 178 cm",
      clothingSize: "US 4 / EU 34",
      shoeSize: "US 8 / EU 39",
      languages: "English, French",
      specialties: "Editorial, beauty, commercial",
      acceptingBookings: true,
    },
  });
}
