import { prisma } from "@/lib/prisma";

export async function ensureSiteSettings() {
  const existing = await prisma.siteSettings.findFirst();

  if (existing) return existing;

  return prisma.siteSettings.create({
    data: {
      name: "Avery",
      bio: "Model, creative and editorial talent available for selected projects.",
      acceptingBookings: true,
    },
  });
}
