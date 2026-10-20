import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getSiteSettings } from "@/lib/site-settings";
import { getPublishedGalleryImages } from "@/lib/gallery";
import { getPublishedVideos } from "@/lib/videos";
import "../../portfolio.css";

type PageProps = { params: Promise<{ slug: string }> };

function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "model";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ slug }, settings] = await Promise.all([params, getSiteSettings()]);
  if (slug !== toSlug(settings.name)) return { title: "Model profile not found" };
  const description = settings.bio || `${settings.name} — model portfolio, fashion, beauty and editorial work.`;
  return {
    title: `${settings.name} | Model Profile`,
    description,
    alternates: { canonical: `/models/${toSlug(settings.name)}` },
    openGraph: {
      title: `${settings.name} | Model Profile`,
      description,
      images: settings.profileImage ? [{ url: settings.profileImage, alt: settings.name }] : undefined,
      type: "profile",
    },
  };
}

export default async function ModelProfilePage({ params }: PageProps) {
  const [{ slug }, settings, images, videos] = await Promise.all([
    params,
    getSiteSettings(),
    getPublishedGalleryImages(),
    getPublishedVideos(),
  ]);

  if (slug !== toSlug(settings.name)) notFound();
  const details = [
    ["Location", settings.location],
    ["Height", settings.height],
    ["Clothing", settings.clothingSize],
    ["Shoe", settings.shoeSize],
    ["Languages", settings.languages],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  const specialties = (settings.specialties || "")
    .split(/[,•|]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="studio-site model-profile-page">
      <Navbar />
      <main>
        <section className="model-profile-hero">
          <div className="model-profile-hero-image">
            {settings.profileImage ? <img src={settings.profileImage} alt={`${settings.name} profile portrait`} /> : null}
          </div>
          <div className="model-profile-shade" />
          <div className="model-profile-hero-copy">
            <p className="studio-label">Model profile / Portfolio</p>
            <h1>{settings.name.split(/\s+/).map((part, index) => <span key={`${part}-${index}`}>{part}{index < settings.name.split(/\s+/).length - 1 ? " " : ""}</span>)}</h1>
            <p>{settings.location || "Available worldwide"}</p>
            <a href="/#booking" className="model-profile-cta">{settings.acceptingBookings ? "Book this model ↗" : "Make an inquiry ↗"}</a>
          </div>
          <span className="model-profile-index">01 — Profile</span>
        </section>

        <section className="model-profile-intro studio-shell">
          <p className="studio-label">A little about me</p>
          <div>
            <h2>Character in<br /><em>every frame.</em></h2>
            <p>{settings.bio || `Explore the portfolio of ${settings.name}, available for selected fashion, beauty, editorial and commercial projects.`}</p>
            {specialties.length > 0 && <div className="model-profile-specialties">{specialties.map((item) => <span key={item}>{item}</span>)}</div>}
          </div>
        </section>

        {details.length > 0 && <section className="model-profile-measurements">
          <div className="studio-shell">
            <p className="studio-label">Details / 02</p>
            <div className="model-profile-detail-grid">{details.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          </div>
        </section>}

        <section className="model-profile-work studio-shell">
          <div className="model-profile-section-heading"><div><p className="studio-label">Selected work / 03</p><h2>Portfolio<span>.</span></h2></div><span>{String(images.length).padStart(2, "0")} photographs</span></div>
          {images.length ? <div className="model-profile-image-grid">{images.map((item, index) => <a href="/#gallery" key={item.id} className={`model-profile-image-card ${index % 5 === 1 ? "tall" : ""}`} aria-label={`View ${item.title} in the full portfolio`}><img src={item.src} alt={item.title} loading="lazy" /><span>{item.title}</span></a>)}</div> : <p className="model-profile-empty">New photographs are coming soon.</p>}
        </section>

        {videos.length > 0 && <section className="model-profile-films">
          <div className="studio-shell"><div className="model-profile-section-heading"><div><p className="studio-label">Motion / 04</p><h2>Films<span>.</span></h2></div><span>{String(videos.length).padStart(2, "0")} films</span></div>
            <div className="model-profile-video-grid">{videos.map((video) => <a href="/#videos" key={video.id} className="model-profile-video-card">{video.poster ? <img src={video.poster} alt="" loading="lazy" /> : <div className="model-profile-video-placeholder">PLAY FILM ↗</div>}<div><strong>{video.title}</strong>{video.description && <p>{video.description}</p>}</div></a>)}</div>
          </div>
        </section>}

        <section className="model-profile-contact"><div className="studio-shell"><p className="studio-label">Have a project in mind?</p><h2>Let's make<br /><em>something lasting.</em></h2><a href="/#booking">Start a booking inquiry <span>↗</span></a></div></section>
      </main>
      <footer className="model-profile-footer"><span>© {new Date().getFullYear()} {settings.name}</span><a href="/">Back to main portfolio ↑</a><span>Model / Creative / Editorial</span></footer>
    </div>
  );
}
