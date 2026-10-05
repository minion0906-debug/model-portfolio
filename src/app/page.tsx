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

const categories = ["Fashion", "Commercial", "Editorial", "Beauty", "Lifestyle", "Events", "Fitness", "Brand Ambassador"];
const cities = ["New York", "Los Angeles", "Miami", "Dallas", "Chicago", "Atlanta", "Las Vegas", "London"];

export default async function HomePage() {
  const [gallery, videos, heroSlides, settings] = await Promise.all([
    getPublishedGalleryImages(), getPublishedVideos(), getPublishedHeroSlides(), getSiteSettings(),
  ]);

  return <>
    <Navbar />
    <main>
      <Hero slides={heroSlides} settings={settings} />

      <section className="directory-strip">
        <div className="container-page directory-inner">
          <span className="directory-label">Browse by specialty</span>
          <div className="chip-row">
            {categories.map((category) => <a key={category} href="#gallery" className="category-chip">{category}</a>)}
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container-page intro-grid">
          <div>
            <p className="section-kicker">Independent talent</p>
            <h2>Polished visuals.<br />Powerful stories.</h2>
          </div>
          <div>
            <p className="intro-copy">Curated for fashion editors, beauty brands, creative directors and production teams seeking a contemporary, elevated point of view.</p>
            <div className="mini-links"><a href="#gallery">View portfolio <span>→</span></a><a href="#contact">Start a booking <span>→</span></a></div>
          </div>
        </div>
      </section>

      <Gallery images={gallery} />

      <VideoSection videos={videos} />

      <About settings={settings} />

      <section id="cities" className="city-section">
        <div className="container-page">
          <div className="city-heading"><div><p className="section-kicker">Available for work</p><h2>Based here.<br />Available everywhere.</h2></div><p>Local bookings, destination shoots and travel projects are welcome.</p></div>
          <div className="city-grid">{cities.map((city, i) => <a href="#contact" key={city} className="city-card"><span>{String(i + 1).padStart(2, "0")}</span><strong>{city}</strong><em>View availability →</em></a>)}</div>
        </div>
      </section>
      <BookingCTA acceptingBookings={settings.acceptingBookings} contactEmail={settings.email} />
      <Contact settings={settings} />
    </main>

    <footer className="site-footer">
      <div className="container-page footer-grid">
        <div><div className="footer-brand">{settings.name}</div><p>Model · Creative · Editorial</p></div>
        <div className="footer-links"><a href="#gallery">Portfolio</a><a href="#about">About</a><a href="#contact">Contact</a></div>
        <div className="footer-copy">© {new Date().getFullYear()} {settings.name}. All rights reserved.</div>
      </div>
    </footer>
  </>;
}
