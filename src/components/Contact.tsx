import ContactForm from "@/components/ContactForm";
import type { PublicSiteSettings } from "@/lib/site-settings";
export default function Contact({settings}:{settings:PublicSiteSettings}){
 return <section id="contact" className="studio-contact"><div className="studio-shell studio-contact-grid"><div><p className="studio-label">06 / Contact</p><h2>Have a story<br /><em>in mind?</em></h2><p className="studio-contact-copy">For collaborations, representation, editorial work and creative projects.</p>{settings.email&&<a className="studio-email" href={`mailto:${settings.email}`}>{settings.email}<span>↗</span></a>}</div><div className="studio-contact-form"><ContactForm/></div></div></section>;
}
