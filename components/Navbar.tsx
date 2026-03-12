"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";

const links = [
  { href: "#services", label: "Services" },
  { href: "#video", label: "Video" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
  { href: "#member-access", label: "Member" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border)] bg-[rgba(5,6,7,0.45)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="section-space relative flex items-center justify-between py-4">
        <Link href="/" className="font-semibold tracking-[0.08em] text-lg">BRUTAL</Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("nav-link", "hover:text-white focus-visible:text-white")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white/10 text-white/80 transition hover:border-white/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
          >
            {mobileOpen ? <X size={20} strokeWidth={2.25} /> : <Menu size={20} strokeWidth={2.25} />}
          </button>

          <Link href="/get-started" className="btn-primary text-sm hidden sm:inline-flex">
            Book a consult
          </Link>
        </div>

        <div
          className={cn(
            "md:hidden absolute left-0 right-0 top-full origin-top rounded-b-2xl border border-t-0 border-[var(--border)] bg-[rgba(5,6,7,0.92)] backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-200 px-5 pb-5",
            mobileOpen ? "pointer-events-auto opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
          )}
        >
          <nav className="flex flex-col divide-y divide-white/5 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-3 text-white/80 transition hover:text-white"
              >
                <span>{link.label}</span>
                <span className="h-2 w-2 rounded-full bg-[var(--gold)]/70" aria-hidden />
              </Link>
            ))}
          </nav>
          <div className="pt-4">
            <Link
              href="/get-started"
              onClick={closeMobileMenu}
              className="btn-primary w-full justify-center text-sm inline-flex"
            >
              Book a consult
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
