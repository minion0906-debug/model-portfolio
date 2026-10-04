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
    <section id="contact" className="section-pad pb-20">
      <div className="container-page grid gap-14 md:grid-cols-[0.72fr_1.28fr] md:items-start">
        <div className="panel-surface rounded-[2rem] border-[#171412]/10 bg-[#fffdfb]/75 p-6 shadow-[0_28px_70px_rgba(17,15,13,0.05)] md:p-8">
          <p className="section-kicker">Contact</p>
          <div className="mt-4 h-px w-16 bg-[#171412]/10" />
          <h2 className="mt-4 font-display text-5xl text-[#171412] md:text-6xl">Say hello.</h2>

          <div className="mt-8 space-y-3 text-sm text-[#4c413b]">
            {settings.email && (
              <p>
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-[#171412]">
                  {settings.email}
                </a>
              </p>
            )}
            {settings.phone && (
              <p>
                <a href={`tel:${settings.phone}`} className="transition-colors hover:text-[#171412]">
                  {settings.phone}
                </a>
              </p>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              {socials.map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.7rem] uppercase tracking-[0.22em] text-[#4c413b] transition-colors hover:text-[#171412]"
                >
                  {label}
                </a>
              ))}
            </div>
          )}

          <p className="mt-8 max-w-md text-sm leading-7 text-[#584e49]">
            For project-specific booking requests, please use the booking form.
          </p>
        </div>

        <div className="panel-surface rounded-[2rem] border-[#171412]/10 bg-[#fffdfb]/80 p-5 shadow-[0_28px_70px_rgba(17,15,13,0.05)] md:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
