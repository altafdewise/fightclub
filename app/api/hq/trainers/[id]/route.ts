import { NextResponse } from "next/server";
import { requireHQ } from "@/lib/auth";
import { query, transaction } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireHQ();

    const { id } = await params;

    await transaction(async (client) => {
      await client.query("DELETE FROM sessions WHERE admin_id = $1", [id]);
      await client.query("DELETE FROM admins WHERE id = $1", [id]);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to delete trainer." }, { status: 500 });
  }
}
