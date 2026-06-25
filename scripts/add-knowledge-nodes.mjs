/**
 * Upserts knowledge-graph nodes and edges into the live SQLite DB.
 *
 * Usage:
 *   node scripts/add-knowledge-nodes.mjs
 *
 * Safe to re-run: nodes are upserted by id, edges are checked before insert.
 * Existing nodes are NOT modified — only new ones are created.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ── New nodes ──────────────────────────────────────────────────────────────────
const NEW_NODES = [
  { id: "spy",   label: "SPY",    x: 860, y: 130, radius: 20, color: "#22d3ee", fontSize: 9,  category: "Quant",   highlight: false, sortOrder: 10 },
  { id: "vix",   label: "VIX",    x: 870, y: 300, radius: 18, color: "#f87171", fontSize: 9,  category: "Quant",   highlight: false, sortOrder: 11 },
  { id: "gex",   label: "GEX",    x: 500, y: 510, radius: 18, color: "#c084fc", fontSize: 9,  category: "Concept", highlight: false, sortOrder: 12 },
  { id: "ob",    label: "OB",     x: 760, y: 440, radius: 16, color: "#60a5fa", fontSize: 9,  category: "Concept", highlight: false, sortOrder: 13 },
  { id: "bos",   label: "BOS",    x: 660, y: 500, radius: 16, color: "#4ade80", fontSize: 9,  category: "Concept", highlight: false, sortOrder: 14 },
  { id: "choch", label: "CHoCH",  x: 100, y: 420, radius: 16, color: "#fb923c", fontSize: 8,  category: "Concept", highlight: false, sortOrder: 15 },
  { id: "sweep", label: "Sweep",  x: 280, y: 500, radius: 16, color: "#e879f9", fontSize: 8,  category: "Concept", highlight: false, sortOrder: 16 },
];

// ── New edges ──────────────────────────────────────────────────────────────────
// Each pair must reference node ids that exist (existing OR in NEW_NODES above).
const NEW_EDGES = [
  // SPY hub
  { fromId: "spy",   toId: "tsla",  opacity: 0.18 },
  { fromId: "spy",   toId: "call",  opacity: 0.14 },
  { fromId: "spy",   toId: "vix",   opacity: 0.20 },
  { fromId: "spy",   toId: "gamma", opacity: 0.14 },
  // VIX
  { fromId: "vix",   toId: "gamma", opacity: 0.18 },
  { fromId: "vix",   toId: "gex",   opacity: 0.16 },
  // GEX
  { fromId: "gex",   toId: "gamma", opacity: 0.20 },
  { fromId: "gex",   toId: "fvg",   opacity: 0.12 },
  // Order Block
  { fromId: "ob",    toId: "smc",   opacity: 0.18 },
  { fromId: "ob",    toId: "fvg",   opacity: 0.14 },
  { fromId: "ob",    toId: "bos",   opacity: 0.16 },
  // Break of Structure
  { fromId: "bos",   toId: "smc",   opacity: 0.14 },
  { fromId: "bos",   toId: "fvg",   opacity: 0.12 },
  // CHoCH
  { fromId: "choch", toId: "qm-qml", opacity: 0.16 },
  { fromId: "choch", toId: "ob",     opacity: 0.14 },
  { fromId: "choch", toId: "ipa",    opacity: 0.12 },
  // Liquidity Sweep
  { fromId: "sweep", toId: "qm-qml", opacity: 0.18 },
  { fromId: "sweep", toId: "ipa",    opacity: 0.14 },
  { fromId: "sweep", toId: "fvg",    opacity: 0.12 },
];

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("── Knowledge graph update ───────────────────────────────");

  let nodesCreated = 0;
  let nodesSkipped = 0;

  for (const node of NEW_NODES) {
    const existing = await prisma.knowledgeNode.findUnique({ where: { id: node.id } });
    if (existing) {
      console.log(`  skip  node  "${node.id}" (already exists)`);
      nodesSkipped++;
    } else {
      await prisma.knowledgeNode.create({ data: node });
      console.log(`  ✓ add  node  "${node.id}" (${node.category})`);
      nodesCreated++;
    }
  }

  let edgesCreated = 0;
  let edgesSkipped = 0;

  for (const edge of NEW_EDGES) {
    const existing = await prisma.knowledgeEdge.findFirst({
      where: {
        OR: [
          { fromId: edge.fromId, toId: edge.toId },
          { fromId: edge.toId,   toId: edge.fromId },
        ],
      },
    });
    if (existing) {
      console.log(`  skip  edge  ${edge.fromId} ↔ ${edge.toId} (already exists)`);
      edgesSkipped++;
    } else {
      await prisma.knowledgeEdge.create({ data: edge });
      console.log(`  ✓ add  edge  ${edge.fromId} ↔ ${edge.toId}`);
      edgesCreated++;
    }
  }

  console.log("─────────────────────────────────────────────────────────");
  console.log(`  Nodes: ${nodesCreated} added, ${nodesSkipped} skipped`);
  console.log(`  Edges: ${edgesCreated} added, ${edgesSkipped} skipped`);
  console.log("✅  Knowledge graph updated. Reload /knowledge to see changes.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
