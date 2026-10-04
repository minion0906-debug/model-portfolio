import Link from "next/link";

const photos = [
  { src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85", alt: "Editorial portrait" },
  { src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85", alt: "Fashion editorial" },
  { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", alt: "Street fashion" },
  { src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", alt: "Fashion campaign" },
  { src: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85", alt: "Lifestyle campaign" },
  { src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85", alt: "Portrait" }
];

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <Link className="logo" href="/">MAYA<span>.</span></Link>
        <div className="navlinks">
          <a href="#portfolio">Portfolio</a>
          <a href="#about">About</a>
          <a href="#video">Video</a>
          <a href="#book">Book</a>
        </div>
        <Link className="navcta" href="/login">Model Login</Link>
      </nav>

      <section className="hero">
        <div className="heroImage" />
        <div className="heroOverlay" />
        <div className="heroContent">
          <p className="eyebrow">MODEL • ACTRESS • CREATIVE</p>
          <h1>Maya<br /><i>Hart</i></h1>
          <p className="heroText">Commercial, editorial and lifestyle talent available worldwide.</p>
          <a className="button light" href="#book">Book Maya</a>
        </div>
        <div className="scroll">SCROLL ↓</div>
      </section>

      <section id="portfolio" className="section portfolio">
        <div className="sectionHead">
          <div><p className="eyebrow dark">SELECTED WORK</p><h2>Portfolio</h2></div>
          <p className="muted">A curated selection of commercial, fashion and lifestyle work.</p>
        </div>
        <div className="gallery">
          {photos.map((p, i) => (
            <div className={"photo photo" + (i + 1)} key={p.src}>
              <img src={p.src} alt={p.alt} />
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="section about">
        <div className="aboutImage" />
        <div className="aboutCopy">
          <p className="eyebrow dark">ABOUT MAYA</p>
          <h2>Natural on camera.<br /><i>Memorable on screen.</i></h2>
          <p>Maya is a Las Vegas-based model and commercial talent working across beauty, fashion, hospitality, lifestyle and branded content.</p>
          <p>Available for campaigns, e-commerce, social ads, print, video, events and creative productions.</p>
          <div className="stats">
            <div><b>5'8"</b><span>Height</span></div>
            <div><b>Las Vegas</b><span>Based</span></div>
            <div><b>US / Global</b><span>Travel</span></div>
          </div>
        </div>
      </section>

      <section id="video" className="videoSection">
        <div className="videoFrame">
          <div className="play">▶</div>
          <div><p className="eyebrow">SHOWREEL</p><h2>Motion changes everything.</h2></div>
        </div>
      </section>

      <section id="book" className="section booking">
        <div className="bookingCopy">
          <p className="eyebrow dark">WORK WITH MAYA</p>
          <h2>Let&apos;s create<br /><i>something beautiful.</i></h2>
          <p>For campaigns, commercials, print, UGC, events or other collaborations, send the project details below.</p>
        </div>
        <form className="form" action="mailto:book@example.com" method="post" encType="text/plain">
          <label>Name<input name="name" placeholder="Your name" required /></label>
          <label>Email<input type="email" name="email" placeholder="you@company.com" required /></label>
          <label>Project type<select name="type"><option>Advertising campaign</option><option>Photo shoot</option><option>Video / commercial</option><option>UGC / social</option><option>Event / brand activation</option><option>Other</option></select></label>
          <label>Project details<textarea name="details" rows={5} placeholder="Date, location, deliverables, usage, budget, etc." /></label>
          <button className="button darkButton" type="submit">Send Inquiry ↗</button>
        </form>
      </section>

      <footer>
        <div><Link className="logo" href="/">MAYA<span>.</span></Link><p>Commercial & editorial model</p></div>
        <div className="footerLinks"><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">Email</a><Link href="/login">Model Login</Link></div>
        <small>© 2026 Maya Hart. All rights reserved.</small>
      </footer>
    </main>
  );
}