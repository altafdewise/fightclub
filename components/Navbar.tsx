import Link from "next/link";
import { cn } from "@/utils/cn";

const links = [
  { href: "#services", label: "Services" },
  { href: "#video", label: "Video" },
  { href: "#testimonials", label: "Testimonials" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border)] bg-[rgba(5,6,7,0.45)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="section-space flex items-center justify-between py-4 max-w-6xl mx-auto">
        <Link href="/" className="font-semibold tracking-[0.08em] text-lg">BRUTAL</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn("nav-link", "hover:text-white focus-visible:text-white")}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Link href="/get-started" className="btn-primary text-sm">Book a consult</Link>
      </div>
    </header>
  );
}

