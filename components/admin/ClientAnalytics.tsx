"use client";

import { useEffect, useMemo, useState } from "react";
import ProgressAnalyticsChart from "@/components/charts/ProgressAnalyticsChart";
import { cn } from "@/utils/cn";

type SeriesPoint = {
  date: string;
  pct: number;
};

type Summary = {
  avgPct: number;
  submittedDays: number;
  bestPct: number;
  trend?: "up" | "down" | "flat";
};

type AnalyticsResponse = {
  series: SeriesPoint[];
  summary: Summary;
};

type ClientAnalyticsProps = {
  clientId: string;
};

const RANGE_OPTIONS = [7, 30, 90] as const;

const buildMockData = (days: number): AnalyticsResponse => {
  const today = new Date();
  const series: SeriesPoint[] = [];
  const values = [68, 72, 74, 78, 80, 82, 86, 90, 94, 96];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    series.push({
      date: d.toISOString().slice(0, 10),
      pct: values[(days - 1 - i) % values.length],
    });
  }
  const total = series.reduce((sum, point) => sum + point.pct, 0);
  const avgPct = series.length ? Math.round(total / series.length) : 0;
  const winDays = series.filter((point) => point.pct >= 60).length;
  const bestPct = series.length ? Math.max(...series.map((point) => point.pct)) : 0;
  return {
    series,
    summary: {
      avgPct,
      submittedDays: series.length,
      bestPct,
      trend: "up",
    },
  };
};

const buildMockBreakData = (): AnalyticsResponse => {
  const today = new Date();
  const values = [72, 78, 80, 84, 88, 92, 20, 0, 76, 82];
  const series: SeriesPoint[] = values.map((pct, index) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (values.length - 1 - index));
    return { date: d.toISOString().slice(0, 10), pct };
  });
  const total = series.reduce((sum, point) => sum + point.pct, 0);
  const avgPct = series.length ? Math.round(total / series.length) : 0;
  const winDays = series.filter((point) => point.pct >= 60).length;
  const bestPct = series.length ? Math.max(...series.map((point) => point.pct)) : 0;
  return {
    series,
    summary: {
      avgPct,
      submittedDays: series.length,
      bestPct,
      trend: "up",
    },
  };
};

export function ClientAnalytics({ clientId }: ClientAnalyticsProps) {
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [mockMode, setMockMode] = useState<"streak" | "break" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mock");
    if (mode === "break" || mode === "2") {
      setMockMode("break");
    } else if (mode === "1") {
      setMockMode("streak");
    } else {
      setMockMode(null);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    if (mockMode) {
      const mock = mockMode === "break" ? buildMockBreakData() : buildMockData(10);
      setData(mock);
      setLoading(false);
      setError(null);
      return () => {
        alive = false;
      };
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/clients/${clientId}/analytics?range=${range}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Unable to load analytics.");
        }
        const payload = (await res.json()) as AnalyticsResponse;
        if (alive) {
          setData(payload);
        }
      } catch (err: any) {
        if (alive) {
          setError(err?.message || "Unable to load analytics.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [clientId, range, mockMode]);

  const timeline = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return Array.from({ length: range }, (_, idx) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - (range - 1 - idx));
      return d.toISOString().slice(0, 10);
    });
  }, [range]);

  const chartData = useMemo(() => {
    const map = new Map(data?.series?.map((p) => [p.date, p.pct]) || []);
    return timeline.map((date) => ({
      date,
      completion: map.has(date) ? map.get(date) ?? null : null,
    }));
  }, [data?.series, timeline]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Client Analytics</p>
          <h2 className="text-2xl font-semibold">Progress & consistency</h2>
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-full p-1 mx-auto sm:mx-0">
          {RANGE_OPTIONS.map((value) => {
            const label = `${value}D`;
            const isActive = range === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm transition",
                  isActive ? "bg-white text-black font-medium shadow-md" : "text-neutral-400"
                )}
                aria-pressed={isActive}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <p className="text-sm text-white/40">Loading...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {!loading && !error && data && (
        <>
          {data.series.length === 0 ? (
            <p className="text-sm text-white/40">No submitted days yet for this range.</p>
          ) : (
            <div className="space-y-6">
              <div className="relative select-none w-full">
                <ProgressAnalyticsChart data={chartData} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center py-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Avg</p>
                  <p className="text-2xl font-semibold mt-1">{data.summary.avgPct}%</p>
                </div>
                <div className="text-center py-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Submitted</p>
                  <p className="text-2xl font-semibold mt-1">{data.summary.submittedDays}</p>
                </div>
                <div className="text-center py-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Best day</p>
                  <p className="text-2xl font-semibold mt-1">{data.summary.bestPct}%</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
