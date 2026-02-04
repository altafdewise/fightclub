import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-white/5 bg-black/40 backdrop-blur-md">
      <div className="section-space py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-sm text-muted">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-white tracking-[0.08em]">BRUTAL</p>
          <p className="text-muted">Structured coaching. Anywhere.</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
          <Link href="#services" className="hover:text-[var(--gold)] transition-colors">
            Services
          </Link>
          <Link href="/get-started" className="hover:text-[var(--gold)] transition-colors">
            Book a consult
          </Link>
          <Link href="#member-access" className="hover:text-[var(--gold)] transition-colors">
            Member
          </Link>
          <Link href="/privacy" className="hover:text-[var(--gold)] transition-colors">
            Privacy
          </Link>
        </div>
      </div>
      <div className="section-space pb-8 flex flex-col md:flex-row md:items-center md:justify-between text-xs text-muted">
        <span>(c) {year} BRUTAL</span>
        <span className="text-[var(--gold)]">www.brutal.fit</span>
      </div>
    </footer>
  );
}
