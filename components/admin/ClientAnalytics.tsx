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
  const [animated, setAnimated] = useState(false);

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
    setAnimated(false);
    if (mockMode) {
      const mock = mockMode === "break" ? buildMockBreakData() : buildMockData(10);
      setData(mock);
      setLoading(false);
      setError(null);
      requestAnimationFrame(() => setAnimated(true));
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
          requestAnimationFrame(() => setAnimated(true));
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

  const smoothPath = useMemo(() => {
    if (points.length < 2) return "";
    let smoothedPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const xMid = (points[i - 1].x + points[i].x) / 2;
      const yMid = (points[i - 1].y + points[i].y) / 2;
      smoothedPath += ` Q ${points[i - 1].x} ${points[i - 1].y} ${xMid} ${yMid}`;
    }
    smoothedPath += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return smoothedPath;
  }, [points]);

  const winLine = useMemo(() => {
    const height = 100;
    const padding = 10;
    const minY = padding;
    const maxY = height - padding;
    return minY + (1 - 0.6) * (maxY - minY);
  }, []);

  // Generate weekday labels
  const weekdayLabels = useMemo(() => {
    if (!data?.series?.length) return [];
    const labels = ["S", "M", "T", "W", "T", "F", "S"];
    const result = [];
    for (let i = 0; i < data.series.length; i++) {
      const date = new Date(data.series[i].date);
      const dayIndex = date.getDay();
      result.push({
        index: i,
        label: labels[dayIndex],
        date: data.series[i].date,
      });
    }
    // Show every Nth label based on range to avoid crowding
    const step = range === 90 ? Math.ceil(result.length / 6) : Math.ceil(result.length / 8);
    return result.filter((_, i) => i % step === 0 || i === result.length - 1);
  }, [data, range]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Client Analytics</p>
          <h2 className="text-2xl font-semibold">Progress & consistency</h2>
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
                  : "text-white/60 hover:text-white"
              )}
            >
              {value}D
            </button>
          ))}
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
              {/* Main SVG Graph */}
              <div className="relative">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-48 transform-gpu"
                  style={{ perspective: "1000px" }}
                >
                  {/* Horizontal guideline (60% threshold) */}
                  <line
                    x1="8"
                    x2="92"
                    y1={winLine}
                    y2={winLine}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Subtle top guideline */}
                  <line
                    x1="8"
                    x2="92"
                    y1="10"
                    y2="10"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Main data line with animation */}
                  <path
                    d={smoothPath}
                    fill="none"
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{
                      opacity: animated ? 1 : 0,
                      transition: "opacity 600ms ease-out",
                      strokeDasharray: animated ? "0" : "1000",
                      strokeDashoffset: animated ? "0" : "1000",
                      transitionProperty: "stroke-dashoffset, opacity",
                      transitionDuration: "700ms, 600ms",
                      transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1), ease-out",
                    }}
                  />

                  {/* Points */}
                  {points.map((point, idx) => (
                    <circle
                      key={`point-${idx}`}
                      cx={point.x}
                      cy={point.y}
                      r="2.5"
                      fill={point.isGhost ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)"}
                      style={{
                        opacity: animated ? 1 : 0,
                        transition: `opacity 600ms ease-out ${animated ? 200 + idx * 20 : 0}ms`,
                        filter: "drop-shadow(0 0 1px rgba(255,255,255,0.4))",
                      }}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
              </div>

              {/* X-Axis Labels (Weekdays) */}
              <div className="flex justify-between px-2 text-xs text-white/30 font-medium tracking-wider">
                {weekdayLabels.map((label, idx) => (
                  <span key={`label-${idx}`} className="opacity-60">
                    {label.label}
                  </span>
                ))}
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center py-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Win days</p>
                  <p className="text-2xl font-semibold mt-1">{data.summary.winDays}</p>
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
