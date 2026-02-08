"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: { date: string; completion: number | null | undefined }[];
};

const formatDateLabel = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export default function ProgressAnalyticsChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const normalized = data
      .map((d) => {
        const parsedDate = new Date(d.date);
        if (Number.isNaN(parsedDate.getTime())) return null;

        const numeric = d.completion == null ? null : Number(d.completion);
        const completion = typeof numeric === "number" && Number.isFinite(numeric)
          ? Math.max(0, Math.min(100, numeric))
          : null;

        return {
          date: parsedDate.toISOString(),
          completion,
        } as const;
      })
      .filter(Boolean) as { date: string; completion: number | null }[];

    const validPoints = normalized.filter((entry) => entry.completion !== null);
    if (validPoints.length === 1) {
      const firstDate = new Date(validPoints[0].date);
      normalized.unshift({
        date: new Date(firstDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        completion: 0,
      });
    }

    return normalized;
  }, [data]);

  if (!mounted) return null;

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center text-sm text-white/50 py-12">
        No progress data yet. Complete your daily checklist to start tracking.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[340px] overflow-visible">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="lineGlow" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            padding={{ left: 10, right: 10 }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
          />
          <YAxis
            width={28}
            tickMargin={8}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: any) => `${value}%`}
            labelFormatter={(label) => formatDateLabel(label as string)}
            contentStyle={{
              background: "rgba(10,10,10,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "#fff",
            }}
            labelStyle={{ color: "#aaa" }}
            itemStyle={{ color: "#fff" }}
            cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="completion"
            stroke="none"
            fill="url(#areaGlow)"
            connectNulls
          />

          <Line
            type="monotone"
            dataKey="completion"
            stroke="#ffffff"
            strokeWidth={6}
            opacity={0.15}
            dot={false}
            activeDot={false}
            filter="url(#lineGlow)"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="completion"
            stroke="#EDEDED"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#EDEDED", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
