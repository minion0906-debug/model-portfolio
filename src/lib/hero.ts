import { unstable_cache } from "next/cache";
import { prisma, logDatabaseError, withDatabaseRetry } from "@/lib/prisma";

export type PublicHeroSlide = {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
};

const loadPublishedHeroSlides = unstable_cache(
  async (): Promise<PublicHeroSlide[]> => {
    try {
      const slides = await withDatabaseRetry(() => prisma.heroSlide.findMany({
        where: {
          active: true,
          media: { type: "IMAGE", published: true },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          subtitle: true,
          media: {
            select: { url: true, thumbnail: true, title: true },
          },
        },
      }));

      return slides.map((slide) => ({
        id: slide.id,
        src: slide.media.thumbnail || slide.media.url,
        alt: slide.media.title || slide.title || "Hero image",
        title: slide.title || slide.media.title || "Lera Aumila",
        subtitle: slide.subtitle || "Model · Creative · Editorial",
      }));
    } catch (error) {
      logDatabaseError("hero", error);
      return [];
    }
  },
  ["public-hero"],
  { revalidate: 60, tags: ["public-portfolio"] },
);

export function getPublishedHeroSlides() {
  return loadPublishedHeroSlides();
}
