import Image from "next/image";
import type { PublicSiteSettings } from "@/lib/site-settings";

type Props={settings:PublicSiteSettings};
export default function About({settings}:Props){
 const details=[["Height",settings.height],["Clothing",settings.clothingSize],["Shoe",settings.shoeSize],["Languages",settings.languages]].filter((x)=>Boolean(x[1]));
 const specialties=(settings.specialties||"").split(/[,•|]/).map(x=>x.trim()).filter(Boolean).slice(0,6);
 return <section id="about" className="studio-profile"><div className="studio-shell">
  <div className="studio-profile-intro"><p className="studio-label">04 / Profile</p><h2>Face.<br /><em>Presence.</em><br />Point of view.</h2></div>
  <div className="studio-profile-grid"><div className="studio-profile-photo">{settings.profileImage?<Image src={settings.profileImage} alt={settings.name} fill sizes="(max-width:800px) 100vw, 48vw"/>:<span>{settings.name}</span>}<small>{settings.name} / Profile</small></div>
   <div className="studio-profile-copy"><p className="studio-profile-name">{settings.name}</p><p className="studio-profile-bio">{settings.bio||"Contemporary model and creative talent for selected projects."}</p>
    {details.length>0&&<div className="studio-details">{details.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
    {specialties.length>0&&<div className="studio-specialties"><span>Specialties</span><div>{specialties.map(x=><b key={x}>{x}</b>)}</div></div>}
    <a className="studio-inline-link" href="#booking">Discuss a project <span>↗</span></a>
   </div>
  </div>
 </div></section>;
}
