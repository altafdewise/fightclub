import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getClientSession, getHQSession } from "@/lib/auth";
import { markNotificationRead } from "@/lib/notifications";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ message: "Notification id required" }, { status: 400 });

  try {
    const clientSession = await getClientSession();
    if (clientSession?.client) {
      await markNotificationRead(id, "client", clientSession.client.id);
      return NextResponse.json({ ok: true });
    }

    const adminSession = await getAdminSession();
    if (adminSession?.admin) {
      await markNotificationRead(id, "trainer", adminSession.admin.id);
      return NextResponse.json({ ok: true });
    }

    const hqSession = await getHQSession();
    if (hqSession?.hq) {
      await markNotificationRead(id, "hq", "hq");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to mark notification" }, { status: 500 });
  }
}
