import { prisma } from "@/lib/prisma";

export type PublicSiteSettings = {
  name: string;
  bio: string;
  profileImage: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  acceptingBookings: boolean;
};

const fallback: PublicSiteSettings = {
  name: "Avery",
  bio: "Model, creative and editorial talent available for selected projects.",
  profileImage: null,
  email: null,
  phone: null,
  instagram: null,
  tiktok: null,
  youtube: null,
  acceptingBookings: true,
};

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  const settings = await prisma.siteSettings.findFirst();

  if (!settings) return fallback;

  return {
    name: settings.name || fallback.name,
    bio: settings.bio || "",
    profileImage: settings.profileImage,
    email: settings.email,
    phone: settings.phone,
    instagram: settings.instagram,
    tiktok: settings.tiktok,
    youtube: settings.youtube,
    acceptingBookings: settings.acceptingBookings,
  };
}
