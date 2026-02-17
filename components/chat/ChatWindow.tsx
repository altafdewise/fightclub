"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { cn } from "@/utils/cn";

type ChatRole = "client" | "trainer" | "hq";

type Message = {
  id: string;
  sender_id?: string;
  sender_role: ChatRole;
  sender_type?: "client" | "trainer";
  client_temp_id?: string | null;
  client_id?: string | null;
  trainer_id?: string | null;
  message_text: string | null;
  image_url: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  pending?: boolean;
};

type Me = {
  role: ChatRole;
  id: string;
};

type ChatWindowProps = {
  conversationId: string;
  viewerRole: ChatRole;
  clientId: string;
  trainerId: string;
  peerName: string;
  initialMessages: Message[];
  initialUnreadCount: number;
  initialHasMore?: boolean;
};

export function ChatWindow({
  conversationId,
  viewerRole,
  clientId,
  trainerId,
  peerName,
  initialMessages,
  initialUnreadCount,
  initialHasMore,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore ?? true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingImageIds, setLoadingImageIds] = useState<Record<string, boolean>>({});
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [userNearBottom, setUserNearBottom] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isHQ = viewerRole === "hq";
  const supabase = supabaseClient;

  useEffect(() => {
    const loadMe = async () => {
      try {
        const endpoint = viewerRole === "trainer" ? "/api/auth/me" : "/api/me";
        const res = await fetch(endpoint, { cache: "no-store", credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.role && data?.id) {
          setMe(data as Me);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadMe();
  }, [viewerRole]);

  const reconcileMessages = useCallback((prev: Message[], incoming: Message[]) => {
    if (!incoming.length) return prev;
    const next = [...prev];
    incoming.forEach((msg) => {
      const idx = next.findIndex(
        (m) => m.id === msg.id || (!!msg.client_temp_id && m.client_temp_id === msg.client_temp_id)
      );
      const normalized = { ...msg, pending: false };
      if (idx >= 0) {
        next[idx] = normalized;
      } else {
        next.push(normalized);
      }
    });
    return next;
  }, []);

  const normalizeMessage = useCallback((incoming: any): Message => {
    return {
      id: incoming.id,
      sender_id: incoming.sender_id,
      sender_role: incoming.sender_role ?? incoming.sender_type ?? "client",
      sender_type: incoming.sender_type ?? incoming.sender_role ?? "client",
      client_temp_id: incoming.client_temp_id ?? null,
      client_id: incoming.client_id ?? null,
      trainer_id: incoming.trainer_id ?? null,
      message_text: incoming.message_text ?? incoming.content ?? null,
      image_url: incoming.image_url ?? null,
      is_read: incoming.is_read ?? Boolean(incoming.read_at),
      read_at: incoming.read_at ?? null,
      created_at: incoming.created_at ?? new Date().toISOString(),
      pending: false,
    };
  }, []);

  const isMine = useCallback(
    (msg: Message) => {
      const effectiveRole = me?.role ?? viewerRole;
      const senderRole = (msg.sender_type ?? msg.sender_role) as "client" | "trainer";
      return (
        (effectiveRole === "trainer" && senderRole === "trainer") ||
        (effectiveRole === "client" && senderRole === "client")
      );
    },
    [me?.role, viewerRole]
  );

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages]);

  useEffect(() => {
    scrollToBottom(false);
    if (messages.length) {
      markAsRead();
    }
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload: { new: any }) => {
          const newMsg = normalizeMessage(payload.new);
          setMessages((prev) => reconcileMessages(prev, [newMsg]));
          scrollToBottom(true);
          if (!isMine(newMsg)) {
            markAsRead();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload: { new: any }) => {
          const updated = normalizeMessage(payload.new);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id
                ? { ...m, is_read: updated.is_read, read_at: updated.read_at, pending: false }
                : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, isMine, normalizeMessage, supabase]);

  useEffect(() => {
    if (!hasMounted) {
      scrollToBottom(false);
      setHasMounted(true);
      return;
    }

    if (sortedMessages.length > 0) {
      setShowScrollArrow(!userNearBottom);
    }
  }, [sortedMessages.length, userNearBottom, hasMounted]);

  const scrollToBottom = (smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
      bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    });
  };

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom < 120;
  }, []);

  const markAsRead = async () => {
    try {
      await fetch("/api/chat/read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      });
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/list?userId=${viewerRole === "trainer" ? clientId : trainerId}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages((prev) => reconcileMessages(prev, data));
        setShowScrollArrow(!isNearBottom());
      }
    } catch (error) {
      console.error(error);
    }
  }, [clientId, isNearBottom, reconcileMessages, trainerId, viewerRole]);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const loadOlder = async () => {
    if (!hasMore || loadingMore || sortedMessages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = sortedMessages[0];
      const res = await fetch(
        `/api/chat/messages?conversation_id=${conversationId}&cursor=${encodeURIComponent(oldest.created_at)}`,
        { cache: "no-store", credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.messages?.length) {
          setMessages((prev) => reconcileMessages(prev, data.messages));
          setHasMore(data.hasMore);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearTop = el.scrollTop < 32;
    if (nearTop) {
      loadOlder();
    }

    const nearBottom = isNearBottom();
    setUserNearBottom(nearBottom);
    setShowScrollArrow(!nearBottom);
  };

  const handleSend = async () => {
    if (isHQ) {
      setErrorMsg("HQ cannot send messages.");
      return;
    }
    if (sending) return;
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setSending(true);
    setErrorMsg(null);
    const tempId = crypto.randomUUID();
    const senderType = me?.role === "trainer" ? "trainer" : "client";
    const optimistic: Message = {
      id: tempId,
      sender_id: me?.id,
      sender_role: viewerRole,
      sender_type: senderType,
      client_temp_id: tempId,
      message_text: trimmed,
      image_url: null,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessageText("");
    scrollToBottom(true);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message_text: trimmed,
          client_temp_id: tempId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to send message");
      }
      const data = await res.json().catch(() => null);
      if (data?.message) {
        setMessages((prev) => reconcileMessages(prev, [data.message]));
      } else {
        await fetchLatest();
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to send message";
      setErrorMsg(message);
      setMessages((prev) => prev.filter((m) => m.client_temp_id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (isHQ) {
      setErrorMsg("HQ cannot send messages.");
      return;
    }
    if (uploading) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Upload failed");
      }
      const data = await res.json();
      const resSend = await fetch("/api/chat/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          image_url: data.url,
        }),
      });
      if (!resSend.ok) {
        const errData = await resSend.json().catch(() => null);
        throw new Error(errData?.message || "Unable to send image message");
      }
      await fetchLatest();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Upload failed";
      setErrorMsg(message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg("Image must be under 5MB.");
      event.target.value = "";
      return;
    }

    handleUpload(file);
    event.target.value = "";
  };

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 4 * 24; // approx 4 lines
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight).toString() + "px";
  }, [messageText]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.02] backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Conversation</p>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-white leading-tight">{peerName}</h2>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 text-black px-2.5 py-1 text-[11px] font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                    <span className="h-2 w-2 rounded-full bg-black" />
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-[520px] overflow-y-auto px-4 py-5 sm:px-8 scroll-smooth chat-scroll"
            >
              <div className="flex w-full flex-col gap-3">
                {loadingMore && (
                  <div className="text-center text-[11px] text-white/60">Loading earlier messages...</div>
                )}
                {sortedMessages.map((msg) => {
                  const meRole = me?.role ?? viewerRole;
                  const senderRole: "client" | "trainer" = (() => {
                    if (msg.sender_id && msg.sender_id === clientId) return "client";
                    if (msg.sender_id && msg.sender_id === trainerId) return "trainer";
                    if (msg.client_id && msg.client_id === clientId) return "client";
                    if (msg.trainer_id && msg.trainer_id === trainerId) return "trainer";
                    return (msg.sender_type ?? msg.sender_role) as "client" | "trainer";
                  })();
                  const mine =
                    (meRole === "trainer" && senderRole === "trainer") ||
                    (meRole === "client" && senderRole === "client");
                  const bubbleBase =
                    "relative px-[22px] py-3.5 md:px-6 md:py-4 transition-transform duration-150 leading-[1.58]";
                  const receiverSurface =
                    "bg-[#0b0d11] text-white/90 rounded-[18px] border border-white/7 shadow-[0_6px_16px_-12px_rgba(0,0,0,0.55)]";
                  const senderSurface =
                    "bg-white text-[#0e1116] rounded-[22px] shadow-[0_14px_32px_-20px_rgba(0,0,0,0.45)]";

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-full",
                        mine ? "justify-end" : "justify-start",
                        "animate-[fadeUp_0.2s_ease]"
                      )}
                    >
                      <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "group block shrink-0 max-w-[85%] md:max-w-[65%] min-w-[110px] md:min-w-[140px]",
                            bubbleBase,
                            mine ? senderSurface : receiverSurface,
                            mine
                              ? "hover:translate-y-[-1.5px] hover:shadow-[0_18px_38px_-16px_rgba(0,0,0,0.55)]"
                              : "",
                            mine
                              ? "before:absolute before:-right-[6px] before:bottom-3 before:h-3 before:w-3 before:rotate-45 before:rounded-[6px] before:bg-white before:shadow-[12px_12px_24px_-18px_rgba(0,0,0,0.45)]"
                              : "before:absolute before:-left-[6px] before:bottom-3 before:h-3 before:w-3 before:rotate-45 before:rounded-[6px] before:bg-[#0b0d11] before:border-l before:border-b before:border-white/7"
                          )}
                        >
                          {msg.message_text && (
                            <p
                              className={cn(
                                "w-full text-[15px] leading-[1.58] whitespace-pre-wrap break-words break-normal",
                                mine ? "text-[#0e1116]" : "text-white/90"
                              )}
                            >
                              {msg.message_text}
                            </p>
                          )}
                          {msg.image_url && (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                              <div className="relative">
                                {loadingImageIds[msg.id] && (
                                  <div className="absolute inset-0 bg-white/5 animate-pulse" />
                                )}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={msg.image_url}
                                  alt="Uploaded"
                                  className="max-h-72 w-full object-cover cursor-zoom-in transition duration-150 hover:opacity-95"
                                  onLoad={() => setLoadingImageIds((prev) => ({ ...prev, [msg.id]: false }))}
                                  onClick={() => setSelectedImage(msg.image_url!)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          className={cn(
                            "text-[10px]",
                            mine ? "text-neutral-500 text-right pr-1" : "text-white/38 text-left pl-1"
                          )}
                        >
                          <span>
                            {new Intl.DateTimeFormat("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              month: "short",
                              day: "2-digit",
                            }).format(new Date(msg.created_at))}
                          </span>
                          {mine && <span className="ml-1.5 text-neutral-500/80">{msg.is_read ? "Read" : "Sent"}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} className="h-1" />
              </div>
            </div>

            {!userNearBottom && showScrollArrow && (
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                aria-label="Scroll to bottom"
                className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-[0_14px_32px_-18px_rgba(0,0,0,0.4)] hover:bg-white"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 4v16" />
                  <path d="M6 14l6 6 6-6" />
                </svg>
              </button>
            )}
          </div>

          <div className="border-t border-white/5 bg-black/30 backdrop-blur-xl">
            {errorMsg && (
              <div className="px-5 py-2 text-xs text-red-200 bg-red-900/30 border-b border-red-500/30">
                {errorMsg}
              </div>
            )}
            <div className="sticky bottom-0 w-full px-4 pb-4 pt-3 sm:px-6">
              <div
                className="flex items-end gap-3 rounded-[24px] border border-white/10 bg-[#0d0f12]/70 backdrop-blur-xl px-3.5 py-3 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 focus-within:shadow-[0_32px_90px_-40px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <label className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-white/80 hover:bg-white/[0.08] transition cursor-pointer active:scale-[0.98]">
                  <span className="sr-only">Upload image</span>
                  {uploading ? (
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4 17V7a2 2 0 012-2h5m9 5v7a2 2 0 01-2 2H7" />
                      <path d="M14 5h6v6" />
                      <path d="M14 11l6-6" />
                    </svg>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileInput}
                    disabled={isHQ}
                  />
                </label>

                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Write a message…"
                    readOnly={isHQ}
                    className="w-full bg-transparent text-[15px] leading-relaxed text-white placeholder:text-white/30 caret-slate-200 focus:outline-none focus:ring-0 focus:border-none appearance-none border-none shadow-none resize-none px-1"
                    rows={1}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={sending || isHQ}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.08] text-white shadow-[0_14px_36px_-24px_rgba(0,0,0,0.65)] transition duration-150 hover:bg-white/[0.12] active:scale-[0.96] disabled:opacity-40 disabled:hover:bg-white/[0.08]"
                >
                  {sending ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4l16 8-16 8 5-8-5-8z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-h-[90vh] max-w-5xl p-4" role="dialog" aria-modal="true">
            <button
              className="absolute right-6 top-6 rounded-full bg-white/90 text-black px-3 py-1 text-xs font-semibold shadow"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Enlarged"
              className="max-h-[80vh] w-full object-contain rounded-3xl shadow-[0_30px_120px_-60px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
