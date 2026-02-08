import Link from "next/link";
import { requireClient } from "@/lib/auth";
import {
  getConversationMetaForClient,
  getMessagesForConversation,
  getUnreadCount,
  markMessagesRead,
} from "@/lib/chat";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const dynamic = "force-dynamic";

export default async function PortalMessagesPage() {
  const client = await requireClient();

  try {
    const { conversation, trainerName } = await getConversationMetaForClient(client.id);
    const { messages, hasMore } = await getMessagesForConversation(conversation.id, { limit: 30 });
    const unreadCount = await getUnreadCount(conversation.id, "client");
    await markMessagesRead(conversation.id, "client");

    return (
      <section className="section-space py-14 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Client Portal</p>
            <h1 className="text-3xl md:text-4xl font-semibold">Messages</h1>
            <p className="text-sm text-white/60 mt-1">Chat with your trainer in real time.</p>
          </div>
          <Link
            href="/portal"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Back to Dashboard
          </Link>
        </div>

        <ChatWindow
          conversationId={conversation.id}
          clientId={conversation.client_id}
          trainerId={conversation.trainer_id}
          viewerRole="client"
          peerName={`Trainer • ${trainerName}`}
          initialMessages={messages}
          initialUnreadCount={unreadCount}
          initialHasMore={hasMore}
        />
      </section>
    );
  } catch (error: any) {
    return (
      <section className="section-space py-16 space-y-6">
        <div className="rounded-[24px] border border-white/15 bg-white/[0.04] px-6 py-6">
          <h2 className="text-2xl font-semibold mb-2">Messages</h2>
          <p className="text-white/70 text-sm">
            {error?.message || "No trainer is assigned to your account yet. Please contact support."}
          </p>
        </div>
      </section>
    );
  }
}
