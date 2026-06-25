/**
 * lib/markdown.ts
 * ───────────────
 * A small, dependency-free Markdown → HTML renderer shared across the app.
 *
 * Used to convert build/skill output (which is Markdown) into the HTML that the
 * Wiki reader renders via dangerouslySetInnerHTML. Without this, newly created
 * wikis stored raw Markdown and showed up as garbled text (`## heading`, `**b**`,
 * `| table |`) because the reader expects HTML like the seeded wikis.
 *
 * Supported: headings (with optional ids for TOC/scroll-spy), bold/italic/inline
 * code, links, unordered & ordered lists, fenced code, GFM tables, blockquotes,
 * and horizontal rules. Everything is HTML-escaped first, so embedded angle
 * brackets in the source can't inject markup.
 */

/** Escape a string for safe interpolation into HTML text/markup. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Stable slug for a heading — used for both TOC anchor ids and h2/h3 ids so
 *  in-page navigation and scroll-spy line up. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Create a deduplicating slugger. Call the returned function with headings in
 * document order; the first occurrence of a slug is returned as-is, repeats get
 * a `-2`, `-3`, … suffix. Used so that heading ids in the rendered HTML
 * (mdToHtml) and the TOC anchor ids (extractHeadings) advance in lockstep and
 * always line up for exact in-page navigation.
 */
export function makeSlugger(): (s: string) => string {
  const seen = new Map<string, number>();
  return (s: string): string => {
    const base = slugify(s) || "section";
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

/**
 * Extract headings from Markdown with the SAME deduped ids that
 * mdToHtml({ headingIds: true }) emits. Walk h2/h3 in document order (mdToHtml
 * only assigns ids to those levels), advancing the shared slugger for every one
 * so suffixes match, and return the subset at the requested `levels`.
 *
 * Fenced code blocks are skipped so `#` lines inside code don't count — mirrors
 * mdToHtml, keeping the two slug sequences identical.
 */
export function extractHeadings(
  md: string,
  levels: number[] = [2, 3]
): { level: number; text: string; id: string }[] {
  const slug = makeSlugger();
  const out: { level: number; text: string; id: string }[] = [];
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (!h) continue;
    const lvl = h[1].length;
    if (lvl !== 2 && lvl !== 3) continue; // only h2/h3 get ids in mdToHtml
    const text = h[2].trim();
    const id = slug(text);                // advance for every h2/h3
    if (levels.includes(lvl)) out.push({ level: lvl, text, id });
  }
  return out;
}

/**
 * Derive a clean, human wiki title from a build prompt.
 *
 * The WikiWizard emits prompts like:
 *   Create a comprehensive research wiki titled "AI Research of Agentic AI".
 *   ## Topic
 *   ...
 *
 * Naively slicing the first 50 chars produced broken titles like
 * 'Create a comprehensive research wiki titled "AI Re'. This resolves the
 * intended title in priority order:
 *   1. an explicit `titled "..."` clause (wizard + composer convention)
 *   2. the first line of the `## Topic` section
 *   3. the first non-empty line, with boilerplate lead-ins stripped
 * Always returns a non-empty string, clamped to `max` chars.
 */
export function extractWikiTitle(prompt: string, max = 80): string {
  const clamp = (s: string) => {
    const t = s.replace(/["""]/g, "").replace(/[.:;,\s]+$/, "").trim();
    return t.length > max ? t.slice(0, max).trim() + "…" : t;
  };

  // 1. titled "X" / titled 'X' / titled “X”
  const titled = prompt.match(/titled\s+["'""']([^"'""']+)["'""']/i);
  if (titled && titled[1].trim()) return clamp(titled[1]);

  // 2. first content line of a "## Topic" section
  const topic = prompt.match(/^##\s*Topic\s*\n+([^\n#]+)/im);
  if (topic && topic[1].trim()) return clamp(topic[1]);

  // 3. first meaningful line, stripping common builder lead-ins
  const firstLine = prompt
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0) ?? "";
  const stripped = firstLine.replace(
    /^(create|build|make|generate|write|design|compose)\s+(a|an|the)?\s*(comprehensive\s+)?(research\s+|knowledge\s+)?wiki(\s+page)?(\s+(titled|named|called|about|on|for))?\s*/i,
    ""
  );
  return clamp(stripped || firstLine || "Generated Wiki");
}

interface MdOptions {
  /** Add id="slug(heading)" to h2/h3 so the reader's TOC + scroll-spy resolve. */
  headingIds?: boolean;
}

/** Render a Markdown string to an HTML fragment. */
export function mdToHtml(md: string, opts: MdOptions = {}): string {
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  // Deduping slugger for heading ids — advanced for every h2/h3 (matching
  // extractHeadings) so repeated headings get abstract, abstract-2, … and the
  // emitted ids line up with the TOC anchor ids.
  const headingSlug = makeSlugger();

  const inline = (s: string): string =>
    escapeHtml(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/\b(_)([^_\n]+)\1\b/g, "<em>$2</em>")
      .replace(
        /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>'
      );

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      out.push(`<pre class="wiki-code"><code>${escapeHtml(buf.join("\n"))}</code></pre>`);
      continue;
    }

    // GFM table — header row, separator row, then body rows
    if (
      /^\s*\|.*\|\s*$/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])
    ) {
      const cells = (r: string) =>
        r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      const thead = `<tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr>`;
      const tbody = rows
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("");
      out.push(`<table class="wiki-table">${thead}${tbody}</table>`);
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      const text = h[2].trim();
      // Advance the slugger for every h2/h3 so suffixes stay in sync with
      // extractHeadings(); only emit the id when headingIds is requested.
      const hid = lvl === 2 || lvl === 3 ? headingSlug(text) : "";
      const idAttr = opts.headingIds && hid ? ` id="${hid}"` : "";
      out.push(`<h${lvl}${idAttr}>${inline(text)}</h${lvl}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line)) { out.push("<hr/>"); i++; continue; }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote class="wiki-quote">${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      out.push(`<ul>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*\d+\.\s+/, ""));
      out.push(`<ol class="wiki-ol">${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ol>`);
      continue;
    }

    // Blank line
    if (!line.trim()) { i++; continue; }

    // Paragraph (accumulate consecutive non-structural lines)
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|```|>\s?|\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(lines[i]) &&
      !/^\s*\|.*\|\s*$/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    if (buf.length) out.push(`<p>${inline(buf.join(" "))}</p>`);
  }

  return out.join("\n");
}

/**
 * Clean raw build output into publishable Markdown before rendering.
 *
 * Build output is a concatenation of skill sections joined by "\n\n---\n\n",
 * each prefixed by a "# /skill" header, and may contain:
 *   - structured JSON envelopes ({ type, html, markdown }) → keep `.markdown`
 *   - one-line "_Skill applied:_ `/x`" stubs from unimplemented skills → drop
 *   - "# /skill-id" section headers → drop (noise in a finished wiki)
 *
 * Returns clean Markdown suitable for mdToHtml().
 */
export function cleanBuildMarkdown(raw: string): string {
  const sections = raw.split("\n\n---\n\n");
  const cleaned: string[] = [];

  for (const section of sections) {
    let body = section.replace(/^#\s*\/[^\n]*\n+/, ""); // drop leading "# /skill" header

    // If the section is a structured envelope, keep only its markdown portion.
    const t = body.trim();
    if (t.startsWith("{")) {
      try {
        const d = JSON.parse(t);
        if (d && typeof d === "object" && typeof d.markdown === "string" && d.markdown.trim()) {
          cleaned.push(d.markdown.trim());
          continue;
        }
        // JSON but no usable markdown → skip entirely (don't dump raw JSON)
        continue;
      } catch {
        /* not JSON → fall through */
      }
    }

    // Drop "_Skill applied:_ ..." stub-only sections.
    if (/^_Skill applied:_/.test(t) && t.split("\n").filter((l) => l.trim()).length <= 1) {
      continue;
    }

    if (t) cleaned.push(body.trim());
  }

  return cleaned.join("\n\n").trim() || raw.trim();
}
