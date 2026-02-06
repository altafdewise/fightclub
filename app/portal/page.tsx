import { requireClient } from "@/lib/auth";
import { checkUndertakingExists, getStreaks, getTodayPayload } from "@/lib/portal";
import { ClientToday } from "@/components/portal/ClientToday";
import { UndertakingLockPage } from "@/components/UndertakingLockPage";

export default async function PortalPage() {
  const client = await requireClient();

  // Check if client has accepted undertaking
  const hasAcceptedUndertaking = await checkUndertakingExists(client.id);

  // If not accepted, show lock page with undertaking form
  if (!hasAcceptedUndertaking) {
    return <UndertakingLockPage client={client} />;
  }

  // Otherwise show normal dashboard
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
