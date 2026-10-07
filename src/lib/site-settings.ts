import { unstable_cache } from "next/cache";
import { prisma, logDatabaseError, withDatabaseRetry } from "@/lib/prisma";

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
  name: "Lera Aumila",
  bio: "Fashion model and creative talent based in Las Vegas, available for editorial, beauty, commercial and brand projects.",
  profileImage: null,
  location: "Las Vegas, USA",
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

const loadSiteSettings = unstable_cache(
  async (): Promise<PublicSiteSettings> => {
    try {
      const settings = await withDatabaseRetry(() => prisma.siteSettings.findFirst());

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
    } catch (error) {
      logDatabaseError("settings", error);
      return fallback;
    }
  },
  ["public-settings"],
  { revalidate: 60, tags: ["public-portfolio"] },
);

export function getSiteSettings() {
  return loadSiteSettings();
}
