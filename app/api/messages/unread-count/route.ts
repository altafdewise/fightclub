import { NextResponse } from "next/server";
import { getAdminSession, getClientSession, getHQSession } from "@/lib/auth";
import { getTotalUnreadForUser } from "@/lib/chat";

export async function GET() {
  try {
    const clientSession = await getClientSession();
    if (clientSession?.client) {
      const count = await getTotalUnreadForUser({ role: "client", userId: clientSession.client.id });
      return NextResponse.json({ unread: count });
    }

    const adminSession = await getAdminSession();
    if (adminSession?.admin) {
      const count = await getTotalUnreadForUser({ role: "trainer", userId: adminSession.admin.id });
      return NextResponse.json({ unread: count });
    }

    const hqSession = await getHQSession();
    if (hqSession?.hq) {
      const count = await getTotalUnreadForUser({ role: "hq", userId: "hq" });
      return NextResponse.json({ unread: count });
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("unread-count failed", error);
    return NextResponse.json({ message: "Unable to fetch unread count" }, { status: 500 });
  }
}
