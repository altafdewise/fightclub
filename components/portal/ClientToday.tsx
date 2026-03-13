"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { WeeklyCheckinCard } from "@/components/portal/WeeklyCheckinCard";
import ProgressAnalyticsChart from "@/components/charts/ProgressAnalyticsChart";
import { isSafeHttpUrl } from "@/utils/url";
import { Menu, MessageCircle, X } from "lucide-react";
import { renderTrainerNote } from "@/lib/notesRenderer";
import { supabaseClient } from "@/lib/supabaseClient";
import { groupWorkoutBlocks } from "@/lib/workouts";

type ChecklistItem = {
  id: string;
  label: string;
  blockName?: string;
  exerciseName?: string;
  prescription?: string;
  notes?: string;
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
type ActivePanel = "notes" | "workout" | "progress" | null;

type ClientTodayProps = {
  clientId: string;
  name: string;
  note: string;
  noteHtml?: string;
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

const panelShellClassName =
  "rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-5 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl sm:p-6";

export function ClientToday({
  clientId,
  name,
  note,
  noteHtml = "",
  items: initialItems,
  date,
  summary: initialSummary,
  streaks: initialStreaks,
  weeklyStatus,
  progressData,
  unreadMessages = 0,
}: ClientTodayProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [trainerNote, setTrainerNote] = useState(note);
  const [trainerNoteHtml, setTrainerNoteHtml] = useState(noteHtml);
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
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
    const totalCompletion = submissions.reduce((acc, value) => acc + value, 0);
    const average = Math.round(totalCompletion / submissions.length);
    const best = Math.max(...submissions, 0);

    return { average, submitted, best };
  }, [displayedProgressData]);
  const workoutBlocks = useMemo(() => groupWorkoutBlocks(items), [items]);

  useEffect(() => {
    const supabase = supabaseClient;
    const channel = supabase
      .channel(`trainer-notes-${clientId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trainer_notes", filter: `client_id=eq.${clientId}` },
        (payload: any) => {
          setTrainerNote(payload.new?.note ?? "");
          setTrainerNoteHtml(payload.new?.note_html ?? "");
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "trainer_notes", filter: `client_id=eq.${clientId}` },
        (payload: any) => {
          setTrainerNote(payload.new?.note ?? "");
          setTrainerNoteHtml(payload.new?.note_html ?? "");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  useEffect(() => {
    let alive = true;
    const loadCalendar = async () => {
      try {
        const res = await fetch(`/api/portal/calendar?month=${calendarMonth}`, {
          credentials: "include",
        });
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
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!activePanel && !hoorahOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (activePanel) setActivePanel(null);
      if (hoorahOpen) setHoorahOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activePanel, hoorahOpen]);

  const toggle = async (item: ChecklistItem) => {
    if (isLocked) return;
    const nextChecked = !item.checked;
    setSavingId(item.id);
    setItems((prev) =>
      prev.map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, checked: nextChecked } : currentItem
      )
    );

    try {
      const res = await fetch("/api/portal/today/check", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, checked: nextChecked }),
      });

      if (!res.ok) {
        throw new Error("Unable to update.");
      }
    } catch {
      setItems((prev) =>
        prev.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, checked: item.checked } : currentItem
        )
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST", credentials: "include" });
    router.push("/portal/login");
  };

  const handleSubmitDay = async () => {
    if (summary.isSubmitted || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/submit-day", {
        method: "POST",
        credentials: "include",
      });
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

  const openPanel = (panel: Exclude<ActivePanel, null>) => {
    setMenuOpen(false);
    setActivePanel(panel);
  };

  const goToWeeklyCheckin = () => {
    setMenuOpen(false);
    router.push(normalizedWeeklyStatus.canSubmit ? "/portal/checkin" : "/portal/checkin/history");
  };

  const goToMessages = () => {
    setMenuOpen(false);
    router.push("/portal/messages");
  };

  const goToHistory = () => {
    setMenuOpen(false);
    router.push("/portal/history");
  };

  const summaryCards = [
    {
      label: "Current streak",
      value: String(streaks.current),
      helper: streaks.current === 1 ? "1 win day in a row" : `${streaks.current} win days in a row`,
    },
    {
      label: "Best streak",
      value: String(streaks.best),
      helper: streaks.best === 1 ? "1 best run" : `${streaks.best} best run`,
    },
    {
      label: "Messages",
      value: unreadMessages > 99 ? "99+" : String(unreadMessages),
      helper: unreadMessages > 0 ? "Unread coach messages" : "Inbox is clear",
    },
  ];

  const renderWorkoutPanel = () => (
    <div className={cn(panelShellClassName, "space-y-5")}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">Today&apos;s Work</p>
          <h2 className="text-xl font-semibold text-white">Exercise checklist</h2>
        </div>
        <div className="text-sm text-white/60">
          {checkedCount} of {total} completed
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {total === 0 ? (
        <p className="text-sm text-white/50">No exercises assigned yet.</p>
      ) : (
        <div className="space-y-5">
          {workoutBlocks.map((block) => (
            <div key={block.id} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/45">Block</p>
                  <h3 className="text-lg font-semibold text-white">{block.name}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/55">
                  {block.exercises.length} exercise{block.exercises.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {block.exercises.map((item) => {
                  const hasVideo = isSafeHttpUrl(item.videoUrl);
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex items-start gap-4 rounded-2xl border border-white/10 px-4 py-4 transition",
                        item.checked && "bg-white/[0.05]",
                        isLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-white/[0.04]"
                      )}
                      aria-disabled={isLocked}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-4">
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
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60",
                            item.checked ? "border-white bg-white" : "border-white/30 bg-transparent"
                          )}
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className={cn("h-3.5 w-3.5 text-black transition", item.checked ? "opacity-100" : "opacity-0")}
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
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-medium leading-relaxed text-white/92 break-words">
                            {item.exerciseName || item.label}
                            {item.prescription ? <span className="text-white/60"> — {item.prescription}</span> : null}
                          </p>
                          {item.notes ? <p className="text-xs leading-relaxed text-white/55">{item.notes}</p> : null}
                        </div>
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
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/50">
          {summary.isSubmitted ? "Submitted for today." : "Submit your day to lock in the work."}
        </p>
        <button
          type="button"
          onClick={handleSubmitDay}
          disabled={summary.isSubmitted || submitting}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition sm:w-auto",
            summary.isSubmitted || submitting ? "cursor-not-allowed opacity-60" : "hover:bg-white/90"
          )}
        >
          {summary.isSubmitted ? "Submitted" : submitting ? "Submitting..." : "Submit Day"}
        </button>
      </div>
    </div>
  );

  const renderNotesPanel = () => (
    <div className={cn(panelShellClassName, "space-y-4")}>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">Trainer Notes</p>
        <h2 className="text-xl font-semibold text-white">Latest guidance</h2>
      </div>
      {trainerNote ? (
        <div
          className="trainer-note prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderTrainerNote(trainerNote, trainerNoteHtml) }}
        />
      ) : (
        <p className="text-sm leading-relaxed text-white/70">
          No note has been added yet. Your latest guidance will appear here.
        </p>
      )}
    </div>
  );

  const renderProgressPanel = () => (
    <div className="space-y-6">
      {progressData && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:content-[''] sm:p-6">
          <div className="relative z-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500">Progress</p>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Consistency trend</h2>
            </div>

            <div className="flex w-full rounded-full border border-white/10 bg-white/5 p-1 sm:w-auto">
              {["7D", "30D", "90D"].map((range) => {
                const isActive = range === selectedRange;
                return (
                  <button
                    key={range}
                    type="button"
                    className={cn(
                      "flex-1 rounded-full px-4 py-1.5 text-sm transition sm:flex-none",
                      isActive ? "bg-white font-medium text-black shadow-md" : "text-neutral-400"
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

          <div className="relative z-10 pb-4 pt-2">
            <ProgressAnalyticsChart data={displayedProgressData} />
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 text-center sm:grid-cols-3 sm:gap-0">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Avg</p>
              <p className="mt-1 text-2xl font-semibold text-white">{progressStats.average}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Submitted</p>
              <p className="mt-1 text-2xl font-semibold text-white">{progressStats.submitted}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Best day</p>
              <p className="mt-1 text-2xl font-semibold text-white">{progressStats.best}%</p>
            </div>
          </div>
        </div>
      )}

      <div className={cn(panelShellClassName, "space-y-4")}>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">Calendar</p>
          <h2 className="text-xl font-semibold text-white">
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
            <span>Submitted</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={goToHistory}
        className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/[0.06]"
      >
        Open 7-day history
      </button>
    </div>
  );

  const renderActivePanel = () => {
    if (!activePanel) return null;

    const panelTitle =
      activePanel === "notes"
        ? "Trainer Notes"
        : activePanel === "workout"
          ? "Today's Workout"
          : "Progress & History";

    return (
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-label="Close panel"
          onClick={() => setActivePanel(null)}
        />
        <div className="absolute inset-x-0 bottom-0 max-h-[88svh] rounded-t-[24px] border border-white/10 bg-[#070707]/95 p-4 shadow-[0_-20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-5 md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[min(720px,100vw)] md:max-h-none md:rounded-none md:border-l md:border-t-0 md:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/45">Dashboard View</p>
              <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{panelTitle}</h2>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 max-h-[calc(88svh-92px)] space-y-6 overflow-y-auto pr-1 md:max-h-[calc(100vh-120px)]">
            {activePanel === "notes" && renderNotesPanel()}
            {activePanel === "workout" && renderWorkoutPanel()}
            {activePanel === "progress" && renderProgressPanel()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">Client Dashboard</p>
            <h1 className="text-[clamp(2rem,8vw,2.8rem)] font-bold md:text-4xl">Welcome, {name}.</h1>
            <p className="text-sm text-white/55">{date}</p>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-white/68">
            Focus on this week&apos;s work. Everything else stays one tap away.
          </p>
        </div>

        <div className="relative self-start max-md:w-full" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition duration-150 hover:border-amber-300/60 hover:bg-white/[0.10] hover:shadow-[0_0_25px_rgba(255,200,120,0.2)] md:w-auto"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <Menu className="h-[18px] w-[18px]" />
            <span>Dashboard</span>
          </button>

          <div
            className={cn(
              "absolute right-0 z-40 mt-3 hidden w-[17rem] overflow-hidden rounded-[24px] border border-white/12 bg-[#090909]/96 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition duration-150 md:block",
              menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
            )}
            role="menu"
          >
            <button
              type="button"
              onClick={goToWeeklyCheckin}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>{normalizedWeeklyStatus.canSubmit ? "Weekly Check-In" : "Check-In History"}</span>
              <span className="text-xs text-white/45">{normalizedWeeklyStatus.canSubmit ? "Due" : "Open"}</span>
            </button>
            <button
              type="button"
              onClick={() => openPanel("notes")}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>Trainer Notes</span>
              <span className="text-xs text-white/45">View</span>
            </button>
            <button
              type="button"
              onClick={() => openPanel("workout")}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>Today&apos;s Workout</span>
              <span className="text-xs text-white/45">{summary.isSubmitted ? "Done" : `${progress}%`}</span>
            </button>
            <button
              type="button"
              onClick={() => openPanel("progress")}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>Progress & History</span>
              <span className="text-xs text-white/45">Review</span>
            </button>
            <button
              type="button"
              onClick={goToMessages}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>Messages</span>
              <span className="relative inline-flex items-center gap-2 text-xs text-white/45">
                <MessageCircle className="h-4 w-4" />
                {unreadMessages > 0 ? unreadMessages : "Open"}
              </span>
            </button>
            <div className="my-2 h-px bg-white/8" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
              role="menuitem"
            >
              <span>Logout</span>
              <span className="text-xs text-white/40">Exit</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/65 backdrop-blur-sm transition duration-150 md:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="absolute inset-0"
          aria-label="Close dashboard menu"
          onClick={() => setMenuOpen(false)}
        />
        <div className="absolute inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] rounded-[24px] border border-white/12 bg-[#090909]/96 p-3 shadow-[0_-20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:inset-x-4 sm:bottom-4 sm:rounded-[28px]">
          <div className="mb-2 flex items-center justify-between px-2 py-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/45">Dashboard</p>
              <p className="text-sm text-white/70">Choose where you want to go.</p>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={goToWeeklyCheckin}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>{normalizedWeeklyStatus.canSubmit ? "Weekly Check-In" : "Check-In History"}</span>
              <span className="text-xs text-white/45">{normalizedWeeklyStatus.canSubmit ? "Due" : "Open"}</span>
            </button>
            <button
              type="button"
              onClick={() => openPanel("notes")}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>Trainer Notes</span>
              <span className="text-xs text-white/45">View</span>
            </button>
            <button
              type="button"
              onClick={() => openPanel("workout")}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>Today&apos;s Workout</span>
              <span className="text-xs text-white/45">{summary.isSubmitted ? "Done" : `${progress}%`}</span>
            </button>
            <button
              type="button"
              onClick={() => openPanel("progress")}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>Progress &amp; History</span>
              <span className="text-xs text-white/45">Review</span>
            </button>
            <button
              type="button"
              onClick={goToMessages}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
              role="menuitem"
            >
              <span>Messages</span>
              <span className="relative inline-flex items-center gap-2 text-xs text-white/45">
                <MessageCircle className="h-4 w-4" />
                {unreadMessages > 0 ? unreadMessages : "Open"}
              </span>
            </button>
            <div className="my-2 h-px bg-white/8" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
              role="menuitem"
            >
              <span>Logout</span>
              <span className="text-xs text-white/40">Exit</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[22px] border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.025] to-transparent p-5 shadow-[0_0_30px_-18px_rgba(255,255,255,0.18)] backdrop-blur-xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">{card.label}</p>
            <p className="mt-3 text-[2rem] font-semibold text-white sm:text-3xl">{card.value}</p>
            <p className="mt-2 text-xs text-white/50">{card.helper}</p>
          </div>
        ))}
      </div>

      {normalizedWeeklyStatus.canSubmit ? <WeeklyCheckinCard status={normalizedWeeklyStatus} /> : null}

      {renderActivePanel()}

      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300",
          hoorahOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!hoorahOpen}
      >
        <div
          className={cn(
            "mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-black/80 p-5 text-center shadow-xl transition-transform duration-300 md:max-w-md md:p-8",
            hoorahOpen ? "scale-100" : "scale-95"
          )}
          role="dialog"
          aria-modal="true"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Hoorah</p>
          <h3 className="mt-2 text-xl font-semibold sm:text-2xl">Day submitted.</h3>
          <p className="mt-2 text-sm text-white/70">
            Completion {hoorahCompletion}% {hoorahWin ? "win day." : "keep going."}
          </p>

          <div className="mt-8 flex items-center justify-center gap-5 sm:gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-white sm:text-6xl">{streaks.current}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-white/50">Current</p>
            </div>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="text-center">
              <p className="text-5xl font-bold text-white sm:text-6xl">{streaks.best}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-white/50">Best</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

