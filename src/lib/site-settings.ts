import { prisma } from "@/lib/prisma";

export type PublicSiteSettings = {
  name: string;
  bio: string;
  profileImage: string | null;
  location: string | null;
  height: string | null;
  clothingSize: string | null;
  shoeSize: string | null;
  languages: string | null;
  specialties: string | null;
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
  location: "London, UK",
  height: "5'10\"",
  clothingSize: "US 4 / EU 34",
  shoeSize: "US 8 / EU 39",
  languages: "English, French",
  specialties: "Editorial, fashion, beauty, commercial",
  email: null,
  phone: null,
  instagram: null,
  tiktok: null,
  youtube: null,
  acceptingBookings: true,
};

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) return fallback;

    return {
      name: settings.name || fallback.name,
      bio: settings.bio || "",
      profileImage: settings.profileImage,
      location: settings.location || fallback.location,
      height: settings.height || fallback.height,
      clothingSize: settings.clothingSize || fallback.clothingSize,
      shoeSize: settings.shoeSize || fallback.shoeSize,
      languages: settings.languages || fallback.languages,
      specialties: settings.specialties || fallback.specialties,
      email: settings.email,
      phone: settings.phone,
      instagram: settings.instagram,
      tiktok: settings.tiktok,
      youtube: settings.youtube,
      acceptingBookings: settings.acceptingBookings,
    };
  } catch {
    return fallback;
  }
}
