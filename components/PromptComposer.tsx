"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { useWorkspace } from "@/lib/store";
import { createBuild, getNotebooks, type NotebookEntry } from "@/lib/actions";

const catDot: Record<string, string> = {
  research: "bg-accent",
  quant: "bg-accent-amber",
  dev: "bg-accent-teal",
  knowledge: "bg-accent-rose",
};

export default function PromptComposer() {
  const skills = useWorkspace((s) => s.skills);
  const selectedSkills = useWorkspace((s) => s.selectedSkills);
  const toggleSkill = useWorkspace((s) => s.toggleSkill);
  const removeSkill = useWorkspace((s) => s.removeSkill);
  const clearSkills = useWorkspace((s) => s.clearSkills);
  const composerPrompt = useWorkspace((s) => s.composerPrompt);
  const clearComposerPrompt = useWorkspace((s) => s.clearComposerPrompt);
  const env = useWorkspace((s) => s.env);
  const setCurrentBuild = useWorkspace((s) => s.setCurrentBuild);
  const currentBuildId = useWorkspace((s) => s.currentBuildId);
  const showToast = useWorkspace((s) => s.showToast);

  const [prompt, setPrompt] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pending, startTransition] = useTransition();

  // Notebook picker (shown when /notebooklm is in selectedSkills)
  const [notebooks, setNotebooks] = useState<NotebookEntry[]>([]);
  const [nbQuery, setNbQuery] = useState("");
  const [nbPickerOpen, setNbPickerOpen] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState<NotebookEntry | null>(null);
  const [nbLoading, setNbLoading] = useState(false);
  const [nbError, setNbError] = useState<string | null>(null);

  const notebooklmActive = selectedSkills.includes("notebooklm");

  const loadNotebooks = useCallback((force = false) => {
    setNbLoading(true);
    setNbError(null);
    getNotebooks(force).then((res) => {
      setNotebooks(res.notebooks);
      setNbError(res.error ?? null);
      setNbLoading(false);
    });
  }, []);

  // Fetch notebooks when the notebooklm skill is added
  useEffect(() => {
    if (!notebooklmActive) { setSelectedNotebook(null); return; }
    if (notebooks.length > 0) return;
    loadNotebooks();
  }, [notebooklmActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Suggestion card clicked → populate textarea, focus, scroll into view.
  useEffect(() => {
    if (!composerPrompt) return;
    setPrompt(composerPrompt);
    clearComposerPrompt();
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [composerPrompt, clearComposerPrompt]);

  const handleClearSkills = () => {
    clearSkills();
    setSelectedNotebook(null);
    setNbPickerOpen(false);
    setPickerOpen(false);
  };

  const lines = prompt === "" ? 0 : prompt.split("\n").length;
  const canSubmit = prompt.trim().length > 0 && !pending;

  const handleBuild = () => {
    if (!canSubmit) return;
    // Prepend notebook header when notebooklm skill is active and a notebook is selected
    let promptToRun = prompt;
    if (notebooklmActive && selectedNotebook) {
      promptToRun =
        `__nlm_notebook__: ${JSON.stringify({ id: selectedNotebook.id, title: selectedNotebook.title })}\n` +
        prompt;
    }
    const skillsToRun = [...selectedSkills];

    startTransition(async () => {
      const result = await createBuild(promptToRun, skillsToRun, env);
      if (result.ok) {
        setCurrentBuild(result.id, promptToRun);
        // Keep prompt visible — user can see what's executing and edit for a rebuild
        showToast(`Build ${result.id} queued · ${skillsToRun.length} skill${skillsToRun.length === 1 ? "" : "s"}`);
      } else {
        showToast(`Build failed: ${result.error}`);
      }
    });
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (composerRef.current && !composerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
        setNbPickerOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // ⌘Enter / ⌃Enter submits
  const onPromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleBuild();
    }
  };

  const cats = Array.from(new Set(skills.map((s) => s.cat)));
  const filtered = skills.filter((s) => {
    const matchesCat   = !catFilter || s.cat === catFilter;
    const matchesQuery = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.cat.includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });
  const groups = filtered.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div
      ref={composerRef}
      className={`relative mb-7 rounded-[14px] border bg-gradient-to-b from-bg-2 to-bg-1 px-[22px] pb-[14px] pt-[22px] shadow-[var(--glow),0_30px_60px_-20px_rgba(0,0,0,0.6)] transition-colors focus-within:border-[rgba(77,141,255,0.5)] ${pending ? "border-[rgba(245,158,11,0.5)]" : "border-line-strong"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-2">▸ Prompt Composer</span>
        <span className="font-mono text-[10px] text-ink-3">
          <span className="text-ink-1">{lines}</span> lines · {prompt.length} chars · stack{" "}
          <span className="text-ink-1">{selectedSkills.length}</span>/10
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={onPromptKeyDown}
        onFocus={() => { setPickerOpen(false); setNbPickerOpen(false); setCatFilter(null); }}
        readOnly={pending}
        placeholder="Describe what you want to build, research, or analyze. Stack additional prompts beneath, or chain skills below..."
        className={`max-h-[320px] min-h-[160px] w-full resize-none border-0 bg-transparent font-body text-[15px] leading-relaxed outline-none placeholder:italic placeholder:text-ink-3 transition-opacity ${pending ? "cursor-default select-none opacity-50 text-ink-2" : "text-ink-0"}`}
        rows={6}
      />

      {/* Execution status strip — visible only while build is queued/running */}
      {pending && (
        <div className="mb-2 flex items-center gap-[10px] rounded-[7px] border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.06)] px-[12px] py-[8px]">
          <span className="relative flex h-[8px] w-[8px] shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-amber opacity-75" />
            <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-accent-amber" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent-amber">Executing</span>
          <span className="font-mono text-[10px] text-ink-3">
            {selectedSkills.map((id) => `/${id}`).join(" → ")}
          </span>
        </div>
      )}

      <div className="relative mt-[14px] flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-[6px]">
          {selectedSkills.map((id, i) => {
            const s = skills.find((x) => x.id === id);
            if (!s) return null;
            return (
              <span key={id} className="contents">
                {i > 0 && <span className="select-none font-mono text-[12px] text-ink-3">+</span>}
                <span className="animate-chipIn inline-flex items-center gap-[6px] rounded-full border border-line-strong bg-bg-3 px-[11px] py-[5px] font-mono text-[11px] text-ink-1 transition-colors hover:border-accent hover:text-ink-0">
                  <span className={`h-[6px] w-[6px] rounded-full ${catDot[s.cat]} shadow-[0_0_6px_currentColor]`} />
                  <span>{s.name}</span>
                  <span className="ml-[2px] cursor-pointer text-[13px] leading-none text-ink-3 hover:text-accent-rose" onClick={() => removeSkill(id)}>×</span>
                </span>
              </span>
            );
          })}
          {selectedSkills.length > 0 && <span className="select-none font-mono text-[12px] text-ink-3">+</span>}
          <button
            onClick={(e) => { e.stopPropagation(); setPickerOpen((o) => !o); setNbPickerOpen(false); }}
            className="grid h-[28px] w-[28px] place-items-center rounded-full border border-dashed border-line-strong text-[14px] text-ink-2 transition-colors hover:border-solid hover:border-accent hover:text-accent"
          >
            +
          </button>
          {selectedSkills.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleClearSkills(); }}
              title="Clear all skills"
              className="inline-flex items-center gap-[5px] rounded-full border border-line-strong bg-bg-3 px-[10px] py-[4px] font-mono text-[10px] text-ink-3 transition-colors hover:border-accent-rose hover:text-accent-rose"
            >
              <span className="text-[12px] leading-none">×</span> clear
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {currentBuildId && (
            <button
              onClick={() => {
                setCurrentBuild(null, "");
              }}
              disabled={pending}
              title="Start a fresh research inquiry (clears previous wiki)"
              className="flex items-center gap-[6px] rounded-full border border-line-strong bg-bg-2 px-[16px] py-[8px] text-[12px] font-medium text-ink-0 transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>⊕ New Build</span>
            </button>
          )}
          <button
            onClick={handleBuild}
            disabled={!canSubmit}
            title={currentBuildId ? "Rebuild with modified prompt" : "⌘↩ to submit"}
            className="flex items-center gap-[8px] rounded-full bg-gradient-to-br from-accent-hot to-accent-rose px-[22px] py-[9px] text-[13px] font-medium text-white shadow-[0_4px_20px_rgba(255,122,61,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(255,122,61,0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_20px_rgba(255,122,61,0.3)]"
          >
            {pending ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Queuing
              </>
            ) : currentBuildId ? (
              <>
                <span className="h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-white" />
                Rebuild
              </>
            ) : (
              <>
                <span className="h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-white" />
                Build
              </>
            )}
            <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/70">⌘↩</span>
          </button>
        </div>

        {/* Notebook picker — shown when /notebooklm skill is selected */}
        {notebooklmActive && (
          <div className="relative mt-[10px] w-full">
            <div className="flex items-center gap-2 rounded-[8px] border border-[rgba(26,158,110,0.4)] bg-[rgba(26,158,110,0.06)] px-[12px] py-[8px]">
              <span className="text-[14px]">📓</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#1a9e6e]">Notebook</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setNbPickerOpen((o) => !o); setPickerOpen(false); }}
                className="flex flex-1 items-center justify-between gap-2 text-left"
              >
                {nbLoading ? (
                  <span className="font-mono text-[11px] text-ink-3">Loading notebooks…</span>
                ) : nbError && notebooks.length === 0 ? (
                  <span className="font-mono text-[11px] text-accent-rose">Couldn&apos;t load — open to retry</span>
                ) : selectedNotebook ? (
                  <span className="truncate text-[12px] text-ink-0">{selectedNotebook.title}</span>
                ) : (
                  <span className="font-mono text-[11px] italic text-ink-3">Select a notebook…</span>
                )}
                <span className="text-[10px] text-ink-3">▾</span>
              </button>
              {selectedNotebook && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedNotebook(null); }}
                  className="text-[13px] leading-none text-ink-3 hover:text-accent-rose"
                >×</button>
              )}
            </div>

            {nbPickerOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-[60] flex w-full max-w-[520px] flex-col rounded-[10px] border border-line-strong bg-bg-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="p-2 pb-0">
                  <input
                    autoFocus
                    value={nbQuery}
                    onChange={(e) => setNbQuery(e.target.value)}
                    placeholder="search notebooks…"
                    className="w-full rounded-md border border-line bg-bg-1 px-[10px] py-[7px] font-mono text-[11px] text-ink-0 outline-none focus:border-[#1a9e6e]"
                  />
                </div>
                <div className="max-h-[260px] overflow-y-auto p-2 pt-1">
                  {/* Stale note: we have a cached list but the live refresh failed. */}
                  {!nbLoading && nbError && notebooks.length > 0 && (
                    <div className="mb-1 flex items-center justify-between gap-2 rounded-[5px] border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.06)] px-[8px] py-[5px]">
                      <span className="font-mono text-[9px] leading-tight text-accent-amber">⚠ Saved list — live refresh failed</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); loadNotebooks(true); }}
                        className="shrink-0 font-mono text-[9px] uppercase tracking-[0.06em] text-ink-2 transition hover:text-[#1a9e6e]"
                      >↻ retry</button>
                    </div>
                  )}
                  {notebooks
                    .filter((nb) =>
                      nbQuery.trim() === "" ||
                      nb.title.toLowerCase().includes(nbQuery.toLowerCase())
                    )
                    .map((nb) => (
                      <div
                        key={nb.id}
                        onClick={() => {
                          setSelectedNotebook(nb);
                          setNbPickerOpen(false);
                          setNbQuery("");
                        }}
                        className={`flex cursor-pointer items-center gap-[10px] rounded-[5px] px-[10px] py-[7px] text-[12px] transition-colors hover:bg-[rgba(26,158,110,0.08)] ${selectedNotebook?.id === nb.id ? "text-ink-0" : "text-ink-1"}`}
                      >
                        <span className="text-[13px]">📓</span>
                        <span className="flex-1 truncate">{nb.title}</span>
                        <span className="shrink-0 font-mono text-[10px] text-ink-3">{nb.source_count} src</span>
                        {selectedNotebook?.id === nb.id && (
                          <span className="text-[11px] text-[#1a9e6e]">●</span>
                        )}
                      </div>
                    ))}
                  {nbLoading && (
                    <div className="py-6 text-center font-mono text-[11px] text-ink-3">
                      Loading notebooks… first load can take ~20–30s
                    </div>
                  )}
                  {!nbLoading && nbError && notebooks.length === 0 && (
                    <div className="px-2 py-5 text-center">
                      <div className="mb-2 font-mono text-[11px] leading-relaxed text-accent-rose">{nbError}</div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); loadNotebooks(true); }}
                        className="rounded-md border border-line-strong px-3 py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] text-ink-1 transition hover:border-[#1a9e6e] hover:text-[#1a9e6e]"
                      >
                        ↻ Retry
                      </button>
                    </div>
                  )}
                  {!nbLoading && !nbError && notebooks.length === 0 && (
                    <div className="py-6 text-center font-mono text-[11px] text-ink-3">No notebooks in your library</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {pickerOpen && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 flex w-[400px] flex-col rounded-[10px] border border-line-strong bg-bg-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Search */}
            <div className="p-2 pb-0">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search skills…"
                className="w-full rounded-md border border-line bg-bg-1 px-[10px] py-[7px] font-mono text-[11px] text-ink-0 outline-none focus:border-accent"
              />
            </div>

            {/* Category tab filter */}
            <div className="flex gap-1 px-2 pt-2">
              <button
                onClick={() => setCatFilter(null)}
                className={`rounded-[5px] px-[9px] py-[4px] font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${!catFilter ? "bg-[rgba(77,141,255,0.15)] text-accent" : "text-ink-3 hover:text-ink-1"}`}
              >
                All
              </button>
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(catFilter === c ? null : c)}
                  className={`flex items-center gap-[5px] rounded-[5px] px-[9px] py-[4px] font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${catFilter === c ? "bg-[rgba(77,141,255,0.12)] text-ink-0" : "text-ink-3 hover:text-ink-1"}`}
                >
                  <span className={`h-[6px] w-[6px] rounded-full ${catDot[c] ?? "bg-ink-3"}`} />
                  {c}
                </button>
              ))}
            </div>

            {/* Scrollable skill list */}
            <div className="max-h-[300px] overflow-y-auto p-2 pt-1">
              {Object.entries(groups).length === 0 && (
                <div className="py-6 text-center font-mono text-[11px] text-ink-3">No skills match</div>
              )}
              {Object.entries(groups).map(([g, items]) => (
                <div key={g}>
                  <div className="px-2 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-3">{g}</div>
                  {items.map((s) => {
                    const sel = selectedSkills.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          toggleSkill(s.id);
                          setPickerOpen(false);
                          if (s.id === "notebooklm" && !selectedSkills.includes(s.id)) {
                            setNbPickerOpen(true);
                          }
                        }}
                        className={`flex cursor-pointer items-center gap-[10px] rounded-[5px] px-[10px] py-[7px] text-[12px] transition-colors hover:bg-[rgba(77,141,255,0.08)] ${sel ? "text-ink-0" : "text-ink-1"}`}
                      >
                        <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${catDot[s.cat] ?? "bg-ink-3"}`} />
                        <span className="flex-1">{s.name}</span>
                        <span className={`text-[11px] text-accent-teal transition-opacity ${sel ? "opacity-100" : "opacity-0"}`}>●</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
