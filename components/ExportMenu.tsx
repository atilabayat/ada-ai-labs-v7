"use client";

import { useState, useRef, useEffect } from "react";
import { downloadHtml, exportPdf, downloadDocx } from "@/lib/export";

export interface ExportContent {
  title:    string;
  html:     string;
  filename: string;
}

interface ExportMenuProps {
  /** Callback that returns the content to export at the moment the user picks a format */
  getContent: () => ExportContent;
  /** Label shown on the trigger button */
  triggerLabel?: string;
  /** Tailwind classes applied to the trigger button */
  triggerClassName?: string;
}

const ITEMS: { fmt: "html" | "pdf" | "docx"; icon: string; label: string; sub: string }[] = [
  { fmt: "html",  icon: "⬡", label: "HTML file",          sub: "self-contained · opens in browser" },
  { fmt: "pdf",   icon: "⬢", label: "PDF",                 sub: "browser print dialog"              },
  { fmt: "docx",  icon: "⬣", label: "Word / Google Docs",  sub: ".docx · imports natively"          },
];

export default function ExportMenu({ getContent, triggerLabel = "↗ Export", triggerClassName = "" }: ExportMenuProps) {
  const [open,        setOpen]        = useState(false);
  const [busy,        setBusy]        = useState<"docx" | null>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handle = async (fmt: "html" | "pdf" | "docx") => {
    setOpen(false);
    const { title, html, filename } = getContent();

    if (fmt === "html") {
      downloadHtml(filename, title, html);
    } else if (fmt === "pdf") {
      exportPdf(title, html);
    } else {
      setBusy("docx");
      try {
        await downloadDocx(filename, title, html);
      } finally {
        setBusy(null);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
        title="Export"
      >
        {busy === "docx" ? (
          <span className="inline-block animate-spin">⟳</span>
        ) : (
          triggerLabel
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[600] mt-[6px] w-[230px] overflow-hidden rounded-[10px] border border-line-strong bg-bg-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <div className="border-b border-line px-4 py-[8px]">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">Export as</span>
          </div>
          {ITEMS.map(({ fmt, icon, label, sub }) => (
            <button
              key={fmt}
              onClick={() => handle(fmt)}
              disabled={busy !== null}
              className="flex w-full items-start gap-3 px-4 py-[10px] text-left transition-colors hover:bg-[rgba(77,141,255,0.07)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mt-[1px] flex-shrink-0 font-mono text-[14px] text-accent">{icon}</span>
              <div>
                <div className="text-[12px] font-medium text-ink-0">{label}</div>
                <div className="mt-[1px] font-mono text-[9px] text-ink-3">{sub}</div>
              </div>
              {fmt === "docx" && busy === "docx" && (
                <span className="ml-auto mt-[2px] inline-block animate-spin font-mono text-[11px] text-accent">⟳</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
