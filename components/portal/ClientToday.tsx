"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { WeeklyCheckinCard } from "@/components/portal/WeeklyCheckinCard";
import ProgressAnalyticsChart from "@/components/charts/ProgressAnalyticsChart";
import { isSafeHttpUrl } from "@/utils/url";
import { MessageCircle } from "lucide-react";

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
  videoUrl?: string | null;
};

type DaySummary = {
  date: string;
  totalItems: number;
  completedItems: number;
  completionPct: number;
  isSubmitted: boolean;
  isWinDay: boolean;
};

type Streaks = {
  current: number;
  best: number;
};

type WeeklyStatus = {
  canSubmit: boolean;
  daysRemaining: number;
  nextUnlockDate: Date | null;
};

type RangeOption = "7D" | "30D" | "90D";

type ClientTodayProps = {
  name: string;
  note: string;
  items: ChecklistItem[];
  date: string;
  summary: DaySummary;
  streaks: Streaks;
  isResetDetected?: boolean;
  weeklyStatus: WeeklyStatus;
  progressData?: { date: string; completion: number }[];
  unreadMessages?: number;
};

type CalendarDay = {
  date: string;
  completion_pct: number;
  is_submitted: boolean;
  is_win_day: boolean;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ClientToday({
  name,
  note,
  items: initialItems,
  date,
  summary: initialSummary,
  streaks: initialStreaks,
  isResetDetected,
  weeklyStatus,
  progressData,
  unreadMessages = 0,
}: ClientTodayProps) {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [summary, setSummary] = useState<DaySummary>(initialSummary);
  const [streaks, setStreaks] = useState<Streaks>(initialStreaks);
  const [calendarDays, setCalendarDays] = useState<Record<string, CalendarDay>>(() => ({
    [date]: {
      date,
      completion_pct: initialSummary.completionPct,
      is_submitted: initialSummary.isSubmitted,
      is_win_day: initialSummary.isWinDay,
    },
  }));
  const [submitting, setSubmitting] = useState(false);
  const [hoorahOpen, setHoorahOpen] = useState(false);
  const [hoorahCompletion, setHoorahCompletion] = useState(0);
  const [hoorahWin, setHoorahWin] = useState(false);
  const [selectedRange, setSelectedRange] = useState<RangeOption>("30D");
  const isLocked = summary.isSubmitted;

  const total = items.length;
  const checkedCount = items.filter((item) => item.checked).length;
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const calendarMonth = date.slice(0, 7);
  const normalizedWeeklyStatus = useMemo<WeeklyStatus>(() => {
    const parsedDate = weeklyStatus.nextUnlockDate
      ? new Date(weeklyStatus.nextUnlockDate as unknown as string)
      : null;
    return { ...weeklyStatus, nextUnlockDate: parsedDate };
  }, [weeklyStatus]);
  const calendarMeta = useMemo(() => {
    const [yearText, monthText] = calendarMonth.split("-");
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;
    const start = new Date(Date.UTC(year, monthIndex, 1));
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const startWeekday = start.getUTCDay();
    return { year, monthIndex, daysInMonth, startWeekday };
  }, [calendarMonth]);

  const displayedProgressData = useMemo(() => {
    if (!progressData) return [];
    const rangeMap: Record<RangeOption, number> = { "7D": 7, "30D": 30, "90D": 90 };
    const limit = rangeMap[selectedRange];
    return limit ? progressData.slice(-limit) : progressData;
  }, [progressData, selectedRange]);

  const progressStats = useMemo(() => {
    if (!displayedProgressData || displayedProgressData.length === 0) {
      return { average: 0, submitted: 0, best: 0 };
    }

    const submissions = displayedProgressData.map((entry) => Number(entry.completion) || 0);
    const submitted = submissions.filter((value) => value > 0).length;
    const total = submissions.reduce((acc, value) => acc + value, 0);
    const average = Math.round(total / submissions.length);
    const best = Math.max(...submissions, 0);

    return { average, submitted, best };
  }, [displayedProgressData]);

  // Detect if daily reset occurred (data is stale)
  useEffect(() => {
    if (isResetDetected) {
      console.log("[RESET DETECTED] Daily reset occurred, reloading page...");
      window.location.reload();
    }
  }, [isResetDetected]);

  useEffect(() => {
    let alive = true;
    const loadCalendar = async () => {
      try {
        const res = await fetch(`/api/portal/calendar?month=${calendarMonth}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        const map: Record<string, CalendarDay> = {};
        (data.days as CalendarDay[]).forEach((day) => {
          map[day.date] = day;
        });
        setCalendarDays((prev) => ({ ...prev, ...map }));
      } catch {
        if (alive) setCalendarDays({});
      }
    };
    loadCalendar();
    return () => {
      alive = false;
    };
  }, [calendarMonth]);

  useEffect(() => {
    if (!hoorahOpen) return;
    const timer = window.setTimeout(() => {
      setHoorahOpen(false);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [hoorahOpen]);

  useEffect(() => {
    if (!hoorahOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHoorahOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hoorahOpen]);

  const toggle = async (item: ChecklistItem) => {
    if (isLocked) return;
    const nextChecked = !item.checked;
    setSavingId(item.id);
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, checked: nextChecked } : it))
    );

    try {
      const res = await fetch("/api/portal/today/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, checked: nextChecked }),
      });

      if (!res.ok) {
        throw new Error("Unable to update.");
      }
    } catch {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, checked: item.checked } : it))
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  };

  const handleSubmitDay = async () => {
    if (summary.isSubmitted || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/submit-day", { method: "POST" });
      if (!res.ok) {
        throw new Error("Unable to submit.");
      }
      const data = await res.json();
      setSummary((prev) => ({
        ...prev,
        totalItems: total,
        completedItems: checkedCount,
        completionPct: data.completion_pct ?? progress,
        isSubmitted: true,
        isWinDay: data.is_win_day ?? progress >= 60,
      }));
      setStreaks({
        current: data.current_streak ?? streaks.current,
        best: data.best_streak ?? streaks.best,
      });
      setCalendarDays((prev) => ({
        ...prev,
        [date]: {
          date,
          completion_pct: data.completion_pct ?? progress,
          is_submitted: true,
          is_win_day: data.is_win_day ?? progress >= 60,
        },
      }));
      setHoorahCompletion(data.completion_pct ?? progress);
      setHoorahWin(data.is_win_day ?? progress >= 60);
      setHoorahOpen(true);
    } catch {
      // no-op
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Today</p>
          <h1 className="text-3xl md:text-4xl font-bold">Welcome, {name}.</h1>
          <p className="text-xs text-white/50 mt-2">{date}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push("/portal/messages")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition duration-150 hover:bg-white/[0.12] hover:border-amber-300/60 hover:shadow-[0_0_25px_rgba(255,200,120,0.35)]"
          >
            <span className="relative flex items-center justify-center">
              <MessageCircle className="h-[18px] w-[18px] text-white" />
              {unreadMessages > 0 && (
                <span className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              )}
            </span>
            <span>Messages</span>
          </button>
          <button
            onClick={() => router.push("/portal/history")}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-4xl font-bold text-white">{streaks.current}</p>
            <p className="text-xs text-white/50 uppercase tracking-wider mt-3">Current Streak</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-4xl font-bold text-white">{streaks.best}</p>
            <p className="text-xs text-white/50 uppercase tracking-wider mt-3">Best Streak</p>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-2">
        <WeeklyCheckinCard status={normalizedWeeklyStatus} />
      </div>

      <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
        <h2 className="text-xl font-semibold">Trainer Note</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          {note ? note : "No note added yet. Check back soon for your updated guidance."}
        </p>
      </div>

      <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Exercise Checklist</p>
            <h2 className="text-xl font-semibold">Today's work</h2>
          </div>
          <div className="text-sm text-white/60">
            {checkedCount} of {total} completed
          </div>
        </div>

        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white transition-all shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {total === 0 ? (
          <p className="text-sm text-white/50">No exercises assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const hasVideo = isSafeHttpUrl(item.videoUrl);
              return (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border border-white/10 px-4 py-4 transition",
                    item.checked && "bg-white/[0.05]",
                    isLocked
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer hover:bg-white/[0.04]"
                  )}
                  aria-disabled={isLocked}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      readOnly
                      onClick={(event) => {
                        event.preventDefault();
                        toggle(item);
                      }}
                      disabled={savingId === item.id || isLocked}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60",
                        item.checked ? "bg-white border-white" : "bg-transparent border-white/30"
                      )}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className={cn(
                          "h-3.5 w-3.5 text-black transition",
                          item.checked ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden="true"
                      >
                        <path
                          d="M12.5 4.5 6.8 10.2 3.5 6.9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm text-white/90 truncate">{item.label}</span>
                  </div>
                  {hasVideo && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (item.videoUrl) {
                          window.open(item.videoUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.06]"
                    >
                      Video
                    </button>
                  )}
                </label>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/50">
            {summary.isSubmitted
              ? "Submitted for today."
              : "Submit your day to lock in your win."}
          </p>
          <button
            type="button"
            onClick={handleSubmitDay}
            disabled={summary.isSubmitted || submitting}
            className={cn(
              "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white text-black px-4 py-2.5 text-sm font-semibold transition w-full sm:w-auto",
              summary.isSubmitted || submitting
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-white/90"
            )}
          >
            {summary.isSubmitted ? "Submitted" : submitting ? "Submitting..." : "Submit Day"}
          </button>
        </div>
      </div>

      {progressData && (
        <div className="relative w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 md:p-8 overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none before:content-['']">
          <div className="relative z-10 flex items-start justify-between mb-6">
            <div>
              <p className="text-xs tracking-widest text-neutral-500 uppercase">CLIENT ANALYTICS</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">Progress &amp; consistency</h2>
            </div>

            <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
              {["7D", "30D", "90D"].map((range) => {
                const isActive = range === selectedRange;
                return (
                  <button
                    key={range}
                    type="button"
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm transition",
                      isActive
                        ? "bg-white text-black font-medium shadow-md"
                        : "text-neutral-400"
                    )}
                    aria-pressed={isActive}
                    onClick={() => setSelectedRange(range as RangeOption)}
                  >
                    {range}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-2 pb-4">
            <ProgressAnalyticsChart data={displayedProgressData} />
          </div>

          <div className="relative z-10 grid grid-cols-3 mt-6 pt-6 border-t border-white/10 text-center">
            <div>
              <p className="text-xs text-neutral-500 tracking-wide uppercase">Avg</p>
              <p className="text-2xl md:text-3xl font-semibold text-white mt-1">{progressStats.average}%</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 tracking-wide uppercase">Submitted</p>
              <p className="text-2xl md:text-3xl font-semibold text-white mt-1">{progressStats.submitted}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 tracking-wide uppercase">Best day</p>
              <p className="text-2xl md:text-3xl font-semibold text-white mt-1">{progressStats.best}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Calendar</p>
          <h2 className="text-xl font-semibold">
            {MONTHS[calendarMeta.monthIndex]} {calendarMeta.year}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-2 text-xs text-white/50">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: calendarMeta.startWeekday }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: calendarMeta.daysInMonth }).map((_, index) => {
            const dayNumber = index + 1;
            const dayKey = `${calendarMonth}-${String(dayNumber).padStart(2, "0")}`;
            const status = calendarDays[dayKey];
            const isToday = dayKey === date;
            return (
              <div
                key={dayKey}
                className={cn(
                  "relative flex h-10 items-center justify-center rounded-xl border border-white/10 text-sm text-white/70",
                  isToday && "border-white/40 text-white"
                )}
              >
                <span>{dayNumber}</span>
                {status?.is_submitted && (
                  <span
                    className={cn(
                      "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                      status.is_win_day ? "bg-white" : "bg-white/30"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span>Submitted win day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <span>Submitted (not win)</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300",
          hoorahOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!hoorahOpen}
      >
        <div
          className={cn(
            "rounded-2xl border border-white/10 bg-black/80 p-6 md:p-8 text-center shadow-xl transition-transform duration-300",
            hoorahOpen ? "scale-100" : "scale-95"
          )}
          role="dialog"
          aria-modal="true"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Hoorah</p>
          <h3 className="text-2xl font-semibold mt-2">Day submitted.</h3>
          <p className="text-sm text-white/70 mt-2">
            Completion {hoorahCompletion}% {hoorahWin ? "win day." : "keep going."}
          </p>

          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <p className="text-6xl font-bold text-white">{streaks.current}</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-2">Current</p>
            </div>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <div className="text-center">
              <p className="text-6xl font-bold text-white">{streaks.best}</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-2">Best</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
