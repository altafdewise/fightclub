import { NextResponse } from "next/server";
import { getAdminSession, getClientSession, getHQSession } from "@/lib/auth";

export async function GET() {
  try {
    const clientSession = await getClientSession();
    if (clientSession?.client) {
      return NextResponse.json({ role: "client", id: clientSession.client.id });
    }

    const adminSession = await getAdminSession();
    if (adminSession?.admin) {
      return NextResponse.json({ role: "trainer", id: adminSession.admin.id });
    }

    const hqSession = await getHQSession();
    if (hqSession?.hq) {
      return NextResponse.json({ role: "hq", id: "hq" });
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (error: any) {
    const message = error?.message || "Unauthorized";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
