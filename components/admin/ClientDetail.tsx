"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

type ExerciseItem = {
  id: string;
  label: string;
  sortOrder: number;
};

type ClientDetailProps = {
  client: {
    id: string;
    name: string;
    username: string;
    trainerDietNote: string | null;
    exerciseItems: ExerciseItem[];
  };
};

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter();
  const [note, setNote] = useState(client.trainerDietNote || "");
  const [items, setItems] = useState(client.exerciseItems.map((item) => item.label));
  const [newItem, setNewItem] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moveItem = (index: number, direction: number) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setItems(next);
  };

  const saveItems = async (nextItems: string[]) => {
    setSavingItems(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/exercises`, {
        method: "PUT",
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
    setItems((prev) => [...prev, trimmed]);
    setNewItem("");
  };

  const saveNote = async () => {
    setSavingNote(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
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

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Client</p>
          <h1 className="text-3xl md:text-4xl font-semibold">{client.name}</h1>
          <p className="text-sm text-white/50">@{client.username}</p>
        </div>
        <button
          onClick={() => router.push("/admin")}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Back
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-4">
        <h2 className="text-xl font-semibold">Trainer Note</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          placeholder="Add a concise nutrition note for the client."
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
              key={`${item}-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-6 text-center">{index + 1}</span>
                <span className="flex-1 text-sm text-white/90">{item}</span>
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
