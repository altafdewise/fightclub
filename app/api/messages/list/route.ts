import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getClientSession } from "@/lib/auth";
import { getConversationMetaForClient, getConversationMetaForTrainer, getMessagesForConversation } from "@/lib/chat";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");

    const clientSession = await getClientSession();
    if (clientSession?.client) {
      const { conversation } = await getConversationMetaForClient(clientSession.client.id);
      const { messages } = await getMessagesForConversation(conversation.id, { limit: 200 });
      return NextResponse.json(messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    }

    const adminSession = await getAdminSession();
    if (adminSession?.admin) {
      if (!otherUserId) {
        return NextResponse.json({ message: "userId is required" }, { status: 400 });
      }
      const { conversation } = await getConversationMetaForTrainer(adminSession.admin.id, otherUserId);
      const { messages } = await getMessagesForConversation(conversation.id, { limit: 200 });
      return NextResponse.json(messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("messages/list", error);
    return NextResponse.json({ message: "Unable to fetch messages" }, { status: 500 });
  }
}