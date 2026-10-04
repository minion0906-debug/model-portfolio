import ContactForm from "@/components/ContactForm";

export default function Contact() {
  return (
    <section id="contact" className="section-pad">
      <div className="container-page grid gap-14 md:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Contact</p>
          <h2 className="mt-5 font-display text-5xl leading-tight md:text-7xl">
            Start a conversation.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-neutral-500">
            For general inquiries, collaborations and creative projects, send a message below.
            For booking-specific requests, use the booking form.
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
