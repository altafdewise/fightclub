import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/utils/cn";
import { requireAdmin } from "@/lib/auth";
import {
  getConversationMetaForTrainer,
  getMessagesForConversation,
  getUnreadCount,
  listAssignedClientsWithUnread,
  markMessagesRead,
} from "@/lib/chat";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const dynamic = "force-dynamic";

export default async function TrainerMessagesPage({ params }: { params: Promise<{ clientId: string }> }) {
  const admin = await requireAdmin();
  const { clientId } = await params;

  const assignedClients = await listAssignedClientsWithUnread(admin.id);

  if (!assignedClients.length) {
    return (
      <section className="section-space py-14 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Trainer</p>
            <h1 className="text-3xl font-semibold">Messages</h1>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Back
          </Link>
        </div>
        <div className="rounded-[24px] border border-white/15 bg-white/[0.04] px-6 py-6">
          <p className="text-white/70">No clients assigned yet.</p>
        </div>
      </section>
    );
  }

  if (!assignedClients.some((client) => client.client_id === clientId)) {
    notFound();
  }

  const { conversation, clientName, clientUsername } = await getConversationMetaForTrainer(admin.id, clientId);
  const { messages, hasMore } = await getMessagesForConversation(conversation.id, { limit: 30 });
  const unreadCount = await getUnreadCount(conversation.id, { id: admin.id, type: "trainer" });
  await markMessagesRead(conversation.id, { id: admin.id, type: "trainer" });

  return (
    <section className="section-space py-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Trainer</p>
          <h1 className="text-3xl font-semibold">Messages</h1>
          <p className="mt-1 text-sm text-white/60">Chat with your assigned clients.</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Back
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="space-y-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Assigned Clients</h3>
            <Link href="/admin" className="text-xs text-white/60 hover:text-white">
              Manage
            </Link>
          </div>
          <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
            {assignedClients.map((client) => (
              <Link
                key={client.client_id}
                href={`/trainer/messages/${client.client_id}`}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-3.5 py-3 transition",
                  client.client_id === clientId
                    ? "border-white/15 bg-white/[0.08] shadow-[0_12px_40px_-30px_rgba(0,0,0,0.8)]"
                    : "border-transparent bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]"
                )}
              >
                <div>
                  <p className="text-sm font-semibold leading-tight text-white">{client.name}</p>
                  <p className="text-xs leading-tight text-white/60">@{client.username}</p>
                </div>
                {client.unread_count && client.unread_count > 0 ? (
                  <span className="relative inline-flex items-center justify-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-black">
                    {client.unread_count}
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white/10" />
                )}
              </Link>
            ))}
          </div>
        </aside>

        <ChatWindow
          conversationId={conversation.id}
          clientId={conversation.client_id}
          trainerId={conversation.trainer_id}
          viewerRole="trainer"
          peerName={`@${clientUsername} • ${clientName}`}
          initialMessages={messages}
          initialUnreadCount={unreadCount}
          initialHasMore={hasMore}
          initialCurrentUser={{ id: admin.id, type: "trainer" }}
        />
      </div>
    </section>
  );
}