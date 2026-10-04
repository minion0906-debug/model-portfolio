import BookingForm from "@/components/BookingForm";

export default function BookingCTA() {
  return (
    <section id="booking" className="section-pad bg-black text-white">
      <div className="container-page grid gap-14 md:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Bookings</p>
          <h2 className="mt-5 font-display text-5xl leading-tight md:text-7xl">
            Let’s create something memorable.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
            Share the essentials and the team will review your project, dates and requirements.
          </p>
        </div>
        <BookingForm />
      </div>
    </section>
  );
}
