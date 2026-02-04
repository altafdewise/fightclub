"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

type SeriesPoint = {
  date: string;
  pct: number;
};

type Summary = {
  avgPct: number;
  winDays: number;
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

const RANGE_OPTIONS = [30, 90] as const;

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
      winDays,
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
      winDays,
      submittedDays: series.length,
      bestPct,
      trend: "up",
    },
  };
};

export function ClientAnalytics({ clientId }: ClientAnalyticsProps) {
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>(30);
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
        const res = await fetch(`/api/admin/clients/${clientId}/analytics?range=${range}`);
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

  const points = useMemo(() => {
    if (!data?.series?.length) return [];
    const width = 100;
    const height = 100;
    const padding = 10;
    const maxX = width - padding;
    const maxY = height - padding;
    const minY = padding;
    const count = data.series.length;
    if (count === 1) {
      const pct = Math.max(0, Math.min(100, data.series[0].pct));
      const y = minY + (1 - pct / 100) * (maxY - minY);
      const center = width / 2;
      const offset = 12;
      const left = Math.max(padding, center - offset);
      const right = Math.min(maxX, center + offset);
      return [
        { x: left, y, isGhost: true },
        { x: right, y, isGhost: false },
      ];
    }
    return data.series.map((point, index) => {
      const x = padding + (index / (count - 1)) * (maxX - padding);
      const pct = Math.max(0, Math.min(100, point.pct));
      const y = minY + (1 - pct / 100) * (maxY - minY);
      return { x, y, isGhost: false };
    });
  }, [data]);

  const path = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  }, [points]);

  const winLine = useMemo(() => {
    const height = 100;
    const padding = 10;
    const minY = padding;
    const maxY = height - padding;
    return minY + (1 - 0.6) * (maxY - minY);
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Client Analytics</p>
          <h2 className="text-xl font-semibold">Monthly progression</h2>
          <p className="text-xs text-white/50 mt-1">Daily completion percentage</p>
        </div>
        <div className="inline-flex rounded-xl border border-white/15 bg-white/[0.02] p-1">
          {RANGE_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition",
                range === value
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              )}
            >
              {value}D
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-white/50">Loading analytics...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs text-white/50">Avg completion</p>
              <p className="text-lg font-semibold">{data.summary.avgPct}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs text-white/50">Win days</p>
              <p className="text-lg font-semibold">{data.summary.winDays}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs text-white/50">Submitted days</p>
              <p className="text-lg font-semibold">{data.summary.submittedDays}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs text-white/50">Best day</p>
              <p className="text-lg font-semibold">{data.summary.bestPct}%</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 overflow-hidden">
            {data.series.length === 0 ? (
              <p className="text-sm text-white/50">No submitted days yet for this range.</p>
            ) : (
              <svg
                viewBox="0 0 100 100"
                className="w-full h-40 scale-[1.06] origin-center transform-gpu"
              >
                <line
                  x1="10"
                  x2="90"
                  y1={winLine}
                  y2={winLine}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="2 3"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                />
                {points.length > 0 && points[0].isGhost && (
                  <circle
                    cx={points[0].x}
                    cy={points[0].y}
                    r="2.2"
                    fill="rgba(255,255,255,0.35)"
                  />
                )}
                {points.length > 0 && (
                  <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="2.2"
                    fill="white"
                  />
                )}
              </svg>
            )}
          </div>

          {data.summary.trend && (
            <p className="text-xs text-white/50">
              Trend: {data.summary.trend}
            </p>
          )}
        </>
      )}
    </div>
  );
}
