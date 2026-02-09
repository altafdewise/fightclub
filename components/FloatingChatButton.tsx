"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

type Role = "client" | "trainer" | "hq";

export function FloatingChatButton({ role }: { role: Role }) {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [idlePulse, setIdlePulse] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pulseRef = useRef<NodeJS.Timeout | null>(null);

  const targetPath = useMemo(() => {
    if (role === "trainer") return "/trainer/messages";
    if (role === "hq") return "/hq/messages";
    return "/portal/messages";
  }, [role]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data?.unread === "number") {
          setUnread(data.unread);
        }
      } catch (error) {
        console.error("unread-count", error);
      }
    };

    fetchUnread();
    pollingRef.current = setInterval(fetchUnread, 20000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    const startPulse = () => {
      setIdlePulse(true);
      if (pulseRef.current) clearTimeout(pulseRef.current);
      pulseRef.current = setTimeout(() => setIdlePulse(false), 320);
    };

    const interval = setInterval(startPulse, 6000);
    return () => {
      clearInterval(interval);
      if (pulseRef.current) clearTimeout(pulseRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => router.push(targetPath)}
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[52px] h-[52px] sm:w-[60px] sm:h-[60px]
        rounded-full backdrop-blur-md bg-white/5 border border-white/10 shadow-xl transition-all duration-200
        hover:scale-110 hover:border-amber-400/60 hover:shadow-[0_0_25px_rgba(255,200,120,0.35)]
        flex items-center justify-center relative overflow-hidden ${idlePulse ? "scale-105" : ""}`}
      aria-label="Open messages"
    >
      {unread > 0 && (
        <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
      <MessageCircle className="h-[26px] w-[26px] text-white transition-colors duration-200 hover:text-[#E6C278]" />
    </button>
  );
}
