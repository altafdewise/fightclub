import { marked } from "marked";

export function renderTrainerNote(note: string) {
  if (!note) return "";
  return marked.parse(note);
}
