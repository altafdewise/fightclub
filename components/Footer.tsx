import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--panelBorder)] bg-[rgba(255,255,255,0.02)]">
      <div className="section-space py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm text-muted">
        <div className="space-y-1">
          <p className="font-semibold text-white">BRUTAL</p>
          <p>www.brutal.fit</p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-white">Privacy</Link>
          <Link href="#" className="hover:text-white">Terms</Link>
          <p>© {year} BRUTAL</p>
        </div>
      </div>
    </footer>
  );
}

