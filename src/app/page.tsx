import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import VideoSection from "@/components/VideoSection";
import About from "@/components/About";
import BookingCTA from "@/components/BookingCTA";
import Contact from "@/components/Contact";
import MotionEffects from "@/components/MotionEffects";
import { getPublishedGalleryImages } from "@/lib/gallery";
import { getPublishedVideos } from "@/lib/videos";
import { getPublishedHeroSlides } from "@/lib/hero";
import { getSiteSettings } from "@/lib/site-settings";

const specialties = ["Fashion", "Beauty", "Editorial", "Campaigns", "Commercial"];

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = `${settings.name} | Model Portfolio`;
  const description = settings.bio || `${settings.name} — fashion, beauty, editorial and commercial model portfolio.`;
  const baseUrl = getBaseUrl();
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: baseUrl,
      title,
      description,
      siteName: `${settings.name} Portfolio`,
      images: settings.profileImage ? [{ url: settings.profileImage, alt: `${settings.name} portfolio portrait` }] : undefined,
    },
    twitter: {
      card: settings.profileImage ? "summary_large_image" : "summary",
      title,
      description,
      images: settings.profileImage ? [settings.profileImage] : undefined,
    },
  };
}

export default async function HomePage() {
  const [gallery, videos, heroSlides, settings] = await Promise.all([
    getPublishedGalleryImages(),
    getPublishedVideos(),
    getPublishedHeroSlides(),
    getSiteSettings(),
  ]);

  return (
    <div className="studio-site">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: settings.name,
            description: settings.bio || undefined,
            image: settings.profileImage || undefined,
            url: getBaseUrl(),
            jobTitle: "Model",
            address: settings.location ? { "@type": "PostalAddress", addressLocality: settings.location } : undefined,
            sameAs: [settings.instagram, settings.tiktok, settings.youtube].filter(Boolean),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <MotionEffects />
      <Navbar />
      <main>
        <Hero slides={heroSlides} settings={settings} />

        <section className="studio-marquee" aria-label="Specialties">
          <div className="studio-marquee-track">
            {[...specialties, ...specialties].map((item, index) => (
              <span key={`${item}-${index}`}>{item}<i>✳</i></span>
            ))}
          </div>
        </section>

        <section className="studio-manifesto">
          <div className="studio-shell studio-manifesto-grid">
            <p className="studio-label">01 / Point of view</p>
            <div>
              <h2>Presence that<br /><em>stays with you.</em></h2>
              <div className="studio-manifesto-bottom">
                <p>{settings.bio || "Contemporary model and creative talent for fashion, beauty, editorial and commercial stories."}</p>
                <a href="#gallery">Explore the work <span>↗</span></a>
              </div>
            </div>
          </div>
        </section>

        <Gallery images={gallery} />
        <VideoSection videos={videos} />
        <About settings={settings} />
        <BookingCTA acceptingBookings={settings.acceptingBookings} contactEmail={settings.email} />
        <Contact settings={settings} />
      </main>

      <footer className="studio-footer">
        <div className="studio-shell studio-footer-top">
          <div>
            <p className="studio-label">Available worldwide</p>
            <h2>{settings.name}<span>.</span></h2>
          </div>
          <a className="studio-footer-arrow" href="#home">Back to top <b>↑</b></a>
        </div>
        <div className="studio-shell studio-footer-bottom">
          <span>© {new Date().getFullYear()} {settings.name}</span>
          <div>
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noreferrer">TikTok</a>}
            {settings.youtube && <a href={settings.youtube} target="_blank" rel="noreferrer">YouTube</a>}
          </div>
          <span>Model / Creative / Editorial</span>
        </div>
      </footer>
    </div>
  );
}
