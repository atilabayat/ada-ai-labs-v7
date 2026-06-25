/**
 * Shared export utilities — HTML download, PDF (browser print), DOCX (Word / Google Docs).
 * Each function accepts an HTML fragment or complete document; wrapHtml normalises fragments
 * into a clean, print-ready standalone page before exporting.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function isFullDocument(html: string): boolean {
  const t = html.trimStart().toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html");
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80) || "export";
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function wrapHtml(title: string, html: string, forPrint = false): string {
  if (isFullDocument(html)) return html;

  const printExtra = forPrint
    ? `@page { margin: 20mm 18mm; }
       @media print { body { margin: 0; } nav, aside, .sidebar, [data-noprint] { display: none !important; } }`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/</g, "&lt;")}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      max-width: 820px;
      margin: 40px auto;
      padding: 0 28px 60px;
      line-height: 1.8;
      color: #111;
      background: #fff;
    }
    h1 { font-size: 30px; font-weight: 700; margin: 0 0 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
    h2 { font-size: 22px; font-weight: 700; margin: 40px 0 12px; }
    h3 { font-size: 18px; font-weight: 600; margin: 28px 0 10px; }
    h4, h5, h6 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; }
    p  { margin: 0 0 1em; }
    ul, ol { padding-left: 24px; margin: 0 0 1em; }
    li { margin-bottom: 4px; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: "Courier New", monospace; font-size: 0.88em; }
    pre  { background: #f3f4f6; padding: 16px 20px; border-radius: 6px; overflow-x: auto; font-size: 0.88em; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #d1d5db; margin-left: 0; padding-left: 18px; color: #555; font-style: italic; }
    a  { color: #1d4ed8; text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.92em; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 14px; text-align: left; }
    th { background: #f9fafb; font-weight: 700; }
    img { max-width: 100%; height: auto; }
    hr { border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0; }
    .meta { font-family: monospace; font-size: 11px; color: #6b7280; margin-bottom: 28px; }
    ${printExtra}
  </style>
</head>
<body>
  <h1>${title.replace(/</g, "&lt;")}</h1>
  <div class="meta">Alpha Data Architects · ADA AI Labs · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  ${html}
</body>
</html>`;
}

// ── HTML Download ─────────────────────────────────────────────────────────────

export function downloadHtml(filename: string, title: string, html: string): void {
  const content = wrapHtml(title, html);
  const blob    = new Blob([content], { type: "text/html;charset=utf-8" });
  triggerDownload(blob, sanitizeFilename(filename) + ".html");
}

// ── PDF (browser print dialog) ────────────────────────────────────────────────

export function exportPdf(title: string, html: string): void {
  const content = wrapHtml(title, html, true);

  // Use a hidden iframe so the popup-blocker doesn't interfere
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(content);
  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow!.focus();
        iframe.contentWindow!.print();
      } finally {
        // Remove after a delay so the print dialog has time to open
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }
    }, 250);
  };
}

// ── DOCX (Word / Google Docs) ─────────────────────────────────────────────────

export async function downloadDocx(filename: string, title: string, html: string): Promise<void> {
  // Dynamic import keeps the ~600 KB docx bundle out of the initial page load
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import("docx");

  // Parse the HTML fragment into a DOM tree
  const parser = new DOMParser();
  const source = isFullDocument(html) ? html : `<body>${html}</body>`;
  const dom    = parser.parseFromString(source, "text/html");

  type DocParagraph = InstanceType<typeof Paragraph>;
  const children: DocParagraph[] = [];

  // Title paragraph
  children.push(
    new Paragraph({ text: title, heading: HeadingLevel.TITLE })
  );

  // Date / meta
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Alpha Data Architects · ADA AI Labs · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
          color: "888888",
          size: 18,
        }),
      ],
    })
  );

  // Spacer
  children.push(new Paragraph({ text: "" }));

  // Walk DOM and convert to docx elements
  function inlineRuns(node: Element): InstanceType<typeof TextRun>[] {
    const runs: InstanceType<typeof TextRun>[] = [];
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";
        if (text) runs.push(new TextRun(text));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el  = child as Element;
        const tag = el.tagName.toLowerCase();
        const txt = el.textContent ?? "";
        if (!txt) return;
        if (tag === "strong" || tag === "b")      runs.push(new TextRun({ text: txt, bold: true }));
        else if (tag === "em" || tag === "i")     runs.push(new TextRun({ text: txt, italics: true }));
        else if (tag === "code")                  runs.push(new TextRun({ text: txt, font: { name: "Courier New" }, size: 18 }));
        else if (tag === "u")                     runs.push(new TextRun({ text: txt, underline: {} }));
        else                                      runs.push(new TextRun(txt));
      }
    });
    return runs;
  }

  function walk(node: Element): void {
    const tag  = (node.tagName ?? "").toLowerCase();
    const text = node.textContent?.trim() ?? "";

    switch (tag) {
      case "h1": children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_1 })); break;
      case "h2": children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_2 })); break;
      case "h3": children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_3 })); break;
      case "h4":
      case "h5":
      case "h6": children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_4 })); break;

      case "p": {
        const runs = inlineRuns(node);
        if (runs.length) children.push(new Paragraph({ children: runs }));
        else if (text)   children.push(new Paragraph({ text }));
        break;
      }

      case "ul":
      case "ol":
        Array.from(node.children).forEach((li) => {
          if (li.tagName.toLowerCase() === "li") {
            const t = li.textContent?.trim() ?? "";
            if (t) children.push(new Paragraph({ text: t, bullet: { level: 0 } }));
          }
        });
        break;

      case "li":
        if (text) children.push(new Paragraph({ text, bullet: { level: 0 } }));
        break;

      case "blockquote":
        if (text)
          children.push(new Paragraph({
            children: [new TextRun({ text, italics: true, color: "555555" })],
            indent: { left: 720 },
          }));
        break;

      case "pre":
        if (text)
          children.push(new Paragraph({
            children: [new TextRun({ text: node.textContent ?? "", font: { name: "Courier New" }, size: 18 })],
            indent: { left: 360 },
          }));
        break;

      case "hr":
        children.push(new Paragraph({ text: "────────────────────────────────────────────" }));
        break;

      case "table": {
        // Flatten table rows into labelled paragraphs
        Array.from(node.querySelectorAll("tr")).forEach((row) => {
          const cells = Array.from(row.querySelectorAll("th, td")).map((c) => c.textContent?.trim() ?? "");
          if (cells.length) children.push(new Paragraph({ text: cells.join("  |  ") }));
        });
        break;
      }

      default:
        // Container elements — recurse into children
        if (["div","section","article","main","aside","header","footer","nav","body"].includes(tag)) {
          Array.from(node.children).forEach((c) => walk(c as Element));
        } else if (text && !["script","style","noscript","head"].includes(tag)) {
          children.push(new Paragraph({ text }));
        }
    }
  }

  Array.from(dom.body.children).forEach((c) => walk(c as Element));

  const doc = new Document({
    creator: "Alpha Data Architects · ADA AI Labs",
    title,
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, sanitizeFilename(filename) + ".docx");
}
