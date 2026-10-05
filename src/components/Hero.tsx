import Image from "next/image";
import type { PublicHeroSlide } from "@/lib/hero";
import type { PublicSiteSettings } from "@/lib/site-settings";

type Props = { slides?: PublicHeroSlide[]; settings: PublicSiteSettings };
const fallbackImage = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90";

export default function Hero({ slides, settings }: Props) {
  const image = slides?.[0]?.src || settings.profileImage || fallbackImage;
  return (
    <section id="home" className="studio-hero">
      <div className="studio-hero-image">
        <Image src={image} alt={slides?.[0]?.alt || settings.name} fill priority sizes="(max-width: 800px) 100vw, 72vw" />
        <div className="studio-hero-vignette" />
      </div>
      <div className="studio-hero-top"><span>Model / Creative</span><span>{settings.location || "Worldwide"}</span></div>
      <div className="studio-hero-title">
        <p className="studio-label">Selected talent</p>
        <h1>{settings.name}<i>.</i></h1>
        <div className="studio-hero-sub"><span>Fashion</span><span>Beauty</span><span>Editorial</span></div>
      </div>
      <div className="studio-hero-side"><span>Scroll to explore</span><b>↓</b></div>
      <div className="studio-hero-status"><i /> {settings.acceptingBookings ? "Available for selected projects" : "Currently unavailable"}</div>
      <div className="studio-hero-number">01 <span>/ 01</span></div>
    </section>
  );
}
