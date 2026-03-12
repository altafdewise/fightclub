import { requireClient } from "@/lib/auth";
import { checkUndertakingExists, getClientCheckinStatus, getClientProgressSeries, getStreaks, getTodayPayload } from "@/lib/portal";
import { getConversationMetaForClient, getUnreadCount } from "@/lib/chat";
import { ClientToday } from "@/components/portal/ClientToday";
import { UndertakingLockPage } from "@/components/UndertakingLockPage";

export default async function PortalPage() {
  const client = await requireClient();

  let unreadMessages = 0;
  try {
    const { conversation } = await getConversationMetaForClient(client.id);
    unreadMessages = await getUnreadCount(conversation.id, { id: client.id, type: "client" });
  } catch (error) {
    unreadMessages = 0;
  }

  // Check if client has accepted undertaking
  const hasAcceptedUndertaking = await checkUndertakingExists(client.id);

  // If not accepted, show lock page with undertaking form
  if (!hasAcceptedUndertaking) {
    return <UndertakingLockPage client={client} />;
  }

  // Otherwise show normal dashboard
  const payload = await getTodayPayload(client.id);
  const streaks = await getStreaks(client.id);
  const checkinStatus = await getClientCheckinStatus(client.id);
  const progressSeries = await getClientProgressSeries(client.id, 90);

  return (
    <section className="section-space py-16 space-y-6">
      <ClientToday
        clientId={client.id}
        name={client.name}
        note={payload.note}
        noteHtml={payload.noteHtml}
        items={payload.items}
        date={payload.date}
        summary={payload.summary}
        streaks={streaks}
        weeklyStatus={checkinStatus}
        progressData={progressSeries}
        unreadMessages={unreadMessages}
      />
    </section>
  );
}
