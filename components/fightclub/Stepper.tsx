import { cn } from "@/utils/cn";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                  active && "bg-[var(--fc-blood-bright)] text-white shadow-[0_0_18px_rgba(139,0,0,0.6)]",
                  done && "bg-[var(--fc-blood)] text-white",
                  !active && !done && "border border-[var(--fc-line)] text-[var(--fc-muted)]"
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-[10px] font-semibold uppercase tracking-[0.12em] sm:block",
                  active ? "text-[var(--fc-ember)]" : "text-[var(--fc-muted)]"
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={cn("h-px w-6 sm:w-10", done ? "bg-[var(--fc-blood)]" : "bg-[var(--fc-line)]")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
