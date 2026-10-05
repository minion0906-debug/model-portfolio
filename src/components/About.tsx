import Image from "next/image";
import type { PublicSiteSettings } from "@/lib/site-settings";

type Props = {
  settings: PublicSiteSettings;
};

function splitSpecialties(value: string | null) {
  return (value || "")
    .split(/[,•|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export default function About({ settings }: Props) {
  const details = [
    ["Height", settings.height],
    ["Clothing", settings.clothingSize],
    ["Shoe", settings.shoeSize],
    ["Languages", settings.languages],
  ].filter(([, value]) => Boolean(value));

  const specialties = splitSpecialties(settings.specialties);

  return (
    <section id="about" className="profile-section">
      <div className="container-page">
        <div className="profile-header">
          <div>
            <p className="section-kicker">The profile</p>
            <h2>More than<br /><em>a portfolio.</em></h2>
          </div>
          <div className="profile-header-copy">
            <span className={settings.acceptingBookings ? "profile-status is-open" : "profile-status"}>
              <i aria-hidden="true" />
              {settings.acceptingBookings ? "Available for selected bookings" : "Bookings currently closed"}
            </span>
            <p>{settings.location || "Available for selected projects"}</p>
          </div>
        </div>

        <div className="profile-layout">
          <div className="profile-image-wrap">
            <div className="profile-image-frame">
              {settings.profileImage ? (
                <Image
                  src={settings.profileImage}
                  alt={settings.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 48vw"
                  className="profile-image"
                />
              ) : (
                <div className="profile-image-placeholder">
                  <span>{settings.name}</span>
                </div>
              )}
            </div>
            <div className="profile-image-note">Profile / 01</div>
          </div>

          <div className="profile-content">
            <p className="profile-eyebrow">{settings.name}</p>
            <h3>Contemporary presence.<br />Editorial point of view.</h3>
            <p className="profile-bio">
              {settings.bio || "Model, creative and editorial talent available for selected projects."}
            </p>

            {details.length > 0 && (
              <div className="profile-details" aria-label="Model details">
                {details.map(([label, value]) => (
                  <div className="profile-detail" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            )}

            {specialties.length > 0 && (
              <div className="profile-specialties">
                <span className="profile-label">Specialties</span>
                <div>
                  {specialties.map((specialty) => <span key={specialty}>{specialty}</span>)}
                </div>
              </div>
            )}

            <div className="profile-actions">
              <a href="#contact">Book a project <span aria-hidden="true">↗</span></a>
              <a href="#gallery">View selected work <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
