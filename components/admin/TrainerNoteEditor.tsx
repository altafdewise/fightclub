"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { sanitizeTrainerNoteHtml, stripTrainerNoteHtml } from "@/lib/trainerNotes";

type TrainerNoteEditorProps = {
  clientId: string;
  initialNote: string | null;
  initialNoteHtml?: string | null;
};

type ToolbarAction = {
  label: string;
  onClick: () => void;
};

export function TrainerNoteEditor({
  clientId,
  initialNote,
  initialNoteHtml,
}: TrainerNoteEditorProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState(() => sanitizeTrainerNoteHtml(initialNoteHtml) || "");
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallbackHtml = useMemo(() => {
    if (html) return html;
    if (!initialNote) return "";
    return initialNote
      .split(/\n{2,}/)
      .map((chunk) => `<p>${chunk.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }, [html, initialNote]);

  useEffect(() => {
    const nextHtml = sanitizeTrainerNoteHtml(initialNoteHtml) || fallbackHtml;
    setHtml(nextHtml);
  }, [initialNoteHtml, fallbackHtml]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === html) return;
    editorRef.current.innerHTML = html;
  }, [html]);

  const syncHtml = () => {
    const nextHtml = sanitizeTrainerNoteHtml(editorRef.current?.innerHTML || "");
    setHtml(nextHtml);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const runCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    syncHtml();
  };

  const toolbarActions: ToolbarAction[] = [
    { label: "Section", onClick: () => runCommand("formatBlock", "h3") },
    { label: "Body", onClick: () => runCommand("formatBlock", "p") },
    { label: "Bullet List", onClick: () => runCommand("insertUnorderedList") },
    { label: "Bold", onClick: () => runCommand("bold") },
    { label: "Italic", onClick: () => runCommand("italic") },
  ];

  const saveNote = async () => {
    setSaving(true);
    setError(null);

    try {
      const noteHtml = sanitizeTrainerNoteHtml(editorRef.current?.innerHTML || html);
      const trainerDietNote = stripTrainerNoteHtml(noteHtml);

      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerDietNote,
          trainerDietNoteHtml: noteHtml,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to save note.");
      }

      setHtml(noteHtml);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Unable to save note.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">Trainer Notes</p>
          <h2 className="text-xl font-semibold text-white">Coach guidance</h2>
          <p className="mt-2 text-sm text-white/60">
            Write a clean note with sections, bullets, emphasis, and simple line breaks.
          </p>
        </div>
        <button
          type="button"
          onClick={saveNote}
          disabled={saving}
          className={cn(
            "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
            saving && "hover:bg-white"
          )}
        >
          {saving ? "Saving..." : "Save note"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "relative min-h-[280px] rounded-[22px] border border-white/10 bg-white/[0.02] px-4 py-4 transition",
          focused && "border-white/20 ring-2 ring-white/10"
        )}
      >
        {!html && !focused ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 text-sm leading-relaxed text-white/35">
            <p className="font-medium text-white/40">Week Focus</p>
            <p className="mt-2">Improve squat depth and core stability.</p>
            <p className="mt-5 font-medium text-white/40">Warm Up Reminder</p>
            <p className="mt-2">• Focus on breathing</p>
            <p>• Move slowly through hip openers</p>
          </div>
        ) : null}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncHtml}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            syncHtml();
          }}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            syncHtml();
          }}
          className="trainer-note prose prose-invert min-h-[248px] max-w-none text-sm text-white/90 outline-none"
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
