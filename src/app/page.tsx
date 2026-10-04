import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import VideoSection from "@/components/VideoSection";
import BookingCTA from "@/components/BookingCTA";
import Contact from "@/components/Contact";
import { getPublishedGalleryImages } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function Home() {
  const galleryImages = await getPublishedGalleryImages();

  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <section id="about" className="section-pad">
          <div className="container-page grid gap-10 md:grid-cols-[1fr_1.5fr]">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              About
            </p>

            <div>
              <h2 className="font-display text-4xl leading-tight md:text-6xl">
                Modeling is about presence, movement and telling a story
                without saying a word.
              </h2>

              <p className="mt-7 max-w-2xl text-sm leading-7 text-neutral-500">
                Avery is an editorial and commercial model working across
                fashion, beauty, lifestyle and creative campaigns.
              </p>
            </div>
          </div>
        </section>

        <Gallery images={galleryImages} />
        <VideoSection />
        <BookingCTA />
        <Contact />
      </main>

      <footer className="border-t border-black/10 py-8">
        <div className="container-page flex flex-col justify-between gap-3 text-xs text-neutral-500 md:flex-row">
          <span>© 2026 Avery Studio</span>
          <span>Model · Creative · Editorial</span>
        </div>
      </footer>
    </>
  );
}
