/**
 * Static nav structure for seeding. Items with `badgeKind` but `badgeText: null`
 * have their badge text COMPUTED AT QUERY TIME from live DB counts (see
 * `getNav()` in `lib/queries.ts`).
 *
 *   /applications → "{n} LIVE" from apps where env='live'
 *   /wikis        → "{n}"      from wiki count
 *   /skills       → "{n}"      from skill count
 */

export interface SeedNavItem {
  label: string;
  route: string;
  icon: string;
  badgeKind?: "default" | "live" | "warn";
  badgeText?: string; // omit when value is dynamic
}

export interface SeedNavSection {
  id: string;
  title: string;
  items: SeedNavItem[];
}

export const SEED_NAV: SeedNavSection[] = [
  {
    id: "workspace",
    title: "Workspace",
    items: [
      { label: "AI Builder",            route: "/builder",          icon: "◉" },
      { label: "Reference Source API 1", route: "/reference-api-1", icon: "⊟" },
      { label: "Reference Source API 2", route: "/reference-api-2", icon: "⊠" },
      { label: "Operations Dashboard",  route: "/dashboard",        icon: "▦" },
      // badgeText omitted → computed live in getNav()
      { label: "Applications",        route: "/applications", icon: "⊞", badgeKind: "live" },
    ],
  },
  {
    id: "research",
    title: "Research",
    items: [
      { label: "Sources for Wiki Architecture", route: "/sources-wiki", icon: "⊗" },
      { label: "Deep Research",               route: "/research",     icon: "⟢" },
      { label: "Wikis",            route: "/wikis",     icon: "▤", badgeKind: "default" },
      { label: "Knowledge Graph",  route: "/knowledge", icon: "◆" },
      { label: "Archives",         route: "/wikis?env=archive", icon: "📦" },
    ],
  },
  {
    id: "quant",
    title: "Quant Lab",
    items: [
      { label: "Sources for Quants Research", route: "/sources-quant",    icon: "⊕" },
      { label: "Market Floor",               route: "/quant",            icon: "▲" },
      { label: "Call Wall Put Wall System",        route: "/quant?view=walls",    icon: "⊺" },
      { label: "Support and Resistance Profiles", route: "/sr-profiles",         icon: "≡" },
      { label: "Dashboards",                      route: "/dashboards",           icon: "▦" },
      { label: "Bloomberg Terminal",              route: "/quant?view=bloomberg", icon: "⊡" },
      { label: "Quant Skills Guide",              route: "/guides/quant-skills",  icon: "γ" },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    items: [
      { label: "Skill Library",           route: "/skills",                   icon: "◇", badgeKind: "default" },
      { label: "Quant Embedded Sources",  route: "/quant-embedded-sources",   icon: "⊘" },
    ],
  },
  {
    id: "guides",
    title: "System User Guides",
    items: [
      { label: "Prompt Composer",                      route: "/guides",                           icon: "📋" },
      { label: "Prompt User Guide - Advanced Users",   route: "/guides/prompt-composer-advanced",  icon: "⚗️" },
      { label: "Documentation & Tutorials",            route: "/wikis?section=system",             icon: "📚" },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      { label: "Administration", route: "/admin", icon: "⛨" },
    ],
  },
];
