export type Env = "dev" | "staging" | "live";

export type SkillCategory = "research" | "quant" | "dev" | "knowledge";

export interface Skill {
  id: string;
  name: string;
  cat: SkillCategory;
  group: string;
  desc: string;
  uses: number;
  ver: string;
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  badgeKind?: "default" | "live" | "warn";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Shape returned by getNav() — dynamic badges resolved. */
export type NavSectionDef = NavSection;
export type NavItemDef = NavItem;

export interface AppColor {
  amber: string;
  teal: string;
  rose: string;
  violet: string;
}

export type AppType =
  | "putwall"
  | "briefing"
  | "compendium"
  | "digest"
  | "lattice"
  | "wiki"
  | "artifact"   // self-contained interactive HTML captured from a build
  | "dashboard"  // trading/quant dashboards shown on /dashboards
  | "generic";

export interface AppRuntime {
  region: string;
  uptime: string;
  latency: string;
  requests: string;
  errors: string;
}

export interface AppDef {
  id: string;
  name: string;
  cat: string;
  icon: string;
  color: keyof AppColor;
  env: Env;
  url: string;
  type: AppType;
  desc: string;
  runtime: AppRuntime;
  log: [string, string, string][];
  /** Self-contained interactive HTML artifact captured from the source build.
   *  When present, the launcher renders it in a sandboxed iframe. */
  html?: string;
  /** Publishable markdown portion of the artifact (for export / open-as-wiki). */
  markdown?: string;
}

export interface WikiSource {
  title: string;
  meta: string;
}

export interface WikiRelated {
  name: string;
  ic: string;
}

export interface WikiTocItem {
  id: string;
  name: string;
  sub?: boolean;
}

export interface WikiPage {
  id: string;
  name: string;
  current?: boolean;
}

export interface WikiDef {
  slug?: string;
  title: string;
  titleEm?: string;
  lede: string;
  banner: "research" | "quant" | "philosophy" | "system";
  crumb: string;
  pages: number;
  sources: WikiSource[];
  related: WikiRelated[];
  toc: WikiTocItem[];
  pageList: WikiPage[];
  updated: string;
  version: string;
  visibility: string;
  env?: Env;
  /** HTML content string for the reader body */
  content: string;
}

export interface WikiCardMeta {
  slug: string;
  title: string;
  desc: string;
  banner: "research" | "quant" | "philosophy" | "system";
  pages: string;
  sources: string;
  updated: string;
}

/** Single result item returned by runDeepResearch server action. */
export interface DeepResearchResult {
  id:       string;
  title:    string;
  badge:    string;  // e.g. "arXiv 2506.04287", domain name, "SEC 10-K"
  date:     string;  // display string, e.g. "June 2025"
  org:      string;  // author(s), institution, or domain
  body:     string;  // excerpt / abstract snippet
  category: string;  // "Academic" | "Industry" | "Financial" | "Government" | "Technical"
  url?:     string;
}

export interface WikiCard {
  slug: string;
  title: string;
  desc: string;
  banner: "research" | "quant" | "philosophy" | "system";
  env?: Env;
  stats: [string, string, string];
}
