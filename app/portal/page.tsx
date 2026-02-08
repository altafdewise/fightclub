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
    unreadMessages = await getUnreadCount(conversation.id, "client");
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
      <div className="flex items-center justify-end">
        <a
          href="/portal/messages"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
        >
          Messages
          {unreadMessages > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-white text-black px-2 py-0.5 text-[11px] font-semibold">
              {unreadMessages}
            </span>
          )}
        </a>
      </div>

      <ClientToday
        name={client.name}
        note={payload.note}
        items={payload.items}
        date={payload.date}
        summary={payload.summary}
        streaks={streaks}
        weeklyStatus={checkinStatus}
        progressData={progressSeries}
      />
    </section>
  );
}
