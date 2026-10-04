import Link from "next/link";

const items = [
  ["Photos", "24", "Upload and organize galleries"],
  ["Videos", "8", "Manage reels and showreels"],
  ["Bookings", "6", "Review new inquiries"],
  ["Profile", "100%", "Keep your public profile current"]
];

export default function Dashboard() {
  return (
    <main className="dashboard">
      <aside className="sidebar">
        <Link className="logo" href="/">MAYA<span>.</span></Link>
        <nav><a className="active" href="#">Overview</a><a href="#">Photos</a><a href="#">Videos</a><a href="#">Bookings</a><a href="#">Profile</a><a href="#">Settings</a></nav>
        <Link href="/" className="back">← View website</Link>
      </aside>
      <section className="dashMain">
        <header className="dashHeader"><div><p className="eyebrow dark">MODEL DASHBOARD</p><h1>Good morning, Maya.</h1></div><button className="button darkButton">+ Upload</button></header>
        <div className="cards">{items.map(x => <div className="dashCard" key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><p>{x[2]}</p></div>)}</div>
        <div className="dashGrid">
          <div className="panel"><div className="panelHead"><h3>Recent media</h3><button>View all</button></div><div className="mediaRow">{["https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80","https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80"].map((s,i)=><img key={s} src={s} alt={"Recent upload "+(i+1)} />)}</div></div>
          <div className="panel"><div className="panelHead"><h3>Latest inquiry</h3><button>View all</button></div><p><b>Bright Studio</b><br />Summer campaign · Las Vegas</p><hr /><p className="muted">Requested: photo + short-form video<br />Status: New</p></div>
        </div>
      </section>
    </main>
  );
}