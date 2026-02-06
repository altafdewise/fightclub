import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export default function PortalLoginPage() {
  return (
    <section className="section-space py-20 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-8 md:p-10 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="space-y-3 mb-8">
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Client Portal</p>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Sign in</h1>
          <p className="text-sm text-white/60 pt-1">Enter your username and passcode to access your training portal.</p>
        </div>
        <PortalLoginForm />
      </div>
    </section>
  );
}
