"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/store";

// ─── Static catalog ─────────────────────────────────────────────────────────

interface PageEntry {
  kind: "page";
  label: string;
  route: string;
  hint: string;
  ic: string;
}

const PAGES: PageEntry[] = [
  { kind: "page", label: "AI Builder",         route: "/builder",      hint: "Compose builds",        ic: "◉" },
  { kind: "page", label: "Dashboard",          route: "/dashboard",    hint: "Workspace status",      ic: "▦" },
  { kind: "page", label: "Applications",       route: "/applications", hint: "Launch standalone apps",ic: "⊞" },
  { kind: "page", label: "Deep Research",      route: "/research",     hint: "Research engine",       ic: "⟢" },
  { kind: "page", label: "Wikis",              route: "/wikis",        hint: "All wikis",             ic: "▤" },
  { kind: "page", label: "Knowledge Graph",    route: "/knowledge",    hint: "Entity graph",          ic: "◆" },
  { kind: "page", label: "Market Floor",       route: "/quant",        hint: "Quant Lab",             ic: "▲" },
  { kind: "page", label: "Skill Library",      route: "/skills",       hint: "Browse skills",         ic: "◇" },
  { kind: "page", label: "Administration",     route: "/admin",        hint: "API keys, audit",       ic: "⛨" },
];

// ─── Fuzzy match ────────────────────────────────────────────────────────────

function score(q: string, hay: string): number | null {
  if (!q) return 0;
  const Q = q.toLowerCase();
  const H = hay.toLowerCase();
  const ix = H.indexOf(Q);
  if (ix >= 0) {
    // Direct substring: higher score for earlier matches, big bonus for start-of-word.
    const startsAtWord = ix === 0 || /\s|[/-]/.test(H[ix - 1]);
    return 1000 - ix * 2 + (startsAtWord ? 200 : 0);
  }
  // Chars-in-order fallback
  let qi = 0;
  for (let i = 0; i < H.length && qi < Q.length; i++) {
    if (H[i] === Q[qi]) qi++;
  }
  return qi === Q.length ? 50 : null;
}

// ─── Result types ───────────────────────────────────────────────────────────

type ResultItem =
  | { kind: "page"; key: string; label: string; hint: string; ic: string; route: string }
  | { kind: "app"; key: string; label: string; hint: string; ic: string; id: string }
  | { kind: "wiki"; key: string; label: string; hint: string; ic: string; slug: string }
  | { kind: "skill"; key: string; label: string; hint: string; ic: string; id: string };

interface Group {
  title: string;
  items: ResultItem[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CommandPalette() {
  const router = useRouter();
  const open = useWorkspace((s) => s.paletteOpen);
  const setOpen = useWorkspace((s) => s.setPaletteOpen);
  const togglePalette = useWorkspace((s) => s.togglePalette);
  const appsMap = useWorkspace((s) => s.appsMap);
  const wikiTitlesMap = useWorkspace((s) => s.wikiTitlesMap);
  const allSkills = useWorkspace((s) => s.skills);
  const openLaunch = useWorkspace((s) => s.openLaunch);
  const toggleSkill = useWorkspace((s) => s.toggleSkill);
  const showToast = useWorkspace((s) => s.showToast);

  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keybinds: ⌘K (or ⌃K) to toggle anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, togglePalette, setOpen]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      // Defer focus so the input is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Build the universe of searchable items each render. Cheap — 8 apps + 6
  // wikis + 28 skills + 9 routes = ~50 entries.
  const groups: Group[] = useMemo(() => {
    const apps = Object.values(appsMap).map<ResultItem>((a) => ({
      kind: "app",
      key: `app:${a.id}`,
      label: a.name,
      hint: a.cat,
      ic: a.icon,
      id: a.id,
    }));

    const wikis = Object.entries(wikiTitlesMap).map<ResultItem>(([slug, title]) => ({
      kind: "wiki",
      key: `wiki:${slug}`,
      label: title,
      hint: "Wiki",
      ic: "▤",
      slug,
    }));

    const skills = allSkills.map<ResultItem>((s) => ({
      kind: "skill",
      key: `skill:${s.id}`,
      label: s.name,
      hint: s.desc,
      ic: "◇",
      id: s.id,
    }));

    const pages = PAGES.map<ResultItem>((p) => ({
      kind: "page",
      key: `page:${p.route}`,
      label: p.label,
      hint: p.hint,
      ic: p.ic,
      route: p.route,
    }));

    // Score each item against the query
    const filter = (items: ResultItem[]) =>
      items
        .map((item) => ({ item, s: score(query, item.label + " " + item.hint) }))
        .filter((x): x is { item: ResultItem; s: number } => x.s !== null)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.item);

    const result: Group[] = [];
    const filteredPages = filter(pages);
    const filteredApps = filter(apps);
    const filteredWikis = filter(wikis);
    const filteredSkills = filter(skills);

    if (filteredPages.length) result.push({ title: "Pages", items: filteredPages });
    if (filteredApps.length) result.push({ title: "Applications", items: filteredApps });
    if (filteredWikis.length) result.push({ title: "Wikis", items: filteredWikis });
    if (filteredSkills.length)
      result.push({ title: "Skills", items: filteredSkills.slice(0, query ? 12 : 6) });

    return result;
  }, [query, appsMap, wikiTitlesMap, allSkills]);

  // Flat list for keyboard nav
  const flat: ResultItem[] = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Clamp activeIdx whenever the result list changes shape
  useEffect(() => {
    if (activeIdx >= flat.length) setActiveIdx(Math.max(0, flat.length - 1));
  }, [flat.length, activeIdx]);

  const choose = (item: ResultItem) => {
    setOpen(false);
    switch (item.kind) {
      case "page":
        router.push(item.route);
        break;
      case "app":
        openLaunch(item.id);
        break;
      case "wiki":
        router.push(`/wikis/${item.slug}`);
        break;
      case "skill":
        toggleSkill(item.id);
        showToast(`Skill ${item.label} added to stack`);
        router.push("/builder");
        break;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (flat.length === 0 ? 0 : (i + 1) % flat.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (flat.length === 0 ? 0 : (i - 1 + flat.length) % flat.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[activeIdx];
      if (item) choose(item);
    }
  };

  // Scroll active row into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-start justify-center bg-[rgba(3,5,11,0.7)] pt-[12vh] backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-[620px] overflow-hidden rounded-[14px] border border-line-strong bg-bg-1 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-line bg-bg-2 px-5 py-[14px]">
          <span className="font-mono text-[14px] text-accent">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, apps, wikis, skills..."
            className="flex-1 border-0 bg-transparent font-body text-[15px] text-ink-0 outline-none placeholder:italic placeholder:text-ink-3"
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded border border-line-strong px-[7px] py-[2px] font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-ink-0"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {groups.length === 0 && (
            <div className="px-5 py-10 text-center">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">No results</div>
              <div className="text-[13px] text-ink-2">Try a different search — pages, apps, wikis, skills</div>
            </div>
          )}

          {groups.map((g) => (
            <div key={g.title}>
              <div className="border-b border-line bg-[rgba(15,22,38,0.6)] px-5 py-[6px] font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
                {g.title}
              </div>
              {g.items.map((item) => {
                flatIdx++;
                const isActive = flatIdx === activeIdx;
                const myIdx = flatIdx;
                return (
                  <div
                    key={item.key}
                    data-idx={myIdx}
                    onClick={() => choose(item)}
                    onMouseEnter={() => setActiveIdx(myIdx)}
                    className={`relative flex cursor-pointer items-center gap-3 px-5 py-[10px] transition-colors ${
                      isActive ? "bg-[rgba(77,141,255,0.08)]" : ""
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-0 h-full w-[2px] bg-accent shadow-[0_0_8px_var(--accent)]" />}
                    <div className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-md font-mono text-[12px] ${
                      item.kind === "app"   ? "bg-[rgba(245,183,72,0.1)] text-accent-amber"
                      : item.kind === "wiki" ? "bg-[rgba(255,86,119,0.1)] text-accent-rose"
                      : item.kind === "skill"? "bg-[rgba(45,212,191,0.1)] text-accent-teal"
                      : "bg-[rgba(77,141,255,0.1)] text-accent"
                    }`}>
                      {item.ic}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-[13.5px] ${isActive ? "text-ink-0" : "text-ink-1"}`}>{item.label}</div>
                      <div className="truncate font-mono text-[10px] text-ink-3">{item.hint}</div>
                    </div>
                    {isActive && (
                      <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-accent">
                        Enter ↩
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-line bg-bg-2 px-5 py-2 font-mono text-[10px] text-ink-3">
          <span><span className="text-ink-1">↑↓</span> navigate</span>
          <span><span className="text-ink-1">↩</span> select</span>
          <span><span className="text-ink-1">esc</span> close</span>
          <span className="ml-auto">{flat.length} result{flat.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
