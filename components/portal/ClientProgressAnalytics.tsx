"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

type SeriesPoint = {
  date: string;
  pct: number;
};

type PlotPoint = {
  x: number;
  y: number;
  value: number | null;
  date: string;
  submitted: boolean;
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

type ClientProgressAnalyticsProps = {
  clientName: string;
};

const RANGE_OPTIONS = [7, 30, 90] as const;

export function ClientProgressAnalytics({
  clientName,
}: ClientProgressAnalyticsProps) {
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [animated, setAnimated] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      setAnimated(false);
      try {
        const res = await fetch(`/api/portal/analytics?range=${range}`, {
          credentials: "include",
        });
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
  }, [range]);

  useEffect(() => {
    setHoverIndex(null);
  }, [range, data?.series]);

  const chart = {
    width: 100,
    height: 100,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 8,
    paddingBottom: 16,
  } as const;

  const timeline = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return Array.from({ length: range }, (_, idx) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - (range - 1 - idx));
      return d.toISOString().slice(0, 10);
    });
  }, [range]);

  const plotPoints = useMemo<PlotPoint[]>(() => {
    const map = new Map(data?.series?.map((p) => [p.date, p.pct]) || []);
    const spanX = chart.width - chart.paddingLeft - chart.paddingRight;
    const spanY = chart.height - chart.paddingTop - chart.paddingBottom;

    return timeline.map((date, idx) => {
      const pct = map.get(date);
      const clamped = pct === undefined || pct === null ? null : Math.max(0, Math.min(100, pct));
      const x = chart.paddingLeft + (idx / Math.max(1, timeline.length - 1)) * spanX;
      const y = clamped === null ? chart.paddingTop + spanY : chart.paddingTop + (1 - clamped / 100) * spanY;
      return { x, y, value: clamped, date, submitted: clamped !== null };
    });
  }, [chart.height, chart.paddingBottom, chart.paddingLeft, chart.paddingRight, chart.paddingTop, chart.width, data?.series, timeline]);

  const segments = useMemo(() => {
    const acc: PlotPoint[][] = [];
    let current: PlotPoint[] = [];
    plotPoints.forEach((pt) => {
      if (pt.submitted) {
        current.push(pt);
      } else if (current.length) {
        acc.push(current);
        current = [];
      }
    });
    if (current.length) acc.push(current);
    return acc;
  }, [plotPoints]);

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let smoothedPath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const xMid = (pts[i - 1].x + pts[i].x) / 2;
      const yMid = (pts[i - 1].y + pts[i].y) / 2;
      smoothedPath += ` Q ${pts[i - 1].x} ${pts[i - 1].y} ${xMid} ${yMid}`;
    }
    smoothedPath += ` T ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    return smoothedPath;
  };

  const linePath = useMemo(() => segments.map((seg) => buildSmoothPath(seg)).join(" "), [segments]);

  const areaPath = useMemo(() => {
    const baseY = chart.height - chart.paddingBottom;
    return segments
      .map((seg) => {
        if (!seg.length) return "";
        const path = buildSmoothPath(seg);
        const first = seg[0];
        const last = seg[seg.length - 1];
        return `${path} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
      })
      .join(" ");
  }, [chart.height, chart.paddingBottom, segments]);

  const yTicks = useMemo(() => [0, 25, 50, 75, 100], []);

  const xTicks = useMemo(() => {
    if (!timeline.length) return [];
    const pick = [0, Math.floor((timeline.length - 1) / 2), timeline.length - 1];
    const unique = Array.from(new Set(pick));
    return unique.map((idx) => {
      const date = new Date(`${timeline[idx]}T00:00:00Z`);
      const label = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
      return { idx, label };
    });
  }, [timeline]);

  const hoveredPoint = hoverIndex !== null ? plotPoints[hoverIndex] : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Your journey
          </p>
          <h2 className="text-2xl font-semibold mt-1">You&apos;re showing up.</h2>
        </div>
        <div className="inline-flex w-fit gap-1 rounded-xl border border-white/15 bg-white/[0.02] p-1 mx-auto sm:mx-0">
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

      {/* Loading & Error States */}
      {loading && <p className="text-sm text-white/40">Loading...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {/* Graph */}
      {!loading && !error && data && (
        <>
          {data.series.length === 0 ? (
            <p className="text-sm text-white/40">
              No submitted days yet for this range.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="relative select-none w-full px-0">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-56 sm:h-60"
                  role="img"
                  aria-label="Completion over time"
                >
                  <defs>
                    <linearGradient id="progress-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.24)" />
                      <stop offset="90%" stopColor="rgba(255,255,255,0.02)" />
                    </linearGradient>
                  </defs>

                  {/* Grid + axes */}
                  {yTicks.map((tick) => {
                    const y = chart.paddingTop + (1 - tick / 100) * (chart.height - chart.paddingTop - chart.paddingBottom);
                    return (
                      <g key={`y-${tick}`}>
                        <line
                          x1={chart.paddingLeft}
                          x2={chart.width - chart.paddingRight}
                          y1={y}
                          y2={y}
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="0.5"
                          vectorEffect="non-scaling-stroke"
                        />
                        <text
                          x={chart.paddingLeft - 2}
                          y={y + 1.5}
                          textAnchor="end"
                          fontSize="4"
                          fill="rgba(255,255,255,0.45)"
                        >
                          {tick}%
                        </text>
                      </g>
                    );
                  })}
                  <line
                    x1={chart.paddingLeft}
                    x2={chart.width - chart.paddingRight}
                    y1={chart.height - chart.paddingBottom}
                    y2={chart.height - chart.paddingBottom}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.75"
                    vectorEffect="non-scaling-stroke"
                  />

                  {xTicks.map(({ idx, label }) => {
                    const pt = plotPoints[idx];
                    if (!pt) return null;
                    return (
                      <g key={`x-${idx}`}>
                        <line
                          x1={pt.x}
                          x2={pt.x}
                          y1={chart.height - chart.paddingBottom}
                          y2={chart.height - chart.paddingBottom + 2}
                          stroke="rgba(255,255,255,0.25)"
                          strokeWidth="0.6"
                          vectorEffect="non-scaling-stroke"
                        />
                        <text
                          x={pt.x}
                          y={chart.height - chart.paddingBottom + 6}
                          fontSize="4"
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.55)"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill */}
                  <path
                    d={areaPath}
                    fill="url(#progress-gradient)"
                    opacity={hoverIndex !== null ? 0.65 : 0.85}
                  />

                  {/* Main data line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{
                      opacity: animated ? 1 : 0,
                      transition: "opacity 500ms ease-out",
                    }}
                  />

                  {/* Points */}
                  {plotPoints.map((point, idx) => {
                    if (!point.submitted) return null;
                    const active = hoverIndex === idx;
                    return (
                      <circle
                        key={`point-${idx}`}
                        cx={point.x}
                        cy={point.y}
                        r={active ? 3.8 : 2.6}
                        fill={active ? "#fff" : "rgba(255,255,255,0.9)"}
                        stroke={active ? "rgba(0,0,0,0.35)" : "transparent"}
                        strokeWidth={active ? 0.6 : 0}
                        style={{
                          opacity: animated ? 1 : 0,
                          transition: `transform 150ms ease, opacity 400ms ease-out ${animated ? 180 + idx * 16 : 0}ms`,
                          transformOrigin: "center",
                        }}
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}

                  {/* Hover line */}
                  {hoveredPoint && (
                    <line
                      x1={hoveredPoint.x}
                      x2={hoveredPoint.x}
                      y1={chart.paddingTop}
                      y2={chart.height - chart.paddingBottom}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </svg>

                {/* Interaction layer */}
                <div
                  className="absolute inset-0"
                  onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const ratio = (event.clientX - rect.left) / rect.width;
                    const idx = Math.round(Math.max(0, Math.min(1, ratio)) * (timeline.length - 1));
                    setHoverIndex(idx);
                  }}
                  onMouseLeave={() => setHoverIndex(null)}
                />

                {/* Tooltip */}
                {hoveredPoint && (
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      left: `${(hoveredPoint.x / chart.width) * 100}%`,
                      top: `${(hoveredPoint.y / chart.height) * 100}%`,
                      transform: "translate(-50%, -120%)",
                    }}
                  >
                    <div className="rounded-lg bg-black/80 px-3 py-2 text-xs text-white shadow-lg border border-white/10">
                      <p className="font-semibold">{hoveredPoint.date}</p>
                      <p className="mt-1">{hoveredPoint.submitted ? `${hoveredPoint.value}%` : "No entry"}</p>
                    </div>
                  </div>
                )}
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
