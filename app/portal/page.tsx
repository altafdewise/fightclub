import { requireClient } from "@/lib/auth";
import { getStreaks, getTodayPayload } from "@/lib/portal";
import { ClientToday } from "@/components/portal/ClientToday";

export default async function PortalPage() {
  const client = await requireClient();
  const payload = await getTodayPayload(client.id);
  const streaks = await getStreaks(client.id);

  return (
    <section className="section-space py-16">
      <ClientToday
        name={client.name}
        note={payload.note}
        items={payload.items}
        date={payload.date}
        summary={payload.summary}
        streaks={streaks}
      />
    </section>
  );
}
