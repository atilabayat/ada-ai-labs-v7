"use client";

import { useEffect, useRef } from "react";
import { AppDef, NavSectionDef, Skill } from "@/lib/types";
import { useWorkspace } from "@/lib/store";

interface Props {
  appsMap: Record<string, AppDef>;
  wikiSlugMap: Record<string, string>;
  wikiTitlesMap: Record<string, string>;
  skills: Skill[];
  nav: NavSectionDef[];
  children: React.ReactNode;
}

/**
 * Bridges server-fetched data into the client Zustand store. Hydrates
 * SYNCHRONOUSLY on first render (not in useEffect) so child components reading
 * from the store during the same render pass — e.g. <Sidebar> — see the data
 * during SSR and avoid a flash-of-empty-sidebar on mount.
 *
 * Note: the Zustand store is module-level and shared across requests on the
 * server. For this single-user workbench that's acceptable; the latest
 * request's hydrate() always wins, so the store reflects current data.
 */
export default function DataProvider({
  appsMap,
  wikiSlugMap,
  wikiTitlesMap,
  skills,
  nav,
  children,
}: Props) {
  const hydrate = useWorkspace((s) => s.hydrate);
  const firstRun = useRef(true);

  if (firstRun.current) {
    hydrate({ appsMap, wikiSlugMap, wikiTitlesMap, skills, nav });
    firstRun.current = false;
  }

  // Re-hydrate when props change on subsequent renders (route navigations).
  useEffect(() => {
    if (firstRun.current) return; // first run already hydrated synchronously
    hydrate({ appsMap, wikiSlugMap, wikiTitlesMap, skills, nav });
  }, [appsMap, wikiSlugMap, wikiTitlesMap, skills, nav, hydrate]);

  return <>{children}</>;
}
