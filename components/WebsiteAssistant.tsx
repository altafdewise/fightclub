"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  findWebsiteAssistantTopic,
  websiteAssistantFallback,
  websiteAssistantTopics,
  type WebsiteAssistantAction,
} from "@/lib/websiteAssistant";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
  actions?: WebsiteAssistantAction[];
};

const PUBLIC_PATH_BLOCKLIST = ["/admin", "/portal", "/trainer", "/hq"];

function isPublicWebsitePath(pathname: string) {
  return !PUBLIC_PATH_BLOCKLIST.some((segment) => pathname === segment || pathname.startsWith(`${segment}/`));
}

function createAssistantReply(input: string): Message {
  const topic = findWebsiteAssistantTopic(input);
  if (!topic) {
    return {
      id: `assistant-fallback-${Date.now()}`,
      role: "assistant",
      text: websiteAssistantFallback.answer,
      actions: websiteAssistantFallback.actions,
    };
  }

  return {
    id: `assistant-${topic.id}-${Date.now()}`,
    role: "assistant",
    text: topic.answer,
    actions: topic.actions,
  };
}

export function WebsiteAssistant() {
  const pathname = usePathname();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      text: "Hey — I can help with plans, pricing, payments, weekly check-ins, and getting started.",
    },
  ]);

  const isVisible = useMemo(() => isPublicWebsitePath(pathname || "/"), [pathname]);

  useEffect(() => {
    if (!open) return;
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!isVisible) return null;

  const askQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", text: trimmed },
      createAssistantReply(trimmed),
    ]);
    setInput("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    askQuestion(input);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-[rgba(201,168,106,0.22)] bg-[#0a0a0a]/92 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl transition duration-200 hover:border-[rgba(201,168,106,0.42)] hover:bg-[#101010]/95 hover:shadow-[0_0_28px_rgba(201,168,106,0.18)]",
            open && "border-[rgba(201,168,106,0.42)] bg-[#101010]/95"
          )}
          aria-expanded={open}
          aria-label="Open brutal.fit assistant"
        >
          {open ? <X className="h-4 w-4 text-[var(--gold)]" /> : <MessageCircle className="h-4 w-4 text-[var(--gold)]" />}
          <span className="hidden sm:inline">Ask brutal.fit</span>
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm transition duration-200 sm:pointer-events-none sm:bg-transparent sm:backdrop-blur-0",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed bottom-[4.8rem] right-4 z-[75] flex w-[calc(100vw-2rem)] max-w-[390px] origin-bottom-right flex-col overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(14,15,17,0.98),rgba(7,8,10,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition duration-200 sm:bottom-[5.5rem] sm:right-6",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-[0.98] opacity-0"
        )}
      >
        <div className="border-b border-white/8 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--gold)]" />
                <p className="text-sm font-semibold text-white">brutal.fit Assistant</p>
              </div>
              <p className="mt-1 text-xs text-white/55">
                Plans, pricing, coaching, and getting started
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={chatRef} className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[460px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                message.role === "assistant"
                  ? "border border-white/10 bg-white/[0.04] text-white/82"
                  : "ml-auto border border-[rgba(201,168,106,0.22)] bg-[rgba(201,168,106,0.08)] text-white"
              )}
            >
              <p>{message.text}</p>
              {message.actions?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <Link
                      key={`${message.id}-${action.label}`}
                      href={action.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition",
                        action.style === "primary"
                          ? "border border-[rgba(201,168,106,0.28)] bg-[rgba(201,168,106,0.12)] text-[var(--gold)] hover:bg-[rgba(201,168,106,0.18)]"
                          : "border border-white/12 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]"
                      )}
                    >
                      {action.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <div className="space-y-2">
            <p className="px-1 text-[11px] uppercase tracking-[0.14em] text-white/38">Quick Questions</p>
            <div className="flex flex-wrap gap-2">
              {websiteAssistantTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => askQuestion(topic.suggestion)}
                  className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 text-left text-xs text-white/75 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {topic.suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/8 px-4 py-4">
          <div className="flex items-center gap-2 rounded-[22px] border border-white/12 bg-white/[0.03] px-3.5 py-3 transition focus-within:border-[rgba(201,168,106,0.24)] focus-within:bg-white/[0.04]">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white outline-none ring-0 placeholder:text-white/32 placeholder:text-[13px] focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none"
              placeholder="Ask about plans or pricing"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,106,0.22)] bg-[rgba(201,168,106,0.12)] text-[var(--gold)] transition hover:bg-[rgba(201,168,106,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
