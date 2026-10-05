import { prisma } from "@/lib/prisma";
import HeroManager from "@/components/admin/HeroManager";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const [slides, media] = await Promise.all([
    prisma.heroSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        subtitle: true,
        active: true,
        sortOrder: true,
        media: {
          select: {
            id: true,
            url: true,
            thumbnail: true,
            title: true,
            published: true,
          },
        },
      },
    }),
    prisma.media.findMany({
      where: {
        type: "IMAGE",
        published: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        url: true,
        thumbnail: true,
        title: true,
      },
    }),
  ]);

  const usedMediaIds = new Set(slides.map((slide) => slide.media.id));

  return (
    <HeroManager
      initialSlides={slides}
      availableMedia={media.filter((item) => !usedMediaIds.has(item.id))}
    />
  );
}
