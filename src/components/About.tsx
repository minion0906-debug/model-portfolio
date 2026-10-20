import type { PublicSiteSettings } from "@/lib/site-settings";

type Props = { settings: PublicSiteSettings };

function toSlug(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "model";
}

export default function About({ settings }: Props) {
  const details = [["Height", settings.height], ["Clothing", settings.clothingSize], ["Shoe", settings.shoeSize], ["Languages", settings.languages]].filter((item) => Boolean(item[1]));
  const specialties = (settings.specialties || "").split(/[,•|]/).map((item) => item.trim()).filter(Boolean).slice(0, 6);
  const profileUrl = `/models/${toSlug(settings.name)}`;

  return <section id="about" className="studio-profile"><div className="studio-shell">
    <div className="studio-profile-intro"><p className="studio-label">04 / Profile</p><h2>Face.<br /><em>Presence.</em><br />Point of view.</h2></div>
    <div className="studio-profile-grid"><div className="studio-profile-photo">{settings.profileImage ? <img src={settings.profileImage} alt={settings.name} loading="lazy" decoding="async" /> : <span>{settings.name}</span>}<small>{settings.name} / Profile</small></div>
      <div className="studio-profile-copy"><p className="studio-profile-name">{settings.name}</p><p className="studio-profile-bio">{settings.bio || "Contemporary model and creative talent for selected projects."}</p>
        {details.length > 0 && <div className="studio-details">{details.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
        {specialties.length > 0 && <div className="studio-specialties"><span>Specialties</span><div>{specialties.map((item) => <b key={item}>{item}</b>)}</div></div>}
        <div className="studio-profile-actions"><a className="studio-inline-link" href={profileUrl}>View full model profile <span>↗</span></a><a className="studio-inline-link" href="#booking">Discuss a project <span>↗</span></a></div>
      </div>
    </div>
  </div></section>;
}
