import Link from "next/link";
import { requireClient } from "@/lib/auth";
import { getHistoryPayload } from "@/lib/portal";

export default async function PortalHistoryPage() {
  const client = await requireClient();
  const history = await getHistoryPayload(client.id);

  return (
    <section className="section-space py-16 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Client Portal</p>
          <h1 className="text-3xl md:text-4xl font-semibold">7-day history</h1>
        </div>
        <Link
          href="/portal"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Back to Today
        </Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-4">
        {history.map((day) => (
          <div key={day.date} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{day.date}</span>
              <span>{day.completion}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white/70 transition-all"
                style={{ width: `${day.completion}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
