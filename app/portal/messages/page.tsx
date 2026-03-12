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
  let errorMessage: string | null = null;
  let conversation: { id: string; client_id: string; trainer_id: string } | null = null;
  let trainerName = "";
  let messages: Awaited<ReturnType<typeof getMessagesForConversation>>["messages"] = [];
  let hasMore = false;
  let unreadCount = 0;

  try {
    const meta = await getConversationMetaForClient(client.id);
    conversation = meta.conversation;
    trainerName = meta.trainerName;

    const messagePayload = await getMessagesForConversation(conversation.id, { limit: 30 });
    messages = messagePayload.messages;
    hasMore = messagePayload.hasMore;
    unreadCount = await getUnreadCount(conversation.id, { id: client.id, type: "client" });
    await markMessagesRead(conversation.id, { id: client.id, type: "client" });
  } catch (error: any) {
    errorMessage = error?.message || "No trainer is assigned to your account yet. Please contact support.";
  }

  return (
    <section className="section-space py-14 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Client Portal</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Messages</h1>
          <p className="mt-1 text-sm text-white/60">Chat with your trainer in real time.</p>
        </div>
        <Link
          href="/portal"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Back
        </Link>
      </div>

      {conversation && !errorMessage ? (
        <ChatWindow
          conversationId={conversation.id}
          clientId={conversation.client_id}
          trainerId={conversation.trainer_id}
          viewerRole="client"
          peerName={`Trainer • ${trainerName}`}
          initialMessages={messages}
          initialUnreadCount={unreadCount}
          initialHasMore={hasMore}
          initialCurrentUser={{ id: client.id, type: "client" }}
        />
      ) : (
        <div className="rounded-[24px] border border-white/15 bg-white/[0.04] px-6 py-6">
          <h2 className="mb-2 text-2xl font-semibold">Messages</h2>
          <p className="text-sm text-white/70">{errorMessage}</p>
        </div>
      )}
    </section>
  );
}