import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/fightclub/admin-auth";
import { getAdminData } from "@/lib/fightclub/bookings";

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  return [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\r\n");
}

// Gate-list export for boxers / viewers. ?type=boxers | viewers
export async function GET(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const type = new URL(req.url).searchParams.get("type");
    const data = await getAdminData();

    let csv: string;
    let filename: string;

    if (type === "boxers") {
      csv = toCsv(
        ["Booking ID", "Name", "Email", "Phone", "Division", "Experience", "Years", "Acknowledged", "Paid via", "Coupon", "Status", "Booked at"],
        data.boxers.map((b) => [
          b.id,
          b.full_name,
          b.email,
          b.phone,
          b.entry?.weight_class ?? "",
          b.entry?.experience ?? "",
          b.entry?.experience_years ?? "",
          "yes",
          b.coupon_code && b.amount === 0 ? "Cash (comp)" : "UPI",
          b.coupon_code ?? "",
          b.status,
          b.created_at,
        ])
      );
      filename = "fightclub-boxers.csv";
    } else if (type === "viewers") {
      csv = toCsv(
        ["Booking ID", "Name", "Email", "Phone", "Tickets", "Amount (₹)", "Paid via", "Coupon", "Status"],
        data.viewers.map((v) => [
          v.id,
          v.full_name,
          v.email,
          v.phone,
          v.quantity ?? 1,
          (v.amount / 100).toFixed(0),
          v.coupon_code && v.amount === 0 ? "Cash (comp)" : "UPI",
          v.coupon_code ?? "",
          v.status,
        ])
      );
      filename = "fightclub-viewers.csv";
    } else {
      return NextResponse.json({ message: "type must be boxers or viewers." }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[fightclub/admin/export]", error);
    return NextResponse.json({ message: "Export failed." }, { status: 500 });
  }
}
