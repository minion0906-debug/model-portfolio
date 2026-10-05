import Image from "next/image";
import type { PublicHeroSlide } from "@/lib/hero";
import type { PublicSiteSettings } from "@/lib/site-settings";

type Props = {
  slides?: PublicHeroSlide[];
  settings: PublicSiteSettings;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85";

export default function Hero({ slides, settings }: Props) {
  const heroImage = slides?.[0]?.src || settings.profileImage || fallbackImage;
  const heroAlt = slides?.[0]?.alt || settings.name;

  return (
    <section id="home" className="portfolio-hero" aria-label={`${settings.name} introduction`}>
      <div className="portfolio-hero-copy">
        <div className="portfolio-hero-inner">
          <p className="portfolio-hero-kicker">MODEL · CREATIVE · EDITORIAL</p>
          <h1>{settings.name}</h1>
          <div className="portfolio-hero-rule" />
          <p className="portfolio-hero-bio">
            {settings.bio || "Model, creative and editorial talent available for selected projects."}
          </p>
          {settings.location && (
            <p className="portfolio-hero-location">Based in {settings.location}</p>
          )}
          <a href="#contact" className="portfolio-hero-cta">Contact / Book <span aria-hidden="true">→</span></a>
        </div>
      </div>

      <div className="portfolio-hero-media">
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 56vw"
          className="portfolio-hero-image"
        />
      </div>
    </section>
  );
}
