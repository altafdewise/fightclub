"use client";

import { useEffect, useRef } from "react";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
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
      if (node) observer.unobserve(node);
    };
  }, [delay]);

  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: delay ? `${delay}ms` : undefined }}>
      {children}
    </div>
  );
}

