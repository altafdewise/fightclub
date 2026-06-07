"use client";

import { useCallback, useEffect, useState } from "react";
import { WEIGHT_CLASSES } from "@/lib/fightclub/config";

interface BookingRow {
  id: string;
  type: "viewer" | "boxer" | "challenge";
  full_name: string;
  email: string;
  phone: string;
  quantity: number | null;
  amount: number;
  status: "pending" | "paid" | "failed";
  coupon_code: string | null;
  created_at: string;
}
interface BoxerRow extends BookingRow {
  entry: {
    weight_kg: number | null;
    weight_class: string | null;
    experience: string | null;
    experience_years: number | null;
  } | null;
  selfieSignedUrl: string | null;
}
interface ChallengeRow extends BookingRow {
  entry: {
    target_name: string;
    age: number | null;
    city: string | null;
    instagram: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    weight_class: string | null;
    stance: string | null;
    experience: string | null;
    experience_years: number | null;
    fight_record: string | null;
    training_gym: string | null;
    coach_name: string | null;
    strengths: string | null;
    injuries: string | null;
    medical_conditions: string | null;
    availability: string | null;
    challenge_reason: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    terms_accepted: boolean;
  } | null;
  selfieSignedUrl: string | null;
}
interface AdminData {
  totals: { paidCount: number; viewerPaid: number; boxerPaid: number; challengePaid: number; revenuePaise: number };
  viewers: BookingRow[];
  boxers: BoxerRow[];
  challenges: ChallengeRow[];
  stuck: BookingRow[];
}

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
const when = (iso: string) => new Date(iso).toLocaleString("en-IN");

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/fightclub/admin/data");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (res.ok) {
      setData(await res.json());
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch("/api/fightclub/admin/data");
      if (!active) return;
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (res.ok) {
        setData(await res.json());
        setAuthed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/fightclub/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Wrong password.");
      return;
    }
    setPassword("");
    await loadData();
  }

  // ── Login gate ─────────────────────────────────────────────────
  if (authed !== true) {
    return (
      <main className="section-space flex min-h-screen flex-col items-center justify-center py-24">
        <form onSubmit={login} className="fc-card w-full max-w-sm space-y-4 p-8 text-center">
          <p className="fc-kicker">Fight Club</p>
          <h1 className="text-2xl font-bold uppercase text-[var(--fc-text)]">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full rounded-xl px-3 py-3 text-sm"
          />
          {loginError && <p className="text-sm text-red-300">{loginError}</p>}
          <button type="submit" className="btn-blood w-full">
            Enter
          </button>
        </form>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="section-space flex min-h-screen items-center justify-center py-24">
        <p className="text-[var(--fc-muted)]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="section-space py-16">
      <div className="mb-10">
        <p className="fc-kicker">Fight Club · Series Two</p>
        <h1 className="text-3xl font-bold uppercase text-[var(--fc-text)]">Gate List</h1>
      </div>

      {/* Totals */}
      {(() => {
        // A true comp is ₹0 (PBC). PBC1 is a ₹1 paid booking, counted as paid.
        const comped =
          data.viewers.filter((v) => v.coupon_code && v.amount === 0).length +
          data.boxers.filter((b) => b.coupon_code && b.amount === 0).length +
          data.challenges.filter((c) => c.coupon_code && c.amount === 0).length;
        return (
          <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-6">
            <Stat label="Paid bookings" value={String(data.totals.paidCount)} />
            <Stat label="Viewers" value={String(data.totals.viewerPaid)} />
            <Stat label="Boxers" value={String(data.totals.boxerPaid)} />
            <Stat label="Challenges" value={String(data.totals.challengePaid)} />
            <Stat label="Comp (coupon)" value={String(comped)} />
            <Stat label="Revenue" value={rupees(data.totals.revenuePaise)} highlight />
          </div>
        );
      })()}

      {/* Stuck / failed */}
      <Section
        title={`Stuck / failed payments (${data.stuck.length})`}
        subtitle="Started but never reached paid status."
      >
        {data.stuck.length === 0 ? (
          <Empty>No stuck or failed attempts.</Empty>
        ) : (
          <Table head={["Name", "Type", "Email", "Phone", "Qty", "Amount", "Status", "When"]}>
            {data.stuck.map((r) => (
              <tr key={r.id} className="border-t border-[var(--fc-line)]">
                <Td>{r.full_name || "—"}</Td>
                <Td>{r.type}</Td>
                <Td>{r.email || "—"}</Td>
                <Td>{r.phone || "—"}</Td>
                <Td>{r.quantity ?? "—"}</Td>
                <Td>{rupees(r.amount)}</Td>
                <Td>
                  <Badge status={r.status} />
                </Td>
                <Td>{when(r.created_at)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      {/* Boxers — grouped by weight division so you can match opponents */}
      <Section title={`Purvik Challenges (${data.challenges.length})`} action={<ExportBtn type="challenges" />}>
        {data.challenges.length === 0 ? (
          <Empty>No paid Purvik challengers yet.</Empty>
        ) : (
          <Table
            head={[
              "Selfie",
              "Name",
              "Profile",
              "Contact",
              "Safety",
              "Reason",
              "Emergency",
              "Booked",
              "Paid",
              "Status",
            ]}
          >
            {data.challenges.map((c) => (
              <tr key={c.id} className="border-t border-[var(--fc-line)] align-top">
                <Td>
                  {c.selfieSignedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.selfieSignedUrl}
                      alt={c.full_name}
                      onClick={() => setZoom(c.selfieSignedUrl)}
                      className="h-14 w-14 cursor-pointer rounded-lg object-cover ring-1 ring-[var(--fc-line)]"
                    />
                  ) : (
                    <span className="text-[var(--fc-muted)]">â€”</span>
                  )}
                </Td>
                <Td>
                  <span className="block font-semibold">{c.full_name}</span>
                  <span className="block text-xs text-[var(--fc-muted)]">
                    {c.entry?.age ? `${c.entry.age} yrs` : "Age â€”"}
                    {c.entry?.city ? ` · ${c.entry.city}` : ""}
                  </span>
                  {c.entry?.instagram && (
                    <span className="block text-xs text-[var(--fc-ember)]">{c.entry.instagram}</span>
                  )}
                </Td>
                <Td>
                  <span className="block">{c.entry?.weight_class || "â€”"}</span>
                  <span className="block text-xs text-[var(--fc-muted)]">
                    {c.entry?.height_cm ? `${c.entry.height_cm}cm` : "Height â€”"}
                    {c.entry?.weight_kg ? ` · ${c.entry.weight_kg}kg` : ""}
                  </span>
                  <span className="block text-xs text-[var(--fc-muted)]">
                    {c.entry?.stance || "Stance â€”"} · {c.entry?.experience || "Experience â€”"}
                    {c.entry?.experience_years ? ` · ${c.entry.experience_years}yr` : ""}
                  </span>
                  <span className="block text-xs text-[var(--fc-muted)]">
                    Record: {c.entry?.fight_record || "â€”"}
                  </span>
                  <span className="block text-xs text-[var(--fc-muted)]">
                    Gym: {c.entry?.training_gym || "â€”"}
                  </span>
                </Td>
                <Td>
                  <a href={`tel:${c.phone}`} className="block text-[var(--fc-ember)] hover:underline">
                    {c.phone}
                  </a>
                  <a href={`mailto:${c.email}`} className="block text-xs hover:underline">
                    {c.email}
                  </a>
                  <span className="block text-xs text-[var(--fc-muted)]">
                    Available: {c.entry?.availability || "â€”"}
                  </span>
                </Td>
                <Td className="min-w-[220px] text-xs">
                  <span className="block text-[var(--fc-text)]">Injuries: {c.entry?.injuries || "â€”"}</span>
                  <span className="block text-[var(--fc-muted)]">
                    Medical: {c.entry?.medical_conditions || "â€”"}
                  </span>
                </Td>
                <Td className="min-w-[220px] text-xs text-[var(--fc-muted)]">
                  <span className="block text-[var(--fc-text)]">{c.entry?.challenge_reason || "â€”"}</span>
                  <span className="mt-1 block">Strengths: {c.entry?.strengths || "â€”"}</span>
                </Td>
                <Td>
                  <span className="block">{c.entry?.emergency_contact_name || "â€”"}</span>
                  {c.entry?.emergency_contact_phone && (
                    <a href={`tel:${c.entry.emergency_contact_phone}`} className="text-xs text-[var(--fc-ember)] hover:underline">
                      {c.entry.emergency_contact_phone}
                    </a>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-xs text-[var(--fc-muted)]">{when(c.created_at)}</Td>
                <Td>{rupees(c.amount)}</Td>
                <Td>
                  <Badge status={c.status} />
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      <Section title={`Boxers (${data.boxers.length})`} action={<ExportBtn type="boxers" />}>
        {data.boxers.length === 0 ? (
          <Empty>No paid boxers yet.</Empty>
        ) : (
          <div className="space-y-9">
            {groupBoxersByDivision(data.boxers).map(({ division, range, rows }) => (
              <div key={division}>
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--fc-line)] pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--fc-ember)]">
                    {division}
                  </h3>
                  {range && <span className="text-xs text-[var(--fc-muted)]">{range}</span>}
                  <span className="text-xs font-semibold text-[var(--fc-muted)]">
                    · {rows.length} {rows.length === 1 ? "fighter" : "fighters"}
                  </span>
                </div>
                <Table
                  head={["Selfie", "Name", "Experience", "Phone", "Email", "Booked", "Paid", "Status"]}
                >
                  {rows.map((b) => (
                    <tr key={b.id} className="border-t border-[var(--fc-line)] align-top">
                      <Td>
                        {b.selfieSignedUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.selfieSignedUrl}
                            alt={b.full_name}
                            onClick={() => setZoom(b.selfieSignedUrl)}
                            className="h-14 w-14 cursor-pointer rounded-lg object-cover ring-1 ring-[var(--fc-line)]"
                          />
                        ) : (
                          <span className="text-[var(--fc-muted)]">—</span>
                        )}
                      </Td>
                      <Td>
                        <span className="flex items-center gap-2 font-semibold">
                          {b.full_name}
                          {b.coupon_code && <CompBadge code={b.coupon_code} />}
                        </span>
                      </Td>
                      <Td>
                        {b.entry?.experience || "—"}
                        {b.entry?.experience_years ? ` · ${b.entry.experience_years}yr` : ""}
                      </Td>
                      <Td>
                        <a href={`tel:${b.phone}`} className="text-[var(--fc-ember)] hover:underline">
                          {b.phone}
                        </a>
                      </Td>
                      <Td>
                        <a href={`mailto:${b.email}`} className="hover:underline">
                          {b.email}
                        </a>
                      </Td>
                      <Td className="whitespace-nowrap text-xs text-[var(--fc-muted)]">{when(b.created_at)}</Td>
                      <Td>{b.coupon_code && b.amount === 0 ? "Cash (comp)" : "UPI"}</Td>
                      <Td>
                        <Badge status={b.status} />
                      </Td>
                    </tr>
                  ))}
                </Table>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Viewers */}
      <Section title={`Viewers (${data.viewers.length})`} action={<ExportBtn type="viewers" />}>
        {data.viewers.length === 0 ? (
          <Empty>No paid viewers yet.</Empty>
        ) : (
          <Table head={["Name", "Email", "Phone", "Tickets", "Amount", "Paid", "Status"]}>
            {data.viewers.map((v) => (
              <tr key={v.id} className="border-t border-[var(--fc-line)]">
                <Td>
                  <span className="flex items-center gap-2">
                    {v.full_name}
                    {v.coupon_code && <CompBadge code={v.coupon_code} />}
                  </span>
                </Td>
                <Td>{v.email}</Td>
                <Td>{v.phone}</Td>
                <Td>{v.quantity ?? 1}</Td>
                <Td>{rupees(v.amount)}</Td>
                <Td>{v.coupon_code && v.amount === 0 ? "Cash (comp)" : "UPI"}</Td>
                <Td>
                  <Badge status={v.status} />
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      {/* Selfie zoom overlay */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="Selfie" className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain" />
        </div>
      )}
    </main>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="fc-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fc-muted)]">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-[var(--fc-ember)]" : "text-[var(--fc-text)]"}`}>
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-tight text-[var(--fc-text)]">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--fc-muted)]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--fc-line)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-[rgba(0,0,0,0.4)]">
            {head.map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fc-muted)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 text-[var(--fc-text)] ${className ?? ""}`}>{children}</td>;
}

// Groups paid boxers by their weight division, in WEIGHT_CLASSES order,
// with anyone missing a division collected under "Unspecified".
function groupBoxersByDivision(boxers: BoxerRow[]) {
  const rangeOf = (label: string) =>
    WEIGHT_CLASSES.find((c) => c.label === label)?.range ?? "";
  const groups: { division: string; range: string; rows: BoxerRow[] }[] = [];

  for (const cls of WEIGHT_CLASSES) {
    const rows = boxers.filter((b) => b.entry?.weight_class === cls.label);
    if (rows.length) groups.push({ division: cls.label, range: rangeOf(cls.label), rows });
  }

  const unspecified = boxers.filter(
    (b) => !b.entry?.weight_class || !WEIGHT_CLASSES.some((c) => c.label === b.entry?.weight_class)
  );
  if (unspecified.length) groups.push({ division: "Unspecified", range: "", rows: unspecified });

  return groups;
}

function Badge({ status }: { status: string }) {
  const color =
    status === "paid"
      ? "text-green-300 border-green-500/30 bg-green-500/10"
      : status === "failed"
      ? "text-red-300 border-red-500/30 bg-red-500/10"
      : "text-amber-300 border-amber-500/30 bg-amber-500/10";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color}`}>
      {status}
    </span>
  );
}

function CompBadge({ code }: { code: string }) {
  return (
    <span
      title={`Coupon: ${code}`}
      className="rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-300"
    >
      Comp · {code}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--fc-line)] bg-[rgba(0,0,0,0.3)] px-4 py-6 text-center text-sm text-[var(--fc-muted)]">
      {children}
    </div>
  );
}

function ExportBtn({ type }: { type: "boxers" | "viewers" | "challenges" }) {
  return (
    <a
      href={`/api/fightclub/admin/export?type=${type}`}
      className="btn-blood-ghost !px-4 !py-2 text-xs"
    >
      Export CSV
    </a>
  );
}
