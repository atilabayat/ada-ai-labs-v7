// Sidebar nav structure now lives in the database. Use the query layer:
//
//   import { getNav } from "@/lib/queries"   (server only)
//
// On the client, nav is hydrated into the Zustand store by <DataProvider>.
//
// ROUTE_META below stays static because it is literally about which Next.js
// route files exist and their breadcrumb / title. It changes only when a new
// page is added to the app — i.e. it tracks code, not data.

export const ROUTE_META: Record<string, { title: string; crumb: string[] }> = {
  "/builder":         { title: "AI Builder",            crumb: ["Workspace", "AI Builder", "New Session"] },
  "/reference-api-1": { title: "Reference Source API 1", crumb: ["Workspace", "Reference Source API 1"] },
  "/reference-api-2": { title: "Reference Source API 2", crumb: ["Workspace", "Reference Source API 2"] },
  "/dashboard":       { title: "Dashboard",             crumb: ["Workspace", "Dashboard"] },
  "/applications":   { title: "Applications",              crumb: ["Workspace", "Applications"] },
  "/sources-wiki": { title: "Sources for Wiki Architecture", crumb: ["Research", "Sources for Wiki Architecture"] },
  "/research":     { title: "Deep Research",               crumb: ["Research", "Deep Research"] },
  "/wikis":        { title: "Wikis",            crumb: ["Research", "Wikis"] },
  "/knowledge":    { title: "Knowledge Graph",  crumb: ["Research", "Knowledge Graph"] },
  "/wikis?env=archive": { title: "Archives", crumb: ["Research", "Archives"] },
  "/sources-quant": { title: "Sources for Quants Research", crumb: ["Quant Lab", "Sources for Quants Research"] },
  "/quant":         { title: "Market Floor",               crumb: ["Quant Lab", "Market Floor"] },
  "/gex-heatmap":   { title: "Gamma Exposure Heatmaps",         crumb: ["Quant Lab", "Gamma Exposure Heatmaps"] },
  "/sr-profiles":   { title: "Support and Resistance Profiles", crumb: ["Quant Lab", "S/R Profiles"] },
  "/dashboards":    { title: "Dashboards",                     crumb: ["Quant Lab", "Dashboards"] },
  "/skills":                    { title: "Skill Library",            crumb: ["Skills", "Library"] },
  "/quant-embedded-sources":  { title: "Quant Embedded Sources",  crumb: ["Skills", "Quant Embedded Sources"] },
  "/guides":                  { title: "System User Guides",       crumb: ["System", "User Guides"] },
  "/guides/prompt-composer":  { title: "Prompt Composer Guide",    crumb: ["System", "User Guides", "Prompt Composer"] },
  "/admin":        { title: "Administration",   crumb: ["System", "Administration"] },
};
