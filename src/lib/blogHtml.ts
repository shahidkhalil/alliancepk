/** Convert legacy section/content blogs into HTML for the rich editor. */
export function sectionsToHtml(
  sections?: { heading: string; paragraphs: string[] }[],
  content?: string[]
): string {
  if (sections?.length) {
    return sections
      .map((s) => {
        const paras = (s.paragraphs || [])
          .map((p) => `<p>${escapeHtml(p)}</p>`)
          .join("");
        return `<h2>${escapeHtml(s.heading)}</h2>${paras}`;
      })
      .join("");
  }
  if (content?.length) {
    return content.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  }
  return "<p></p>";
}

export function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Rough read-time from HTML. */
export function readTimeFromHtml(html: string): string {
  const text = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  const mins = Math.max(5, Math.min(14, Math.round(words / 180) || 5));
  return `${mins} min read`;
}

/** True when HTML has meaningful body text. */
export function htmlHasContent(html: string | undefined): boolean {
  if (!html) return false;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length >= 20;
}
