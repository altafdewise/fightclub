import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getClientSession, getHQSession } from "@/lib/auth";
import { getNotifications, getUnreadCount } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const clientSession = await getClientSession();
    if (clientSession?.client) {
      const [items, unread] = await Promise.all([
        getNotifications("client", clientSession.client.id, 30),
        getUnreadCount("client", clientSession.client.id),
      ]);
      return NextResponse.json({ notifications: items, unread });
    }

    const adminSession = await getAdminSession();
    if (adminSession?.admin) {
      const [items, unread] = await Promise.all([
        getNotifications("trainer", adminSession.admin.id, 30),
        getUnreadCount("trainer", adminSession.admin.id),
      ]);
      return NextResponse.json({ notifications: items, unread });
    }

    const hqSession = await getHQSession();
    if (hqSession?.hq) {
      const [items, unread] = await Promise.all([
        getNotifications("hq", "hq", 30),
        getUnreadCount("hq", "hq"),
      ]);
      return NextResponse.json({ notifications: items, unread });
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to load notifications" }, { status: 500 });
  }
}
