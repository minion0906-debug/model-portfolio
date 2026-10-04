import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export default async function Home(){
  const supabase=await supabaseServer();
  const {data:profile}=await supabase.from("profiles").select("*").eq("slug","maya-hart").maybeSingle();
  const {data:media}=await supabase.from("media").select("*").eq("is_public",true).order("sort_order",{ascending:true}).limit(12);
  const name=profile?.display_name||"Maya Hart";
  return <main>
    <nav className="nav"><Link className="logo" href="/">{name.split(" ")[0].toUpperCase()}<span>.</span></Link>
      <div className="navlinks"><a href="#portfolio">Portfolio</a><a href="#about">About</a><a href="#video">Video</a><a href="#book">Book</a></div>
      <Link className="navcta" href="/login">Model Login</Link></nav>
    <section className="hero"><div className="heroImage"/><div className="heroOverlay"/><div className="heroContent">
      <p className="eyebrow">MODEL • ACTRESS • CREATIVE</p><h1>{name.split(" ")[0]}<br/><i>{name.split(" ").slice(1).join(" ")}</i></h1>
      <p className="heroText">{profile?.tagline||"Commercial, editorial and lifestyle talent available worldwide."}</p><a className="button light" href="#book">Book {name.split(" ")[0]}</a></div><div className="scroll">SCROLL ↓</div></section>
    <section id="portfolio" className="section"><div className="sectionHead"><div><p className="eyebrow dark">SELECTED WORK</p><h2>Portfolio</h2></div><p className="muted">Updated directly from the model dashboard.</p></div>
      <div className="gallery">{(media||[]).filter((m:any)=>m.media_type==="image").map((m:any)=><div className="photo" key={m.id}><img src={m.public_url} alt={m.alt_text||""}/></div>)}</div></section>
    <section id="about" className="section about"><div className="aboutImage"/><div className="aboutCopy"><p className="eyebrow dark">ABOUT {name.toUpperCase()}</p><h2>Natural on camera.<br/><i>Memorable on screen.</i></h2>
      <p>{profile?.bio||"Commercial and editorial talent available for advertising, lifestyle, beauty, fashion, hospitality, social campaigns and branded content."}</p>
      <div className="stats"><div><b>{profile?.height||"5'8\""}</b><span>Height</span></div><div><b>{profile?.location||"Las Vegas"}</b><span>Based</span></div><div><b>US / Global</b><span>Travel</span></div></div></div></section>
    <section id="video" className="videoSection"><div className="videoFrame"><div><p className="eyebrow">SHOWREEL</p><h2>Motion changes everything.</h2></div></div></section>
    <section id="book" className="section booking"><div className="bookingCopy"><p className="eyebrow dark">WORK WITH {name.toUpperCase()}</p><h2>Let's create<br/><i>something beautiful.</i></h2><p>Send the project details and the model will receive the inquiry in the dashboard.</p></div><form className="form" action="/api/bookings" method="post">
      <label>Name<input name="name" required/></label><label>Email<input name="email" type="email" required/></label><label>Project type<select name="project_type"><option>Advertising campaign</option><option>Photo shoot</option><option>Video / commercial</option><option>UGC / social</option><option>Event / brand activation</option><option>Other</option></select></label><label>Details<textarea name="details" rows={5}/></label><button className="button darkButton">Send Inquiry ↗</button></form></section>
    <footer><div><Link className="logo" href="/">{name.split(" ")[0].toUpperCase()}<span>.</span></Link><p>Commercial & editorial model</p></div><div className="footerLinks"><a href="#">Instagram</a><a href="#">TikTok</a><a href="#book">Book</a><Link href="/login">Model Login</Link></div></footer>
  </main>
}