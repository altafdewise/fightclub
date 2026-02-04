import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <section className="section-space py-20">
      <div className="max-w-md mx-auto rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
        <div className="space-y-2 mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Admin</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Sign in</h1>
          <p className="text-sm text-white/60">Enter your admin credentials.</p>
        </div>
        <AdminLoginForm />
      </div>
    </section>
  );
}
