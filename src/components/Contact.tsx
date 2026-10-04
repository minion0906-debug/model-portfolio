import ContactForm from "@/components/ContactForm";
import type { PublicSiteSettings } from "@/lib/site-settings";

type Props = {
  settings: PublicSiteSettings;
};

export default function Contact({ settings }: Props) {
  const socials = [
    ["Instagram", settings.instagram],
    ["TikTok", settings.tiktok],
    ["YouTube", settings.youtube],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <section id="contact" className="section-pad">
      <div className="container-page grid gap-14 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Contact</p>
          <h2 className="mt-4 font-display text-5xl md:text-6xl">Say hello.</h2>

          <div className="mt-8 space-y-3 text-sm text-neutral-600">
            {settings.email && <p><a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a></p>}
            {settings.phone && <p><a href={`tel:${settings.phone}`} className="hover:underline">{settings.phone}</a></p>}
          </div>

          {socials.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              {socials.map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {label}
                </a>
              ))}
            </div>
          )}

          <p className="mt-8 max-w-md text-sm leading-7 text-neutral-500">
            For project-specific booking requests, please use the booking form.
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
