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
          <div className="portfolio-hero-meta">
            <span>Model / Creative</span>
            <span>{settings.location || "Available worldwide"}</span>
          </div>

          <h1>
            <span className="hero-name">{settings.name}</span>
            <span className="hero-subname">Fashion · Beauty · Editorial</span>
          </h1>

          <div className="portfolio-hero-intro">
            <span className="portfolio-hero-index">01 — 04</span>
            <p className="portfolio-hero-bio">
              {settings.bio || "Model, creative and editorial talent available for selected projects."}
            </p>
          </div>

          <div className="portfolio-hero-actions">
            <a href="#gallery" className="portfolio-hero-cta">Explore work <span aria-hidden="true">↗</span></a>
            <a href="#contact" className="portfolio-hero-cta secondary">Book a project <span aria-hidden="true">↗</span></a>
          </div>
        </div>

        <div className="portfolio-hero-bottom">
          <span>{settings.acceptingBookings ? "Currently accepting selected bookings" : "Bookings currently closed"}</span>
          <a href="#gallery" aria-label="Scroll to selected work"><span>Scroll to explore</span><b aria-hidden="true">↓</b></a>
        </div>
      </div>

      <div className="portfolio-hero-media">
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 58vw"
          className="portfolio-hero-image"
        />
        <div className="portfolio-hero-media-overlay" aria-hidden="true" />
        <div className="portfolio-hero-media-label" aria-hidden="true">Selected portrait / 01</div>
      </div>
    </section>
  );
}
