import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import VideoSection from "@/components/VideoSection";
import About from "@/components/About";
import BookingCTA from "@/components/BookingCTA";
import Contact from "@/components/Contact";
import { getPublishedGalleryImages } from "@/lib/gallery";
import { getPublishedVideos } from "@/lib/videos";
import { getPublishedHeroSlides } from "@/lib/hero";
import { getSiteSettings } from "@/lib/site-settings";

export default async function HomePage() {
  const [gallery, videos, heroSlides, settings] = await Promise.all([
    getPublishedGalleryImages(),
    getPublishedVideos(),
    getPublishedHeroSlides(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero slides={heroSlides} fallbackName={settings.name} />
        <Gallery images={gallery} />
        <VideoSection videos={videos} />
        <About settings={settings} />
        <BookingCTA
          acceptingBookings={settings.acceptingBookings}
          contactEmail={settings.email}
        />
        <Contact settings={settings} />
      </main>

      <footer className="border-t border-black/10 py-10">
        <div className="container-page flex flex-col gap-2 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
          <span>{settings.name}</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
