import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHQ } from "@/lib/auth";
import {
  getConversationMetaForHQ,
  getMessagesForConversation,
  getUnreadCount,
  listAllConversationsForHQ,
} from "@/lib/chat";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const dynamic = "force-dynamic";

export default async function HQMessagesPage({ params }: { params: Promise<{ clientId: string }> }) {
  await requireHQ();
  const { clientId } = await params;

  const conversations = await listAllConversationsForHQ();
  if (!conversations.length) {
    return (
      <section className="section-space py-14 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Headquarters</p>
            <h1 className="text-3xl font-semibold">Messages</h1>
          </div>
          <Link
            href="/hq"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Back to HQ
          </Link>
        </div>
        <div className="rounded-[24px] border border-white/15 bg-white/[0.04] px-6 py-6">
          <p className="text-white/70">No assigned conversations yet.</p>
        </div>
      </section>
    );
  }

  if (!conversations.some((c) => c.client_id === clientId)) {
    notFound();
  }

  const { conversation, clientName, clientUsername, trainerName } = await getConversationMetaForHQ(clientId);
  const { messages, hasMore } = await getMessagesForConversation(conversation.id, { limit: 30 });
  const unreadCount = await getUnreadCount(conversation.id, "hq");

  return (
    <section className="section-space py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Headquarters</p>
          <h1 className="text-3xl font-semibold">Messages</h1>
          <p className="text-sm text-white/60 mt-1">Monitor every trainer-client conversation.</p>
        </div>
        <Link
          href="/hq"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Back to HQ
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="rounded-[20px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">All Conversations</h3>
            <Link href="/hq" className="text-xs text-white/60 hover:text-white">Dashboard</Link>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {conversations.map((item) => (
              <Link
                key={item.client_id}
                href={`/hq/messages/${item.client_id}`}
                className={`flex items-center justify-between rounded-xl px-3 py-3 transition border border-transparent hover:border-white/15 ${
                  item.client_id === clientId ? "bg-white/[0.08] border-white/10" : "bg-white/[0.02]"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{item.client_name}</p>
                  <p className="text-xs text-white/60">@{item.client_username}</p>
                  <p className="text-[11px] text-white/50">Trainer: {item.trainer_name}</p>
                </div>
                {(() => {
                  const totalUnread = (item.unread_client || 0) + (item.unread_trainer || 0);
                  if (totalUnread > 0) {
                    return (
                      <span className="inline-flex items-center justify-center rounded-full bg-white text-black px-2.5 py-1 text-[11px] font-semibold">
                        {totalUnread}
                      </span>
                    );
                  }
                  return null;
                })()}
              </Link>
            ))}
          </div>
        </aside>

        <ChatWindow
          conversationId={conversation.id}
          clientId={conversation.client_id}
          trainerId={conversation.trainer_id}
          viewerRole="hq"
          peerName={`${clientName} • Trainer ${trainerName}`}
          initialMessages={messages}
          initialUnreadCount={unreadCount}
          initialHasMore={hasMore}
        />
      </div>
    </section>
  );
}
