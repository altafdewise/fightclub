import { requireClient } from "@/lib/auth";
import { checkUndertakingExists, getClientCheckinStatus, getClientProgressSeries, getStreaks, getTodayPayload } from "@/lib/portal";
import { getConversationMetaForClient, getUnreadCount } from "@/lib/chat";
import { ClientToday } from "@/components/portal/ClientToday";
import { UndertakingLockPage } from "@/components/UndertakingLockPage";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { MessageCircle } from "lucide-react";

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
    <>
      <section className="section-space py-16 space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/50">Welcome back</p>
            <h1 className="text-3xl font-semibold text-white">{client.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/portal/messages"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_-28px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:border-amber-300/60 hover:shadow-[0_0_30px_rgba(255,200,120,0.32)]"
            >
              <MessageCircle className="h-4 w-4 text-amber-300" />
              <span className="text-white/90">Messages</span>
              {unreadMessages > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white text-black px-2 py-0.5 text-[11px] font-semibold">
                  {unreadMessages}
                </span>
              )}
            </a>
          </div>
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
      <FloatingChatButton role="client" />
    </>
  );
}
