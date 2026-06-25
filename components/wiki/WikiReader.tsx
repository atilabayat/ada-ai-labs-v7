"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WikiDef } from "@/lib/types";
import type { Env } from "@/lib/types";
import { useWorkspace } from "@/lib/store";
import { deleteWiki, promoteWiki } from "@/lib/actions";
import ExportMenu from "@/components/ExportMenu";

interface PopoverState {
  visible: boolean;
  top: number;
  left: number;
  venue: string;
  title: string;
  idx: number;
  total: number;
}

export default function WikiReader({
  wiki,
  slug,
  slugMap,
}: {
  wiki: WikiDef;
  slug: string;
  /** "Display Title" → slug, for resolving inline cross-wiki [Name] refs. */
  slugMap: Record<string, string>;
}) {
  const router    = useRouter();
  const showToast = useWorkspace((s) => s.showToast);

  const [actionPending, startAction] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const wikiEnv: Env = (wiki.env ?? "dev") as Env;
  const nextEnv: Env | null = wikiEnv === "dev" ? "staging" : wikiEnv === "staging" ? "live" : null;
  const prevEnv: Env | null = wikiEnv === "live" ? "staging" : wikiEnv === "staging" ? "dev" : null;

  const ENV_LABEL: Record<Env, string> = { dev: "DEV", staging: "STAGING", live: "LIVE" };
  const ENV_CLS:   Record<Env, string> = {
    dev:     "text-accent border-[rgba(77,141,255,0.3)] bg-[rgba(77,141,255,0.08)]",
    staging: "text-accent-amber border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)]",
    live:    "text-accent-teal border-[rgba(20,184,166,0.3)] bg-[rgba(20,184,166,0.08)]",
  };

  const handleDelete = () => {
    startAction(async () => {
      const res = await deleteWiki(slug);
      if (res.ok) {
        showToast("Wiki deleted");
        router.push("/wikis");
      } else {
        showToast(`Delete failed: ${res.error}`);
      }
    });
  };

  const handlePromote = (target: Env) => {
    startAction(async () => {
      const res = await promoteWiki(slug, target);
      if (res.ok) showToast(`Wiki moved to ${ENV_LABEL[target]}`);
      else        showToast(`Failed: ${res.error}`);
    });
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [activeToc, setActiveToc] = useState(wiki.toc[0]?.id ?? "");
  const [editMode, setEditMode] = useState(false);
  const [pageIdx, setPageIdx] = useState(() => {
    const i = wiki.pageList.findIndex((p) => p.current);
    return i < 0 ? 0 : i;
  });
  const [pop, setPop] = useState<PopoverState | null>(null);
  const popHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Jump helper
  const scrollToAnchor = useCallback((id: string) => {
    const el = contentRef.current?.querySelector(`#${CSS.escape(id)}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Process inline refs: numeric → citation popovers, named → cross-wiki xrefs
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const refs = Array.from(root.querySelectorAll<HTMLAnchorElement>("a.ref"));
    const cleanups: (() => void)[] = [];

    refs.forEach((ref) => {
      const txt = ref.textContent?.trim() ?? "";
      const match = txt.match(/^\[(.+)\]$/);
      if (!match) return;
      const inner = match[1];

      if (/^\d+$/.test(inner)) {
        // Numeric citation
        const idx = parseInt(inner, 10) - 1;
        const source = wiki.sources[idx];
        if (!source) return;

        const onEnter = () => {
          if (popHideTimer.current) clearTimeout(popHideTimer.current);
          const rect = ref.getBoundingClientRect();
          const popHeight = 150;
          let top = rect.bottom + 8;
          if (top + popHeight > window.innerHeight) top = rect.top - popHeight - 8;
          setPop({
            visible: true,
            top,
            left: Math.min(rect.left, window.innerWidth - 380),
            venue: source.meta,
            title: source.title,
            idx,
            total: wiki.sources.length,
          });
        };
        const onLeave = () => {
          popHideTimer.current = setTimeout(() => setPop((p) => (p ? { ...p, visible: false } : null)), 220);
        };
        ref.addEventListener("mouseenter", onEnter);
        ref.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          ref.removeEventListener("mouseenter", onEnter);
          ref.removeEventListener("mouseleave", onLeave);
        });
      } else {
        // Cross-wiki reference
        ref.classList.remove("ref");
        ref.classList.add("xref");
        ref.textContent = inner;
        ref.style.cursor = "pointer";
        const targetSlug = slugMap[inner];
        const onClick = (e: MouseEvent) => {
          e.preventDefault();
          if (targetSlug) router.push(`/wikis/${targetSlug}`);
          else showToast(`${inner} — linked artifact`);
        };
        ref.addEventListener("click", onClick);
        cleanups.push(() => ref.removeEventListener("click", onClick));
      }
    });

    return () => cleanups.forEach((c) => c());
  }, [wiki, router, showToast, slug]);

  // Scroll-spy on h2[id]
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const headings = Array.from(root.querySelectorAll<HTMLElement>("h2[id]"));
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveToc(visible[0].target.id);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [wiki]);

  // Edit mode → toggle contenteditable on prose
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    root.querySelectorAll("h1, h2, h3, p").forEach((el) => {
      if (editMode) el.setAttribute("contenteditable", "true");
      else el.removeAttribute("contenteditable");
    });
  }, [editMode, wiki]);

  const jumpToSource = (idx: number) => {
    const sources = contentRef.current?.ownerDocument.querySelectorAll(".source-item");
    // Sources live in the right metadata panel (outside contentRef); query document
    const items = document.querySelectorAll<HTMLElement>(".meta-sources-panel .source-item");
    const el = items[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("cite-highlight");
      setTimeout(() => el.classList.remove("cite-highlight"), 2000);
    }
    void sources;
    setPop((p) => (p ? { ...p, visible: false } : null));
  };

  const sourceClick = (idx1: number) => {
    const refs = contentRef.current?.querySelectorAll<HTMLElement>("a.ref");
    if (!refs) return;
    for (const r of Array.from(refs)) {
      if (r.textContent?.includes(`[${idx1}]`)) {
        r.scrollIntoView({ behavior: "smooth", block: "center" });
        r.classList.add("cite-highlight");
        setTimeout(() => r.classList.remove("cite-highlight"), 2000);
        break;
      }
    }
  };

  const navPage = (dir: "prev" | "next") => {
    setPageIdx((cur) => {
      const next = dir === "next" ? Math.min(cur + 1, wiki.pageList.length - 1) : Math.max(cur - 1, 0);
      if (next !== cur) {
        showToast(`Loaded page: ${wiki.pageList[next].name}`);
        if (contentRef.current) contentRef.current.scrollTop = 0;
      }
      return next;
    });
  };

  return (
    <div className="wiki-reader">
      {/* LEFT: TOC */}
      <aside className="wiki-toc">
        <Link href="/wikis" className="toc-back">← All Wikis</Link>
        <div className="toc-wiki-title">{wiki.title}</div>
        <div className="toc-wiki-meta">
          {wiki.pages} pages · {wiki.sources.length} sources · {wiki.updated}
        </div>

        <div className="toc-section-label">On This Page</div>
        <div id="toc-links">
          {wiki.toc.map((t, i) => (
            <a
              key={`${t.id}-${i}`}
              className={`toc-link ${t.sub ? "sub" : ""} ${activeToc === t.id ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveToc(t.id);
                scrollToAnchor(t.id);
              }}
            >
              {t.name}
            </a>
          ))}
        </div>

        <div className="toc-section-label">Pages</div>
        <div className="toc-pages">
          {wiki.pageList.map((p, i) => (
            <div
              key={p.id}
              className={`toc-page ${i === pageIdx ? "current" : ""}`}
              onClick={() => {
                setPageIdx(i);
                showToast(`Loaded page: ${p.name}`);
                if (contentRef.current) contentRef.current.scrollTop = 0;
              }}
            >
              <span className="pg-ic">{i === pageIdx ? "●" : "○"}</span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER: content */}
      <div className={`wiki-content ${editMode ? "edit-mode" : ""}`} ref={contentRef}>
        <div className="wiki-toolbar">
          <div className="wiki-mode-switch">
            <div className={`wiki-mode-opt ${!editMode ? "active" : ""}`} onClick={() => setEditMode(false)}>Read</div>
            <div className={`wiki-mode-opt edit ${editMode ? "active" : ""}`} onClick={() => setEditMode(true)}>Edit</div>
          </div>

          {/* Env badge + pipeline controls */}
          <span className={`rounded-full border px-[8px] py-[3px] font-mono text-[9px] uppercase tracking-[0.12em] ${ENV_CLS[wikiEnv]}`}>
            {ENV_LABEL[wikiEnv]}
          </span>
          {prevEnv && (
            <button
              disabled={actionPending}
              onClick={() => handlePromote(prevEnv)}
              className="wiki-toolbar-action disabled:opacity-40"
              title={`Move back to ${ENV_LABEL[prevEnv]}`}
            >
              ◀ {ENV_LABEL[prevEnv]}
            </button>
          )}
          {nextEnv && (
            <button
              disabled={actionPending}
              onClick={() => handlePromote(nextEnv)}
              className="wiki-toolbar-action text-accent-teal disabled:opacity-40"
              title={`Promote to ${ENV_LABEL[nextEnv]}`}
            >
              ▶ {nextEnv === "live" ? "Go Live" : "→ Staging"}
            </button>
          )}

          <button className="wiki-toolbar-action" onClick={() => showToast("Citation copied to clipboard")}>＋ Cite</button>
          <ExportMenu
            triggerLabel="↗ Export"
            triggerClassName="wiki-toolbar-action"
            getContent={() => ({
              title:    wiki.title,
              html:     wiki.content,
              filename: wiki.title,
            })}
          />

          {/* Delete */}
          {deleteConfirm ? (
            <span className="flex items-center gap-1">
              <button
                disabled={actionPending}
                onClick={handleDelete}
                className="wiki-toolbar-action text-accent-rose hover:bg-[rgba(239,68,68,0.1)] disabled:opacity-40"
              >
                {actionPending ? "Deleting…" : "Confirm delete"}
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="wiki-toolbar-action">Cancel</button>
            </span>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="wiki-toolbar-action text-ink-3 hover:text-accent-rose"
              title="Delete this wiki"
            >
              🗑
            </button>
          )}

          <div className="wiki-pagenav">
            <button className="wiki-pagenav-btn" onClick={() => navPage("prev")} disabled={pageIdx <= 0}>‹</button>
            <span className="wiki-pagenav-label">Page</span>
            <span className="wiki-pagenav-cur">{pageIdx + 1} / {wiki.pageList.length}</span>
            <button className="wiki-pagenav-btn" onClick={() => navPage("next")} disabled={pageIdx >= wiki.pageList.length - 1}>›</button>
          </div>
        </div>

        <div dangerouslySetInnerHTML={{ __html: wiki.content }} />
      </div>

      {/* RIGHT: metadata */}
      <aside className="wiki-meta">
        <div className="meta-label">Sources</div>
        <div className="meta-sources-panel">
          {wiki.sources.map((s, i) => (
            <div key={i} className="source-item" onClick={() => sourceClick(i + 1)}>
              <span className="src-num">[{i + 1}]</span>
              <span className="src-title">{s.title}</span>
              <div className="src-meta" style={{ marginTop: 4 }}>{s.meta}</div>
            </div>
          ))}
        </div>

        <div className="meta-label">Related Wikis</div>
        <div>
          {wiki.related.map((r) => {
            const targetSlug = slugMap[r.name];
            return (
              <div
                key={r.name}
                className="related-item"
                style={{ cursor: targetSlug ? "pointer" : "default" }}
                onClick={() => targetSlug && router.push(`/wikis/${targetSlug}`)}
              >
                <div className="rel-ic">{r.ic}</div>
                <span>{r.name}</span>
              </div>
            );
          })}
        </div>

        <div className="meta-label">Metadata</div>
        <div className="meta-version">
          <div className="row"><span>version</span><span className="v">v{wiki.version}</span></div>
          <div className="row"><span>maintainer</span><span className="v">atila</span></div>
          <div className="row"><span>visibility</span><span className="v">{wiki.visibility}</span></div>
          <div className="row"><span>last build</span><span className="v">{wiki.updated}</span></div>
        </div>
      </aside>

      {/* Citation popover */}
      {pop && (
        <div
          className={`ref-popover ${pop.visible ? "visible" : ""}`}
          style={{ top: pop.top, left: pop.left }}
          onMouseEnter={() => { if (popHideTimer.current) clearTimeout(popHideTimer.current); }}
          onMouseLeave={() => setPop((p) => (p ? { ...p, visible: false } : null))}
        >
          <div className="ref-popover-venue">{pop.venue}</div>
          <div className="ref-popover-title">{pop.title}</div>
          <div className="ref-popover-meta">Source [{pop.idx + 1}] of {pop.total}</div>
          <div className="ref-popover-action" onClick={() => jumpToSource(pop.idx)}>Jump to source ↗</div>
        </div>
      )}
    </div>
  );
}
