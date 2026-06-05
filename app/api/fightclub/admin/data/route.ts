import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/fightclub/admin-auth";
import { getAdminData } from "@/lib/fightclub/bookings";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const data = await getAdminData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[fightclub/admin/data]", error);
    return NextResponse.json({ message: "Could not load data." }, { status: 500 });
  }
}
