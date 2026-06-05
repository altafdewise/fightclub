import { fcSupabase, SELFIE_BUCKET } from "./supabase";
import type { EntryType } from "./config";

export interface BookingRow {
  id: string;
  type: EntryType;
  full_name: string;
  email: string;
  phone: string;
  quantity: number | null;
  amount: number; // paise
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  coupon_code: string | null;
  status: "pending" | "paid" | "failed";
  created_at: string;
  updated_at: string;
}

export interface BoxerEntryRow {
  id: string;
  booking_id: string;
  weight_kg: number | null;
  weight_class: string | null;
  experience: string | null;
  experience_years: number | null;
  selfie_url: string | null;
  created_at: string;
}

export interface AcknowledgementRow {
  id: string;
  booking_id: string | null;
  full_name: string;
  all_points_accepted: boolean;
  accepted_at: string;
  points_version: number;
}

// ── Bookings ───────────────────────────────────────────────────────

export async function createPendingBooking(input: {
  type: EntryType;
  fullName: string;
  email: string;
  phone: string;
  quantity: number | null;
  amount: number;
  razorpayOrderId: string;
  couponCode?: string | null;
}): Promise<BookingRow> {
  const { data, error } = await fcSupabase()
    .from("fc_bookings")
    .insert({
      type: input.type,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      quantity: input.quantity,
      amount: input.amount,
      currency: "INR",
      razorpay_order_id: input.razorpayOrderId,
      coupon_code: input.couponCode ?? null,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data as BookingRow;
}

// Insert a fully comped booking — used by the coupon flow for offline
// cash sales. Status starts at "paid"; no Razorpay round-trip happens.
export async function createComplimentaryBooking(input: {
  type: EntryType;
  fullName: string;
  email: string;
  phone: string;
  quantity: number | null;
  couponCode: string;
}): Promise<BookingRow> {
  const { data, error } = await fcSupabase()
    .from("fc_bookings")
    .insert({
      type: input.type,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      quantity: input.quantity,
      amount: 0,
      currency: "INR",
      razorpay_order_id: null,
      coupon_code: input.couponCode,
      status: "paid",
    })
    .select()
    .single();
  if (error) throw error;
  return data as BookingRow;
}

export async function getBookingByOrderId(orderId: string): Promise<BookingRow | null> {
  const { data, error } = await fcSupabase()
    .from("fc_bookings")
    .select()
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (error) throw error;
  return (data as BookingRow) ?? null;
}

export async function markBookingPaid(
  orderId: string,
  paymentId: string
): Promise<BookingRow> {
  const { data, error } = await fcSupabase()
    .from("fc_bookings")
    .update({ status: "paid", razorpay_payment_id: paymentId })
    .eq("razorpay_order_id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data as BookingRow;
}

export async function markBookingFailed(orderId: string): Promise<void> {
  // Only knock a still-pending row down to failed — never overwrite a paid one.
  const { error } = await fcSupabase()
    .from("fc_bookings")
    .update({ status: "failed" })
    .eq("razorpay_order_id", orderId)
    .eq("status", "pending");
  if (error) throw error;
}

// ── Boxer entries ──────────────────────────────────────────────────

export async function createBoxerEntry(input: {
  bookingId: string;
  weightKg: number | null;
  weightClass: string | null;
  experience: string | null;
  experienceYears: number | null;
  selfieUrl: string | null;
}): Promise<void> {
  const { error } = await fcSupabase().from("fc_boxer_entries").insert({
    booking_id: input.bookingId,
    weight_kg: input.weightKg,
    weight_class: input.weightClass,
    experience: input.experience,
    experience_years: input.experienceYears,
    selfie_url: input.selfieUrl,
  });
  if (error) throw error;
}

// ── Acknowledgements ───────────────────────────────────────────────

export async function createAcknowledgement(input: {
  fullName: string;
  allPointsAccepted: boolean;
  pointsVersion: number;
}): Promise<AcknowledgementRow> {
  const { data, error } = await fcSupabase()
    .from("fc_acknowledgements")
    .insert({
      full_name: input.fullName,
      all_points_accepted: input.allPointsAccepted,
      points_version: input.pointsVersion,
    })
    .select()
    .single();
  if (error) throw error;
  return data as AcknowledgementRow;
}

export async function linkAcknowledgementToBooking(
  ackId: string,
  bookingId: string
): Promise<void> {
  const { error } = await fcSupabase()
    .from("fc_acknowledgements")
    .update({ booking_id: bookingId })
    .eq("id", ackId);
  if (error) throw error;
}

// ── Storage: signed URL for a private selfie ──────────────────────
export async function signedSelfieUrl(path: string, expiresIn = 60 * 30): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await fcSupabase()
    .storage.from(SELFIE_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}

// ── Admin aggregates ───────────────────────────────────────────────

export interface AdminData {
  totals: {
    paidCount: number;
    viewerPaid: number;
    boxerPaid: number;
    revenuePaise: number;
  };
  viewers: BookingRow[];
  boxers: Array<BookingRow & { entry: BoxerEntryRow | null; selfieSignedUrl: string | null }>;
  stuck: BookingRow[]; // pending or failed
}

export async function getAdminData(): Promise<AdminData> {
  const sb = fcSupabase();

  const { data: bookings, error: bErr } = await sb
    .from("fc_bookings")
    .select()
    .order("created_at", { ascending: false });
  if (bErr) throw bErr;
  const rows = (bookings ?? []) as BookingRow[];

  const { data: entries, error: eErr } = await sb.from("fc_boxer_entries").select();
  if (eErr) throw eErr;
  const entryByBooking = new Map<string, BoxerEntryRow>();
  for (const e of (entries ?? []) as BoxerEntryRow[]) entryByBooking.set(e.booking_id, e);

  const paid = rows.filter((r) => r.status === "paid");
  const viewers = rows.filter((r) => r.type === "viewer" && r.status === "paid");
  const boxerPaidRows = rows.filter((r) => r.type === "boxer" && r.status === "paid");
  const stuck = rows.filter((r) => r.status !== "paid");

  const boxers = await Promise.all(
    boxerPaidRows.map(async (r) => {
      const entry = entryByBooking.get(r.id) ?? null;
      const selfieSignedUrl = entry?.selfie_url
        ? await signedSelfieUrl(entry.selfie_url)
        : null;
      return { ...r, entry, selfieSignedUrl };
    })
  );

  return {
    totals: {
      paidCount: paid.length,
      viewerPaid: viewers.length,
      boxerPaid: boxerPaidRows.length,
      revenuePaise: paid.reduce((sum, r) => sum + (r.amount || 0), 0),
    },
    viewers,
    boxers,
    stuck,
  };
}
