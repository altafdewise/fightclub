import { marked } from "marked";

const ALLOWED_TAGS = ["p", "br", "ul", "ol", "li", "strong", "em", "h3", "h4"];

export function sanitizeTrainerNoteHtml(input: string | null | undefined) {
  if (!input) return "";

  let sanitized = input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(div|section|article)>/gi, (match) => (match.startsWith("</") ? "</p>" : "<p>"))
    .replace(/&nbsp;/gi, " ");

  sanitized = sanitized.replace(
    /<(\/?)([a-z0-9]+)(?:\s[^>]*)?>/gi,
    (_, slash: string, tagName: string) => {
      const normalizedTag = tagName.toLowerCase();
      if (!ALLOWED_TAGS.includes(normalizedTag)) {
        return "";
      }
      return `<${slash}${normalizedTag}>`;
    }
  );

  sanitized = sanitized
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return sanitized;
}

export function stripTrainerNoteHtml(input: string | null | undefined) {
  if (!input) return "";

  return sanitizeTrainerNoteHtml(input)
    .replace(/<\/(p|h3|h4|li)>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function renderTrainerNote(note: string | null | undefined, noteHtml?: string | null) {
  const sanitizedHtml = sanitizeTrainerNoteHtml(noteHtml);
  if (sanitizedHtml) {
    return sanitizedHtml;
  }

  if (!note) return "";
  const rendered = marked.parse(note, { async: false });
  return typeof rendered === "string" ? rendered : "";
}
