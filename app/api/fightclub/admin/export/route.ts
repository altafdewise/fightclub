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
    } else if (type === "challenges") {
      csv = toCsv(
        [
          "Booking ID",
          "Name",
          "Email",
          "Phone",
          "Target",
          "Age",
          "City",
          "Instagram",
          "Height cm",
          "Weight kg",
          "Division",
          "Stance",
          "Experience",
          "Years",
          "Fight Record",
          "Gym",
          "Coach",
          "Strengths",
          "Injuries",
          "Medical Conditions",
          "Availability",
          "Reason",
          "Emergency Name",
          "Emergency Phone",
          "Amount (â‚¹)",
          "Status",
          "Booked at",
        ],
        data.challenges.map((c) => [
          c.id,
          c.full_name,
          c.email,
          c.phone,
          c.entry?.target_name ?? "",
          c.entry?.age ?? "",
          c.entry?.city ?? "",
          c.entry?.instagram ?? "",
          c.entry?.height_cm ?? "",
          c.entry?.weight_kg ?? "",
          c.entry?.weight_class ?? "",
          c.entry?.stance ?? "",
          c.entry?.experience ?? "",
          c.entry?.experience_years ?? "",
          c.entry?.fight_record ?? "",
          c.entry?.training_gym ?? "",
          c.entry?.coach_name ?? "",
          c.entry?.strengths ?? "",
          c.entry?.injuries ?? "",
          c.entry?.medical_conditions ?? "",
          c.entry?.availability ?? "",
          c.entry?.challenge_reason ?? "",
          c.entry?.emergency_contact_name ?? "",
          c.entry?.emergency_contact_phone ?? "",
          (c.amount / 100).toFixed(0),
          c.status,
          c.created_at,
        ])
      );
      filename = "fightclub-challenges.csv";
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
      return NextResponse.json({ message: "type must be boxers, viewers, or challenges." }, { status: 400 });
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
