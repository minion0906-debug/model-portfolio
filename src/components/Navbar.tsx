import Link from "next/link";

const navItems = [
  { href: "#gallery", label: "Gallery" },
  { href: "#videos", label: "Videos" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-md">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="font-display text-2xl tracking-[0.2em] text-black uppercase">
          Avery
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm text-neutral-700 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-black">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="#contact"
          className="rounded-full border border-black px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
        >
          Book now
        </Link>
      </div>
    </header>
  );
}
