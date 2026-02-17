import { marked } from "marked";

export function renderTrainerNote(note: string) {
  if (!note) return "";
  const rendered = marked.parse(note, { async: false });
  return typeof rendered === "string" ? rendered : "";
}
