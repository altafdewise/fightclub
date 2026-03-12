import { NextRequest, NextResponse } from "next/server";
import {
  assertConversationAccess,
  getMessagesForConversation,
  getUnreadCount,
  resolveChatAccess,
} from "@/lib/chat";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversation_id");
    const cursor = searchParams.get("cursor") || undefined;

    if (!conversationId) {
      return NextResponse.json({ message: "conversation_id is required." }, { status: 400 });
    }

    const access = await resolveChatAccess();
    await assertConversationAccess(access, conversationId);

    const currentUser = access.role === "hq" ? null : { id: access.userId, type: access.role } as const;

    const { messages, hasMore } = await getMessagesForConversation(conversationId, {
      cursor,
      limit: 30,
    });
    const unreadCount = await getUnreadCount(conversationId, currentUser ?? { type: "hq" });

    return NextResponse.json({ messages, hasMore, unreadCount, currentUser });
  } catch (error: any) {
    console.error(error);
    const message = error?.message || "Unable to load messages.";
    if (message === "Unauthorized") {
      return NextResponse.json({ message }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ message }, { status: 403 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
