"use client";

import { useEffect } from "react";
import { useWorkspace } from "@/lib/store";

// Rehydrates persisted state (theme, selectedSkills, env) from localStorage
// after first client render. The inline <script> in layout.tsx already sets
// data-theme on <html> before paint — this just syncs the zustand store.
export default function ThemeInit() {
  useEffect(() => {
    useWorkspace.persist.rehydrate();
  }, []);

  return null;
}
