export interface SeedKnowledgeNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  fontSize: number;
  category: "Quant" | "Wiki" | "Research" | "Application" | "Concept";
  highlight: boolean;
}

export interface SeedKnowledgeEdge {
  fromId: string;
  toId: string;
  opacity: number;
}

export const SEED_KNOWLEDGE_NODES: SeedKnowledgeNode[] = [
  // ── Core equity & options ──────────────────────────────────────────────────
  { id: "tsla",   label: "TSLA",   x: 400, y: 240, radius: 22, color: "#f5b748", fontSize: 11, category: "Quant",       highlight: true  },
  { id: "spy",    label: "SPY",    x: 860, y: 130, radius: 20, color: "#22d3ee", fontSize: 9,  category: "Quant",       highlight: false },
  { id: "put",    label: "Put",    x: 180, y: 320, radius: 20, color: "#2dd4bf", fontSize: 9,  category: "Application", highlight: false },
  { id: "call",   label: "Call",   x: 600, y: 340, radius: 20, color: "#2dd4bf", fontSize: 9,  category: "Application", highlight: false },
  // ── Volatility & dealer flow ───────────────────────────────────────────────
  { id: "vix",    label: "VIX",    x: 870, y: 300, radius: 18, color: "#f87171", fontSize: 9,  category: "Quant",       highlight: false },
  { id: "gamma",  label: "Gamma",  x: 380, y: 400, radius: 22, color: "#a78bfa", fontSize: 9,  category: "Concept",     highlight: false },
  { id: "gex",    label: "GEX",    x: 500, y: 510, radius: 18, color: "#c084fc", fontSize: 9,  category: "Concept",     highlight: false },
  // ── IPA / structure concepts ───────────────────────────────────────────────
  { id: "ipa",    label: "IPA",    x: 220, y: 120, radius: 18, color: "#ff5677", fontSize: 9,  category: "Wiki",        highlight: false },
  { id: "fvg",    label: "FVG",    x: 580, y: 120, radius: 18, color: "#4d8dff", fontSize: 9,  category: "Research",    highlight: false },
  { id: "qm-qml", label: "QM/QML", x: 120, y: 220, radius: 16, color: "#a78bfa", fontSize: 8,  category: "Concept",     highlight: false },
  { id: "smc",    label: "SMC",    x: 700, y: 220, radius: 16, color: "#a78bfa", fontSize: 8,  category: "Concept",     highlight: false },
  { id: "ob",     label: "OB",     x: 760, y: 440, radius: 16, color: "#60a5fa", fontSize: 9,  category: "Concept",     highlight: false },
  { id: "bos",    label: "BOS",    x: 660, y: 500, radius: 16, color: "#4ade80", fontSize: 9,  category: "Concept",     highlight: false },
  { id: "choch",  label: "CHoCH",  x: 100, y: 420, radius: 16, color: "#fb923c", fontSize: 8,  category: "Concept",     highlight: false },
  { id: "sweep",  label: "Sweep",  x: 280, y: 500, radius: 16, color: "#e879f9", fontSize: 8,  category: "Concept",     highlight: false },
];

export const SEED_KNOWLEDGE_EDGES: SeedKnowledgeEdge[] = [
  // TSLA hub
  { fromId: "tsla",  toId: "ipa",    opacity: 0.18 },
  { fromId: "tsla",  toId: "fvg",    opacity: 0.18 },
  { fromId: "tsla",  toId: "put",    opacity: 0.18 },
  { fromId: "tsla",  toId: "call",   opacity: 0.18 },
  { fromId: "tsla",  toId: "gamma",  opacity: 0.18 },
  // SPY hub
  { fromId: "spy",   toId: "tsla",   opacity: 0.18 },
  { fromId: "spy",   toId: "call",   opacity: 0.14 },
  { fromId: "spy",   toId: "vix",    opacity: 0.20 },
  { fromId: "spy",   toId: "gamma",  opacity: 0.14 },
  // Volatility / dealer chain
  { fromId: "vix",   toId: "gamma",  opacity: 0.18 },
  { fromId: "vix",   toId: "gex",    opacity: 0.16 },
  { fromId: "gex",   toId: "gamma",  opacity: 0.20 },
  { fromId: "gex",   toId: "fvg",    opacity: 0.12 },
  // Secondary structural
  { fromId: "ipa",   toId: "put",    opacity: 0.12 },
  { fromId: "fvg",   toId: "call",   opacity: 0.12 },
  { fromId: "ipa",   toId: "qm-qml", opacity: 0.12 },
  { fromId: "fvg",   toId: "smc",    opacity: 0.12 },
  { fromId: "put",   toId: "gamma",  opacity: 0.12 },
  { fromId: "call",  toId: "gamma",  opacity: 0.12 },
  // IPA pattern cluster
  { fromId: "ob",    toId: "smc",    opacity: 0.18 },
  { fromId: "ob",    toId: "fvg",    opacity: 0.14 },
  { fromId: "ob",    toId: "bos",    opacity: 0.16 },
  { fromId: "bos",   toId: "smc",    opacity: 0.14 },
  { fromId: "bos",   toId: "fvg",    opacity: 0.12 },
  { fromId: "choch", toId: "qm-qml", opacity: 0.16 },
  { fromId: "choch", toId: "ob",     opacity: 0.14 },
  { fromId: "choch", toId: "ipa",    opacity: 0.12 },
  { fromId: "sweep", toId: "qm-qml", opacity: 0.18 },
  { fromId: "sweep", toId: "ipa",    opacity: 0.14 },
  { fromId: "sweep", toId: "fvg",    opacity: 0.12 },
];
