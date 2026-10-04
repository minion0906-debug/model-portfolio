import Link from "next/link";

const navItems = [
  { href: "#gallery", label: "Gallery" },
  { href: "#videos", label: "Videos" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#171412]/5 bg-[rgba(250,246,241,0.72)] backdrop-blur-xl">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="font-display text-2xl tracking-[0.16em] text-[#171412] uppercase">
          Avery
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-[0.68rem] uppercase tracking-[0.28em] text-[#4d433e] transition-colors hover:text-[#171412]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="#contact" className="btn-primary bg-[#171412] text-[#f9f5f0] hover:bg-[#2a2522]">
          Book now
        </Link>
      </div>
    </header>
  );
}
