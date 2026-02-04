import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth";
import { getHistoryPayload } from "@/lib/portal";

export async function GET() {
  const session = await getClientSession();
  if (!session?.client) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const history = await getHistoryPayload(session.client.id);
  return NextResponse.json({ history });
}
