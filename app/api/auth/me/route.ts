import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const adminSession = await getAdminSession();
  if (adminSession?.admin) {
    return NextResponse.json({ id: adminSession.admin.id, role: "trainer" });
  }
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
