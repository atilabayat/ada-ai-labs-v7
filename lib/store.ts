"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AppDef, Env, Skill, NavSectionDef } from "@/lib/types";

interface WorkspaceState {
  env: Env;
  setEnv: (env: Env) => void;

  // Server-hydrated data
  appsMap: Record<string, AppDef>;
  wikiSlugMap: Record<string, string>;   // "Display Title" → slug
  wikiTitlesMap: Record<string, string>; // slug → "Display Title"
  skills: Skill[];
  nav: NavSectionDef[];
  hydrate: (data: {
    appsMap: Record<string, AppDef>;
    wikiSlugMap: Record<string, string>;
    wikiTitlesMap: Record<string, string>;
    skills: Skill[];
    nav: NavSectionDef[];
  }) => void;
  /** Apply an env change to an app in the store (optimistic). */
  setAppEnv: (id: string, env: Env) => void;
  /** Remove an app from the store and close overlay if it's open (optimistic delete). */
  removeAppFromStore: (id: string) => void;
  /** Rename an app in the store (optimistic). */
  renameAppInStore: (id: string, name: string) => void;

  // Launch overlay
  launchedAppId: string | null;
  openLaunch: (id: string) => void;
  closeLaunch: () => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Command palette (⌘K)
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  togglePalette: () => void;

  // Builder — current in-flight or just-finished build
  currentBuildId: string | null;
  currentBuildPrompt: string;
  setCurrentBuild: (id: string | null, prompt?: string) => void;

  // Settings panel
  settingsOpen: boolean;
  toggleSettings: () => void;

  // Help panel
  helpOpen: boolean;
  toggleHelp: () => void;

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;

  // Prompt composer
  selectedSkills: string[];
  toggleSkill: (id: string) => void;
  removeSkill: (id: string) => void;
  clearSkills: () => void;
  /** Called by suggestion cards: sets prompt text + replaces skill stack. */
  primeComposer: (prompt: string, skills: string[]) => void;
  /** Consumed by PromptComposer to populate textarea; cleared after read. */
  composerPrompt: string;
  clearComposerPrompt: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
  env: "dev",
  setEnv: (env) => set({ env }),

  appsMap: {},
  wikiSlugMap: {},
  wikiTitlesMap: {},
  skills: [],
  nav: [],
  hydrate: ({ appsMap, wikiSlugMap, wikiTitlesMap, skills, nav }) =>
    set({ appsMap, wikiSlugMap, wikiTitlesMap, skills, nav }),
  setAppEnv: (id, env) => {
    const cur = get().appsMap;
    const app = cur[id];
    if (!app) return;
    set({ appsMap: { ...cur, [id]: { ...app, env } } });
  },
  removeAppFromStore: (id) => {
    const cur = get().appsMap;
    const next = { ...cur };
    delete next[id];
    const updates: Partial<WorkspaceState> = { appsMap: next };
    if (get().launchedAppId === id) updates.launchedAppId = null;
    set(updates);
  },
  renameAppInStore: (id, name) => {
    const cur = get().appsMap;
    const app = cur[id];
    if (!app) return;
    set({ appsMap: { ...cur, [id]: { ...app, name } } });
  },

  launchedAppId: null,
  openLaunch: (id) => set({ launchedAppId: id }),
  closeLaunch: () => set({ launchedAppId: null }),

  theme: "light" as const,
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    set({ theme: next });
    if (typeof document !== "undefined")
      document.documentElement.setAttribute("data-theme", next);
  },

  paletteOpen: false,
  setPaletteOpen: (open) => set({ paletteOpen: open }),
  togglePalette: () => set({ paletteOpen: !get().paletteOpen }),

  currentBuildId: null,
  currentBuildPrompt: "",
  setCurrentBuild: (id, prompt) =>
    set((s) => ({
      currentBuildId:     id,
      currentBuildPrompt: id === null ? "" : (prompt ?? s.currentBuildPrompt),
    })),

  settingsOpen: false,
  toggleSettings: () => set({ settingsOpen: !get().settingsOpen, helpOpen: false }),

  helpOpen: false,
  toggleHelp: () => set({ helpOpen: !get().helpOpen, settingsOpen: false }),

  toast: null,
  showToast: (msg) => {
    set({ toast: msg });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 2500);
  },

  selectedSkills: ["web-search"],
  toggleSkill: (id) => {
    const cur = get().selectedSkills;
    set({
      selectedSkills: cur.includes(id)
        ? cur.filter((s) => s !== id)
        : [...cur, id],
    });
  },
  removeSkill: (id) =>
    set({ selectedSkills: get().selectedSkills.filter((s) => s !== id) }),
  clearSkills: () => set({ selectedSkills: [] }),

  composerPrompt: "",
  clearComposerPrompt: () => set({ composerPrompt: "" }),
  primeComposer: (prompt, skills) =>
    set({ composerPrompt: prompt, selectedSkills: skills }),
    }),
    {
      name: "ada-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        selectedSkills: s.selectedSkills,
        env: s.env,
      }),
      skipHydration: true,
    }
  )
);
