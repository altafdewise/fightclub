"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { ClientAnalytics } from "@/components/admin/ClientAnalytics";
import { ClientCheckinHistory } from "@/components/admin/ClientCheckinHistory";

type ExerciseItem = {
  id: string;
  label: string;
  sortOrder: number;
  videoUrl?: string | null;
};

type ClientDetailProps = {
  client: {
    id: string;
    name: string;
    username: string;
    trainerDietNote: string | null;
    exerciseItems: ExerciseItem[];
  };
  isHQ?: boolean;
};

export function ClientDetail({ client, isHQ = false }: ClientDetailProps) {
  const router = useRouter();
  const [note, setNote] = useState(client.trainerDietNote || "");
  const [items, setItems] = useState(
    client.exerciseItems.map((item) => ({
      label: item.label,
      videoUrl: item.videoUrl || "",
    }))
  );
  const [newItem, setNewItem] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [downloadingUndertaking, setDownloadingUndertaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moveItem = (index: number, direction: number) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setItems(next);
  };

  const saveItems = async (nextItems: { label: string; videoUrl?: string }[]) => {
    setSavingItems(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/exercises`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: nextItems }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to save exercises.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSavingItems(false);
    }
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, idx) => idx !== index);
    setItems(next);
    void saveItems(next);
  };

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, { label: trimmed, videoUrl: "" }]);
    setNewItem("");
  };

  const saveNote = async () => {
    setSavingNote(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerDietNote: note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to save note.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSavingNote(false);
    }
  };

  const saveExercises = async () => {
    await saveItems(items);
  };

  const downloadUndertaking = async () => {
    setDownloadingUndertaking(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/undertaking/download", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to download undertaking.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BRUTAL-Undertaking-${client.name.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Unable to download undertaking.");
    } finally {
      setDownloadingUndertaking(false);
    }
  };

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Client</p>
          <h1 className="text-3xl md:text-4xl font-semibold">{client.name}</h1>
          <p className="text-sm text-white/50">@{client.username}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isHQ && (
            <button
              onClick={downloadUndertaking}
              disabled={downloadingUndertaking}
              className={cn(
                "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
                downloadingUndertaking && "hover:bg-white"
              )}
            >
              {downloadingUndertaking ? "Downloading..." : "Download Undertaking"}
            </button>
          )}
          <button
            onClick={() => router.push(isHQ ? "/hq" : "/admin")}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Back
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-4">
        <h2 className="text-xl font-semibold">Trainer Note</h2>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/70 space-y-1">
          <p className="font-semibold text-white/80">Formatting tips:</p>
          <p>• ## Section Title</p>
          <p>• - bullet point</p>
          <p>• **bold text**</p>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          placeholder="Write instructions using:\n\nUse '-' for bullet points\nUse '##' for section titles\nExample:\n\nDiet\n\n3L water\n\n150g protein"
        />
        <button
          onClick={saveNote}
          disabled={savingNote}
          className={cn(
            "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
            savingNote && "hover:bg-white"
          )}
        >
          {savingNote ? "Saving..." : "Save note"}
        </button>
      </div>

      <ClientCheckinHistory clientId={client.id} isHQ={isHQ} />

      <ClientAnalytics clientId={client.id} />

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Daily Exercise Checklist</p>
          <h2 className="text-xl font-semibold">Checklist items</h2>
        </div>

        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-white/50">No exercises yet. Add your first item below.</p>
          )}
          {items.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-6 text-center">{index + 1}</span>
                <span className="flex-1 text-sm text-white/90">{item.label}</span>
              </div>
              <div className="flex-1">
                <input
                  value={item.videoUrl || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((entry, idx) =>
                        idx === index ? { ...entry, videoUrl: e.target.value } : entry
                      )
                    )
                  }
                  aria-label="Video link (optional)"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
                  placeholder="Video link (optional)"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.02] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.02] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.02] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
            placeholder="Add new exercise item"
          />
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Add item
          </button>
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          onClick={saveExercises}
          disabled={savingItems}
          className={cn(
            "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
            savingItems && "hover:bg-white"
          )}
        >
          {savingItems ? "Saving..." : "Save checklist"}
        </button>
      </div>
    </div>
  );
}
