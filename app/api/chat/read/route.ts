import { NextResponse } from "next/server";
import { assertConversationAccess, markMessagesRead, resolveChatAccess } from "@/lib/chat";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conversationId: string | undefined = body?.conversation_id;

    if (!conversationId) {
      return NextResponse.json({ message: "conversation_id is required." }, { status: 400 });
    }

    const access = await resolveChatAccess();
    await assertConversationAccess(access, conversationId);
    await markMessagesRead(conversationId, access.role);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error(error);
    const message = error?.message || "Unable to mark as read.";
    if (message === "Unauthorized") {
      return NextResponse.json({ message }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ message }, { status: 403 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
