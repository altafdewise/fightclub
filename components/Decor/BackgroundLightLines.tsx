export function BackgroundLightLines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute left-[-12%] top-[-8%] h-[220px] w-[80vw] rotate-[-6deg] opacity-30 blur-[40px] mix-blend-screen"
        viewBox="0 0 900 220"
        fill="none"
      >
        <path
          d="M0 130 C 160 40, 340 210, 520 120 C 680 50, 780 160, 900 90"
          stroke="rgba(255,245,220,0.25)"
          strokeWidth="26"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute right-[-10%] top-[48%] h-[240px] w-[70vw] rotate-[4deg] opacity-25 blur-[50px] mix-blend-screen"
        viewBox="0 0 900 240"
        fill="none"
      >
        <path
          d="M0 150 C 140 70, 360 230, 560 140 C 700 90, 820 170, 900 120"
          stroke="rgba(255,245,220,0.22)"
          strokeWidth="22"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute left-[-8%] bottom-[-6%] h-[220px] w-[75vw] rotate-[-3deg] opacity-30 blur-[45px] mix-blend-screen"
        viewBox="0 0 900 220"
        fill="none"
      >
        <path
          d="M0 120 C 180 40, 360 200, 520 120 C 680 60, 820 140, 900 90"
          stroke="rgba(255,245,220,0.24)"
          strokeWidth="24"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
