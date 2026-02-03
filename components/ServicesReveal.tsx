"use client";

import { useEffect, useRef, useState } from "react";

type ServicesRevealProps = {
  children: (state: { isVisible: boolean; prefersReducedMotion: boolean }) => React.ReactNode;
  className?: string;
};

export function ServicesReveal({ children, className }: ServicesRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const reduce = media.matches;
      setPrefersReducedMotion(reduce);
      if (reduce) setIsVisible(true);
    };

    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children({ isVisible, prefersReducedMotion })}
    </div>
  );
}
