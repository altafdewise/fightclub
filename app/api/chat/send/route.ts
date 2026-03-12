import { NextResponse } from "next/server";
import {
  getConversationById,
  insertMessage,
  markMessagesRead,
} from "@/lib/chat";
import { getClientSession, getAdminSession, getHQSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conversationId: string | undefined = body?.conversation_id;
    const messageText: string | undefined = body?.message_text;
    const imageUrl: string | undefined = body?.image_url;
    const clientTempId: string | undefined = body?.client_temp_id;

    if (!conversationId) {
      return NextResponse.json({ message: "conversation_id is required." }, { status: 400 });
    }

    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
    }

    const adminSession = await getAdminSession();
    const clientSession = await getClientSession();
    const hqSession = await getHQSession();

      let senderType: "client" | "trainer" | null = null;
      let senderId: string | null = null;

    if (clientSession?.client && conversation.client_id === clientSession.client.id) {
        senderType = "client";
      senderId = clientSession.client.id;
    } else if (adminSession?.admin && conversation.trainer_id === adminSession.admin.id) {
        senderType = "trainer";
      senderId = adminSession.admin.id;
    } else if (hqSession?.hq) {
      return NextResponse.json({ message: "HQ cannot send messages." }, { status: 403 });
    }

      if (!senderType || !senderId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const message = await insertMessage({
      conversationId,
      senderId,
        senderType,
      clientId: conversation.client_id,
      clientTempId,
      trainerId: conversation.trainer_id,
        content: messageText,
      imageUrl,
    });

      await markMessagesRead(conversationId, { type: senderType, id: senderId });

    // Notify the other party
    try {
      if (senderRole === "client") {
        await createNotification({
          userType: "trainer",
          userId: conversation.trainer_id,
          title: "New message",
          message: "You have a new message",
          type: "new_message",
          link: `/trainer/messages/${conversation.client_id}`,
        });
      } else if (senderRole === "trainer") {
        await createNotification({
          userType: "client",
          userId: conversation.client_id,
          title: "New message",
          message: "You have a new message",
          type: "new_message",
          link: `/portal/messages`,
        });
      }
    } catch (notifyErr) {
      console.error("Failed to create message notification", notifyErr);
    }

    return NextResponse.json({ ok: true, message });
  } catch (error: any) {
    console.error(error);
    const message = error?.message || "Unable to send message.";
    if (message === "Unauthorized") {
      return NextResponse.json({ message }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ message }, { status: 403 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
