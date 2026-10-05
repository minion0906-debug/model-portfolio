"use client";

import { FormEvent, useState } from "react";

type Props = {
  acceptingBookings?: boolean;
  contactEmail?: string | null;
};

const projectTypes = ["Editorial", "Campaign", "Commercial", "Beauty", "Lifestyle", "Event"];
const budgetRanges = ["Under $2,000", "$2,000–$5,000", "$5,000–$10,000", "$10,000+", "To be discussed"];

export default function BookingCTA({ acceptingBookings = true, contactEmail }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [budget, setBudget] = useState("");

  if (!acceptingBookings) {
    return (
      <section id="booking" className="booking-section booking-closed">
        <div className="container-page booking-closed-inner">
          <div>
            <p className="section-kicker">Bookings</p>
            <h2>Currently<br /><em>unavailable.</em></h2>
          </div>
          <div className="booking-closed-copy">
            <span className="booking-status-dot booking-status-dot-muted" />
            <p>New booking requests are temporarily closed.</p>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`}>General inquiries <span>↗</span></a>
            )}
          </div>
        </div>
      </section>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const form = event.currentTarget;
      const data = Object.fromEntries(new FormData(form).entries());
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      form.reset();
      setBookingType("");
      setBudget("");
      setStatus("success");
    } catch {
      setError("Unable to send your request right now. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section id="booking" className="booking-section">
      <div className="container-page">
        <div className="booking-header">
          <div>
            <div className="booking-eyebrow">
              <span className="booking-status-dot" />
              Currently accepting projects
            </div>
            <p className="section-kicker">Bookings / 05</p>
            <h2>Let&apos;s make<br /><em>something memorable.</em></h2>
          </div>
          <div className="booking-header-copy">
            <p>For editorial, campaigns, beauty, commercial and creative projects. Share the essentials and I&apos;ll get back to you with availability and next steps.</p>
            <div className="booking-response">Typical response <strong>24–48 hours</strong></div>
          </div>
        </div>

        <form onSubmit={submit} className="booking-form">
          <div className="booking-form-topline">
            <span>Project inquiry</span>
            <span>01 — Details</span>
          </div>

          <div className="booking-field-grid">
            <label className="booking-field">
              <span>Name <b>*</b></span>
              <input name="name" required placeholder="Your name" autoComplete="name" />
            </label>
            <label className="booking-field">
              <span>Email <b>*</b></span>
              <input name="email" required type="email" placeholder="you@example.com" autoComplete="email" />
            </label>
            <label className="booking-field">
              <span>Phone</span>
              <input name="phone" placeholder="+1 555 000 0000" autoComplete="tel" />
            </label>
            <label className="booking-field">
              <span>Company / brand</span>
              <input name="company" placeholder="Company or agency" autoComplete="organization" />
            </label>
          </div>

          <div className="booking-divider" />

          <div className="booking-project-block">
            <div className="booking-label">Project type</div>
            <div className="booking-options" role="group" aria-label="Project type">
              {projectTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`booking-option ${bookingType === type ? "is-selected" : ""}`}
                  onClick={() => setBookingType(type)}
                  aria-pressed={bookingType === type}
                >
                  {type}
                </button>
              ))}
            </div>
            <input type="hidden" name="bookingType" value={bookingType} />
          </div>

          <div className="booking-field-grid booking-field-grid-three">
            <label className="booking-field">
              <span>Preferred date</span>
              <input name="preferredDate" type="date" />
            </label>
            <label className="booking-field">
              <span>Production location</span>
              <input name="location" placeholder="City / country" />
            </label>
            <label className="booking-field">
              <span>Budget range</span>
              <select name="budget" value={budget} onChange={(event) => setBudget(event.target.value)}>
                <option value="">Select range</option>
                {budgetRanges.map((range) => <option key={range} value={range}>{range}</option>)}
              </select>
            </label>
          </div>

          <label className="booking-field booking-field-full">
            <span>Usage / campaign scope</span>
            <input name="usageRights" placeholder="Web, social, print, paid media, duration, territory…" />
          </label>

          <label className="booking-field booking-message-field">
            <span>Tell me about the project <b>*</b></span>
            <textarea name="message" required minLength={10} rows={6} placeholder="Dates, deliverables, creative direction, usage and anything else that will help me understand the project." />
          </label>

          <div className="booking-submit-row">
            <p>By submitting, you&apos;re requesting availability. Final rates and usage are confirmed separately.</p>
            <button type="submit" disabled={status === "sending"} className="booking-submit">
              <span>{status === "sending" ? "Sending request" : "Send inquiry"}</span>
              <span>↗</span>
            </button>
          </div>

          {status === "success" && (
            <div className="booking-feedback booking-feedback-success" role="status">
              <strong>Request received.</strong> Thank you — I&apos;ll be in touch with availability and next steps.
            </div>
          )}
          {status === "error" && (
            <div className="booking-feedback booking-feedback-error" role="alert">
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
