import { prisma } from "@/lib/prisma";

export type PublicHeroSlide = {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
};

export async function getPublishedHeroSlides(): Promise<PublicHeroSlide[]> {
  const slides = await prisma.heroSlide.findMany({
    where: {
      active: true,
      media: {
        type: "IMAGE",
        published: true,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      subtitle: true,
      media: {
        select: {
          url: true,
          thumbnail: true,
          title: true,
        },
      },
    },
  });

  return slides.map((slide) => ({
    id: slide.id,
    src: slide.media.thumbnail || slide.media.url,
    alt: slide.media.title || slide.title || "Hero image",
    title: slide.title || slide.media.title || "Avery",
    subtitle: slide.subtitle || "Model · Creative · Editorial",
  }));
}
