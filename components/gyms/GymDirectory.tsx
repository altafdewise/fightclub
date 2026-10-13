"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Download, ExternalLink, Instagram, MapPin, MessageCircle, Phone, Search, X } from "lucide-react";
import { CATEGORY_LABELS, mapsUrl, whatsappDigits, type Venue, type VenueCategory } from "@/lib/gyms";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 48;

type Props = {
  venues: Venue[];
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function csvEscape(value: string | number | null | undefined) {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: Venue[]) {
  const header = ["name", "category", "brand", "area", "address", "phone", "website", "instagram", "hours", "lat", "lng", "rating", "ratingCount", "source"];
  const lines = rows.map((v) =>
    [
      v.name,
      CATEGORY_LABELS[v.category],
      v.brand ?? "",
      v.area,
      v.address,
      v.phone,
      v.website ?? "",
      v.instagram ?? "",
      v.hours ?? "",
      v.lat ?? "",
      v.lng ?? "",
      v.rating ?? "",
      v.ratingCount ?? "",
      v.sources[0] ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function GymDirectory({ venues }: Props) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState<VenueCategory | "">("");
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);

  const areas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of venues) if (v.area) counts.set(v.area, (counts.get(v.area) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [venues]);

  const categories = useMemo(() => {
    const counts = new Map<VenueCategory, number>();
    for (const v of venues) counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
    return (Object.keys(CATEGORY_LABELS) as VenueCategory[]).filter((c) => counts.has(c)).map((c) => [c, counts.get(c)!] as const);
  }, [venues]);

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    return venues.filter((v) => {
      if (area && v.area !== area) return false;
      if (category && v.category !== category) return false;
      if (phoneOnly && !v.phone) return false;
      if (!q) return true;
      const hay = normalize(`${v.name} ${v.brand ?? ""} ${v.area} ${v.address} ${v.phone}`);
      return q.split(/\s+/).every((part) => hay.includes(part));
    });
  }, [venues, deferredQuery, area, category, phoneOnly]);

  const visible = filtered.slice(0, limit);
  const withPhone = venues.filter((v) => v.phone).length;
  const hasFilters = Boolean(query || area || category || phoneOnly);

  const resetFilters = () => {
    setQuery("");
    setArea("");
    setCategory("");
    setPhoneOnly(false);
    setLimit(PAGE_SIZE);
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hyderabad-gyms${area ? `-${area.toLowerCase().replace(/\s+/g, "-")}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Venues" value={venues.length} />
        <Stat label="With phone" value={withPhone} />
        <Stat label="Localities" value={areas.length} />
        <Stat label="Matching" value={filtered.length} highlight />
      </div>

      <div className="glass rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="Search by name, area, address or phone"
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm placeholder:text-white/35"
              aria-label="Search venues"
            />
          </label>
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            className="rounded-xl px-3 py-3 text-sm md:w-64"
            aria-label="Filter by locality"
          >
            <option value="">All localities ({areas.length})</option>
            {areas.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip active={category === ""} onClick={() => setCategory("")}>
            All types
          </Chip>
          {categories.map(([c, count]) => (
            <Chip key={c} active={category === c} onClick={() => { setCategory(category === c ? "" : c); setLimit(PAGE_SIZE); }}>
              {CATEGORY_LABELS[c]} <span className="text-white/40">{count}</span>
            </Chip>
          ))}
          <span className="hidden h-5 w-px bg-white/10 sm:block" />
          <Chip active={phoneOnly} onClick={() => { setPhoneOnly(!phoneOnly); setLimit(PAGE_SIZE); }}>
            <Phone size={12} /> Has phone
          </Chip>
          <div className="ml-auto flex items-center gap-2">
            {hasFilters && (
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-white/60 transition hover:text-white">
                <X size={12} /> Clear
              </button>
            )}
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold transition hover:border-[var(--gold)] disabled:opacity-40"
            >
              <Download size={13} /> CSV ({filtered.length})
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-lg font-semibold">No venues match.</p>
          <p className="mt-1 text-sm text-muted">Try a different spelling or clear the filters.</p>
          <button type="button" onClick={resetFilters} className="btn-secondary mt-5 text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </ul>
      )}

      {filtered.length > visible.length && (
        <div className="flex justify-center">
          <button type="button" onClick={() => setLimit((n) => n + PAGE_SIZE * 2)} className="btn-secondary text-sm">
            Show more ({filtered.length - visible.length} left)
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", highlight && "text-[var(--gold)]")}>{value.toLocaleString("en-IN")}</p>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-[var(--gold)] bg-[var(--goldSoft)] text-white"
          : "border-[var(--border)] bg-white/[0.02] text-white/70 hover:border-white/30 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function VenueCard({ venue: v }: { venue: Venue }) {
  const wa = v.phone ? whatsappDigits(v.phone) : null;
  const site = v.website ? v.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "";
  return (
    <li className="group flex h-full min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-snug" title={v.name}>
            {v.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/55">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{v.area || "Hyderabad"}</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--border)] bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/60">
          {CATEGORY_LABELS[v.category]}
        </span>
      </div>

      {v.address && <p className="line-clamp-2 text-xs leading-relaxed text-white/60">{v.address}</p>}

      <div className="mt-auto space-y-2 pt-1">
        {v.phone ? (
          <div className="flex items-center gap-2">
            <a href={`tel:${v.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-white/[0.02] px-3 py-2 text-sm font-medium tabular-nums transition hover:border-[var(--gold)]">
              <Phone size={14} className="shrink-0 text-[var(--gold)]" />
              <span className="truncate">{v.phone}</span>
            </a>
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${v.name}`}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white/[0.02] text-white/70 transition hover:border-[var(--gold)] hover:text-white"
              >
                <MessageCircle size={16} />
              </a>
            )}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-white/40">Phone not listed yet</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/55">
          <a href={mapsUrl(v)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition hover:text-[var(--gold)]">
            <MapPin size={12} /> Map
          </a>
          {v.website && (
            <a href={v.website} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[12rem] items-center gap-1 transition hover:text-[var(--gold)]">
              <ExternalLink size={12} /> <span className="truncate">{site}</span>
            </a>
          )}
          {v.instagram && (
            <a href={v.instagram.startsWith("http") ? v.instagram : `https://instagram.com/${v.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition hover:text-[var(--gold)]">
              <Instagram size={12} /> Instagram
            </a>
          )}
        </div>
        {v.hours && <p className="truncate text-[11px] text-white/40" title={v.hours}>Hours: {v.hours}</p>}
      </div>
    </li>
  );
}
