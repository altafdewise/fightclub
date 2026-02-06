"use client";

import { useMemo } from "react";

type ActivityData = {
  day: string;
  trainers: number;
  clients: number;
};

type HQActivityGraphProps = {
  trainerCount: number;
  clientCount: number;
};

export function HQActivityGraph({ trainerCount, clientCount }: HQActivityGraphProps) {
  // Generate sample data for the past 7 days
  const data: ActivityData[] = useMemo(() => {
    const today = new Date();
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simulate realistic growth pattern
      const dayOfWeek = date.getDay();
      const daysAgo = 6 - i;

      // Trainers: ensure minimum of 1 for visualization, grow steadily
      const baseTrainers = Math.max(1, Math.floor(trainerCount * 0.6));
      const trainersValue = Math.max(
        Math.floor(baseTrainers + daysAgo * 0.5),
        1
      );

      // Clients: ensure minimum of 2 for visualization, grow faster
      const baseClients = Math.max(2, Math.floor(clientCount * 0.5));
      const clientsValue = Math.max(
        Math.floor(baseClients + daysAgo * 1.2),
        2
      );

      days.push({
        day: dayNames[dayOfWeek],
        trainers: trainersValue,
        clients: clientsValue,
      });
    }
    return days;
  }, [trainerCount, clientCount]);

  // Calculate ranges for scaling
  const maxTrainers = Math.max(...data.map((d) => d.trainers), 1);
  const maxClients = Math.max(...data.map((d) => d.clients), 1);
  const maxValue = Math.max(maxTrainers, maxClients);

  // Calculate SVG path for trainers line
  const trainersPath = useMemo(() => {
    const width = 500;
    const height = 150;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return data
      .map((point, idx) => {
        const x = padding + (idx / (data.length - 1 || 1)) * chartWidth;
        const y = height - padding - (point.trainers / maxValue) * chartHeight;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [data, maxValue]);

  // Calculate SVG path for clients line
  const clientsPath = useMemo(() => {
    const width = 500;
    const height = 150;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return data
      .map((point, idx) => {
        const x = padding + (idx / (data.length - 1 || 1)) * chartWidth;
        const y = height - padding - (point.clients / maxValue) * chartHeight;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [data, maxValue]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Activity Overview</p>
        <h2 className="text-2xl font-semibold mt-1">System Growth</h2>
      </div>

      <div className="space-y-4">
        {/* Graph */}
        <svg
          viewBox="0 0 500 150"
          className="w-full h-40"
        >
          {/* Grid lines */}
          <line x1="20" x2="480" y1="90" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="20" x2="480" y1="45" y2="45" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

          {/* Trainers line */}
          <path
            d={trainersPath}
            fill="none"
            stroke="rgba(239, 68, 68, 0.8)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Clients line */}
          <path
            d={clientsPath}
            fill="none"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Trainers points */}
          {data.map((point, idx) => {
            const x = 20 + (idx / (data.length - 1 || 1)) * 460;
            const y = 130 - (point.trainers / maxValue) * 100;
            return (
              <circle
                key={`trainer-${idx}`}
                cx={x}
                cy={y}
                r="2.5"
                fill="rgba(239, 68, 68, 0.9)"
                filter="drop-shadow(0 0 1px rgba(239, 68, 68, 0.4))"
              />
            );
          })}

          {/* Clients points */}
          {data.map((point, idx) => {
            const x = 20 + (idx / (data.length - 1 || 1)) * 460;
            const y = 130 - (point.clients / maxValue) * 100;
            return (
              <circle
                key={`client-${idx}`}
                cx={x}
                cy={y}
                r="2.5"
                fill="rgba(59, 130, 246, 0.9)"
                filter="drop-shadow(0 0 1px rgba(59, 130, 246, 0.4))"
              />
            );
          })}
        </svg>

        {/* Day labels */}
        <div className="flex justify-between px-2 text-xs text-white/30 font-medium">
          {data.map((point, idx) => (
            <span key={idx}>{point.day}</span>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(239, 68, 68, 0.8)" }} />
            <span className="text-xs text-white/60">Trainers ({data[data.length - 1]?.trainers || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(59, 130, 246, 0.8)" }} />
            <span className="text-xs text-white/60">Clients ({data[data.length - 1]?.clients || 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
