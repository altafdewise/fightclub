import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export default function PortalLoginPage() {
  return (
    <section className="section-space py-20">
      <div className="max-w-md mx-auto rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
        <div className="space-y-2 mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Client Portal</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Sign in</h1>
          <p className="text-sm text-white/60">Enter your username and passcode.</p>
        </div>
        <PortalLoginForm />
      </div>
    </section>
  );
}
