// Wiki data now lives in the database. Use the query layer:
//
//   import { getWiki, getAllWikiCards, getAllWikiSlugs,
//            getWikiSlugMap, getWikiTitlesMap }
//     from "@/lib/queries"   (server only)
//
// This file keeps only the small pieces of static config that any rendering
// surface needs (gradient tokens by banner family + the card type).

export type { WikiCard } from "../types";

export const BANNER_GRADIENTS: Record<string, string> = {
  research:   "linear-gradient(135deg, var(--accent-violet), var(--accent))",
  quant:      "linear-gradient(135deg, var(--accent-amber), var(--accent-hot))",
  philosophy: "linear-gradient(135deg, var(--accent-teal), var(--accent))",
  system:     "linear-gradient(135deg, #1a2a4a, #2a3a6a)",   // navy — system / user-guide brand
};
