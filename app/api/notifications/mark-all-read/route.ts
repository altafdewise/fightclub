import { NextResponse } from "next/server";
import { getAdminSession, getClientSession, getHQSession } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/notifications";

export async function POST() {
  try {
    const clientSession = await getClientSession();
    if (clientSession?.client) {
      await markAllNotificationsRead("client", clientSession.client.id);
      return NextResponse.json({ ok: true });
    }

    const adminSession = await getAdminSession();
    if (adminSession?.admin) {
      await markAllNotificationsRead("trainer", adminSession.admin.id);
      return NextResponse.json({ ok: true });
    }

    const hqSession = await getHQSession();
    if (hqSession?.hq) {
      await markAllNotificationsRead("hq", "hq");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to mark notifications" }, { status: 500 });
  }
}
