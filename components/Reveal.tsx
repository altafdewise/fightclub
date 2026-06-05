"use client";

import { useEffect, useRef } from "react";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add("visible");
    const fallback = window.setTimeout(reveal, delay + 160);

    if (!("IntersectionObserver" in window)) {
      reveal();
      return () => window.clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    const node = ref.current;
    if (node) {
      if (delay) node.style.transitionDelay = `${delay}ms`;
      observer.observe(node);
    }

    return () => {
      window.clearTimeout(fallback);
      if (node) observer.unobserve(node);
    };
  }, [delay]);

  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: delay ? `${delay}ms` : undefined }}>
      {children}
    </div>
  );
}
