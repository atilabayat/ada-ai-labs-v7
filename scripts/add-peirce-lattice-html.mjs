/**
 * Attaches the standalone interactive HTML to the peirce-lattice App record.
 * Run: node scripts/add-peirce-lattice-html.mjs
 * Safe to re-run — uses upsert.
 *
 * v3: dark-themed adaptation of the desktop original
 * (C:\Users\Admin\OneDrive\Desktop\Claude JSX projects\peirce-sign-lattice.html)
 * Zero CDN deps, same DOM structure, ADA dark palette.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Peirce's Ten Classes of Signs: Lattice Structure</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0e1a; min-height: 100vh; padding: 20px 24px; color: #e8edf8; }
  .container { max-width: 960px; margin: 0 auto; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .header h1 { font-size: 20px; font-weight: 700; color: #e8edf8; }
  .info-btn { width: 32px; height: 32px; border-radius: 6px; background: rgba(77,141,255,.12); color: #4d8dff; border: 1px solid rgba(77,141,255,.25); cursor: pointer; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .info-btn:hover { background: rgba(77,141,255,.22); }
  .info-panel { background: #111827; padding: 14px 16px; border-radius: 8px; border: 1px solid #1e2a3a; margin-bottom: 12px; font-size: 13px; color: #aab4cc; line-height: 1.6; }
  .info-panel h3 { font-weight: 600; color: #e8edf8; margin-bottom: 8px; }
  .info-panel strong { color: #e8edf8; }
  .lattice-wrap { background: #0d1421; border-radius: 10px; border: 1px solid #1e2a3a; padding: 24px; position: relative; height: 600px; }
  .lattice-wrap svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
  /* Nodes */
  .node { position: absolute; transform: translate(-50%, -50%); z-index: 2; cursor: pointer; transition: opacity .2s; }
  .node-inner { min-width: 140px; padding: 8px 14px; border-radius: 7px; border: 1.5px solid #1e2a3a; background: #111827; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,.35); transition: all .2s; }
  .node-inner:hover { box-shadow: 0 4px 14px rgba(0,0,0,.5); border-color: #2d3d5a; }
  .node-inner .label { font-size: 12px; font-weight: 600; color: #e8edf8; white-space: nowrap; }
  .node-inner .notation { font-size: 10px; color: #6b7897; margin-top: 3px; font-family: monospace; }
  .node.selected .node-inner { background: rgba(167,139,250,.13); border-color: #a78bfa; transform: scale(1.08); box-shadow: 0 4px 18px rgba(167,139,250,.3); }
  .node.selected .node-inner .label { color: #e8edf8; }
  .node.selected .node-inner .notation { color: #c4b5fd; }
  .node.dimmed { opacity: .18; }
  .node.firstness .node-inner { border-color: #2dd4bf; }
  .node.thirdness .node-inner { border-color: #a78bfa; }
  .node.selected.firstness .node-inner, .node.selected.thirdness .node-inner { border-color: #a78bfa; }
  /* Description panel */
  .desc-panel { position: absolute; right: 14px; bottom: 14px; width: 290px; background: #111827; color: #e8edf8; padding: 18px; border-radius: 10px; border: 1px solid #2d3d5a; box-shadow: 0 8px 28px rgba(0,0,0,.6); z-index: 50; display: none; }
  .desc-panel.visible { display: block; }
  .desc-panel .close-btn { position: absolute; top: 10px; right: 12px; background: none; border: none; color: #6b7897; cursor: pointer; font-size: 16px; line-height: 1; }
  .desc-panel .close-btn:hover { color: #e8edf8; }
  .desc-panel .dp-title { font-size: 15px; font-weight: 700; margin-bottom: 3px; color: #e8edf8; }
  .desc-panel .dp-sub { font-size: 11px; color: #a78bfa; font-weight: 500; margin-bottom: 3px; font-family: monospace; }
  .desc-panel .dp-sep { border-top: 1px solid #1e2a3a; margin: 10px 0; }
  .desc-panel .dp-desc { font-size: 13px; line-height: 1.65; color: #aab4cc; }
  .desc-panel .dp-conn { font-size: 11px; color: #6b7897; font-family: monospace; text-transform: uppercase; letter-spacing: .06em; }
  /* Legend */
  .legend { position: absolute; bottom: 14px; left: 14px; background: rgba(13,20,33,.92); padding: 10px 12px; border-radius: 7px; border: 1px solid #1e2a3a; font-size: 11px; z-index: 3; }
  .legend .leg-title { font-weight: 600; color: #e8edf8; margin-bottom: 6px; font-size: 10px; text-transform: uppercase; letter-spacing: .1em; }
  .legend .leg-item { display: flex; align-items: center; gap: 7px; color: #aab4cc; margin-bottom: 3px; }
  .legend .swatch { width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid; flex-shrink: 0; }
  .legend .line-swatch { width: 24px; height: 1.5px; background: #2d3d5a; flex-shrink: 0; }
  /* Trichotomy box */
  .trich { position: absolute; top: 14px; right: 14px; background: rgba(13,20,33,.92); padding: 10px 12px; border-radius: 7px; border: 1px solid #1e2a3a; font-size: 11px; z-index: 3; color: #aab4cc; }
  .trich .trich-title { font-weight: 600; color: #e8edf8; margin-bottom: 6px; font-size: 10px; text-transform: uppercase; letter-spacing: .1em; }
  .trich strong { color: #4d8dff; }
  /* Properties section */
  .props { margin-top: 14px; background: #0d1421; padding: 20px 24px; border-radius: 10px; border: 1px solid #1e2a3a; }
  .props h3 { font-size: 15px; font-weight: 600; color: #e8edf8; margin-bottom: 14px; }
  .props-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 640px) { .props-grid { grid-template-columns: 1fr; } }
  .props-grid h4 { font-size: 13px; font-weight: 600; color: #c0cce4; margin-bottom: 6px; }
  .props-grid p { font-size: 12px; color: #aab4cc; line-height: 1.65; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Peirce's Ten Classes of Signs: Lattice Structure</h1>
    <button class="info-btn" onclick="toggleInfo()" title="Toggle info">&#x2139;</button>
  </div>

  <div class="info-panel" id="infoPanel">
    <h3>Understanding the Lattice</h3>
    <p>This diagram shows the hierarchical structure of Peirce's ten sign classes. Arrows point from simpler to more complex signs, showing presupposition relationships.</p>
    <p style="margin-top:8px"><strong>Notation (X,Y,Z):</strong> X = Sign itself (1=Qualisign, 2=Sinsign, 3=Legisign), Y = Relation to Object (1=Icon, 2=Index, 3=Symbol), Z = Interpretant (1=Rheme, 2=Dicent, 3=Argument)</p>
    <p style="margin-top:8px"><strong>Click a node</strong> to see its description. Click again or press &#x2715; to deselect.</p>
  </div>

  <div class="lattice-wrap" id="lattice">
    <svg id="edgeSvg"></svg>

    <div class="desc-panel" id="descPanel">
      <button class="close-btn" onclick="selectNode(null)">&#x2715;</button>
      <div class="dp-title" id="dpTitle"></div>
      <div class="dp-sub" id="dpSub"></div>
      <div class="dp-sep"></div>
      <div class="dp-desc" id="dpDesc"></div>
      <div class="dp-sep"></div>
      <div class="dp-conn" id="dpConn"></div>
    </div>

    <div class="legend">
      <div class="leg-title">Categorical Structure:</div>
      <div class="leg-item"><div class="swatch" style="border-color:#2dd4bf"></div>Pure Firstness (top)</div>
      <div class="leg-item"><div class="swatch" style="border-color:#a78bfa"></div>Pure Thirdness (bottom)</div>
      <div class="leg-item"><div class="line-swatch"></div>Presupposition (&rarr;)</div>
    </div>

    <div class="trich">
      <div class="trich-title">Three Trichotomies:</div>
      <div><strong>Sign:</strong> Qualisign (1) &rarr; Sinsign (2) &rarr; Legisign (3)</div>
      <div><strong>Object:</strong> Icon (1) &rarr; Index (2) &rarr; Symbol (3)</div>
      <div><strong>Interpretant:</strong> Rheme (1) &rarr; Dicent (2) &rarr; Argument (3)</div>
    </div>
  </div>

  <div class="props">
    <h3>Lattice Properties</h3>
    <div class="props-grid">
      <div><h4>Partial Ordering</h4><p>Each arrow represents a presupposition relation: the target sign presupposes the source sign. For example, a Dicent Symbol (proposition) presupposes a Rhematic Symbol (common noun).</p></div>
      <div><h4>Degeneracy Constraints</h4><p>Not all 27 combinations (3&times;3&times;3) are valid. Peirce's "laws of degeneracy" require that no component can exceed those to its left in complexity, yielding exactly 10 valid classes.</p></div>
      <div><h4>Meets and Joins</h4><p>The greatest common predecessor (meet &and;) of two signs is their most specific shared presupposition. The least common successor (join &or;) is their simplest common generalization.</p></div>
      <div><h4>Orthomodular Structure?</h4><p>This lattice may exhibit orthomodular properties similar to quantum logic. Complementary sign types (like Icon vs. Symbol) could represent orthogonal interpretive frameworks.</p></div>
    </div>
  </div>
</div>

<script>
const nodes = [
  { id:1,  label:"Qualisign",                   notation:"(1,1,1)", x:400, y:90,  description:"A quality insofar as it is a sign. Pure possibility of signification. Example: The redness of a stoplight before it's actually instantiated.", categories:"Pure Firstness", cls:"firstness" },
  { id:2,  label:"Iconic Sinsign",              notation:"(2,1,1)", x:250, y:160, description:"An actual existent that signifies through resemblance. Example: A particular diagram showing spatial relationships.", categories:"Second-First-First", cls:"" },
  { id:3,  label:"Rhematic Indexical Sinsign",  notation:"(2,2,1)", x:550, y:160, description:"An actual event that indicates its object. Example: A spontaneous cry indicating pain.", categories:"Second-Second-First", cls:"" },
  { id:4,  label:"Dicent Sinsign",              notation:"(2,2,2)", x:700, y:230, description:"An actual event that provides information about its object. Example: A weathercock indicating wind direction.", categories:"Second-Second-Second", cls:"" },
  { id:5,  label:"Iconic Legisign",             notation:"(3,1,1)", x:150, y:230, description:"A general law that operates through resemblance. Example: Diagrams in geometry as a type.", categories:"Third-First-First", cls:"" },
  { id:6,  label:"Rhematic Indexical Legisign", notation:"(3,2,1)", x:400, y:300, description:"A general type that indicates its object. Example: A demonstrative pronoun like 'this' or 'that'.", categories:"Third-Second-First", cls:"" },
  { id:7,  label:"Dicent Indexical Legisign",   notation:"(3,2,2)", x:550, y:370, description:"A general type that conveys information indexically. Example: A street cry, a weather report format.", categories:"Third-Second-Second", cls:"" },
  { id:8,  label:"Rhematic Symbol",             notation:"(3,3,1)", x:250, y:370, description:"A general law signifying through convention, interpreted as a possibility. Example: A common noun like 'horse'.", categories:"Third-Third-First", cls:"" },
  { id:9,  label:"Dicent Symbol",               notation:"(3,3,2)", x:400, y:440, description:"A general law signifying through convention, conveying information. Example: A proposition, 'The cat is on the mat'.", categories:"Third-Third-Second", cls:"" },
  { id:10, label:"Argument",                    notation:"(3,3,3)", x:400, y:510, description:"A sign that represents its object in its character as sign, a law governing interpretations. Example: A syllogism or scientific theory.", categories:"Pure Thirdness", cls:"thirdness" }
];

const edges = [
  [1,2],[1,3],[1,5],[2,5],[2,3],[3,4],[3,6],[4,7],[5,6],[5,8],[6,7],[6,8],[7,9],[8,9],[9,10]
];

let selectedId = null;
const nodeMap = {};
nodes.forEach(n => nodeMap[n.id] = n);

const lattice = document.getElementById('lattice');
const svg = document.getElementById('edgeSvg');

svg.innerHTML = '<defs>' +
  '<marker id="ah"   markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0,10 3,0 6" fill="#2d3d5a"/></marker>' +
  '<marker id="ah-a" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0,10 3,0 6" fill="#a78bfa"/></marker>' +
  '</defs>';

const edgeEls = edges.map(function(pair) {
  var f = pair[0], t = pair[1];
  var fn = nodeMap[f], tn = nodeMap[t];
  var line = document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('x1', fn.x); line.setAttribute('y1', fn.y);
  line.setAttribute('x2', tn.x); line.setAttribute('y2', tn.y);
  line.setAttribute('stroke', '#2d3d5a'); line.setAttribute('stroke-width', '2');
  line.setAttribute('marker-end', 'url(#ah)');
  line.style.transition = 'all .2s';
  svg.appendChild(line);
  return { from: f, to: t, el: line };
});

const nodeEls = {};
nodes.forEach(function(n) {
  var div = document.createElement('div');
  div.className = 'node' + (n.cls ? ' ' + n.cls : '');
  div.style.left = n.x + 'px';
  div.style.top  = n.y + 'px';
  div.innerHTML = '<div class="node-inner"><div class="label">' + n.label + '</div><div class="notation">' + n.notation + '</div></div>';
  div.onclick = function() { selectNode(selectedId === n.id ? null : n.id); };
  lattice.appendChild(div);
  nodeEls[n.id] = div;
});

function selectNode(id) {
  selectedId = id;
  var connEdges = id ? edgeEls.filter(function(e) { return e.from === id || e.to === id; }) : [];
  var connIds = new Set();
  if (id) {
    connIds.add(id);
    connEdges.forEach(function(e) { connIds.add(e.from); connIds.add(e.to); });
  }

  nodes.forEach(function(n) {
    var el = nodeEls[n.id];
    el.classList.toggle('selected', n.id === id);
    el.classList.toggle('dimmed', id !== null && !connIds.has(n.id));
    el.style.zIndex = n.id === id ? 10 : 2;
    if (n.id !== id) {
      el.classList.toggle('firstness', n.cls === 'firstness');
      el.classList.toggle('thirdness', n.cls === 'thirdness');
    }
  });

  edgeEls.forEach(function(e) {
    var hi = connEdges.indexOf(e) !== -1;
    e.el.setAttribute('stroke',        hi ? '#a78bfa' : '#2d3d5a');
    e.el.setAttribute('stroke-width',  hi ? '3'       : '2');
    e.el.setAttribute('stroke-opacity',id && !hi ? '0.18' : '1');
    e.el.setAttribute('marker-end',    hi ? 'url(#ah-a)' : 'url(#ah)');
  });

  var panel = document.getElementById('descPanel');
  if (id) {
    var n = nodeMap[id];
    document.getElementById('dpTitle').textContent = n.label;
    document.getElementById('dpSub').textContent   = n.notation + ' — ' + n.categories;
    document.getElementById('dpDesc').textContent  = n.description;
    document.getElementById('dpConn').textContent  = 'Connected to ' + connEdges.length + ' other sign class' + (connEdges.length !== 1 ? 'es' : '') + ' via presupposition';
    panel.classList.add('visible');
  } else {
    panel.classList.remove('visible');
  }
}

function toggleInfo() {
  var p = document.getElementById('infoPanel');
  p.style.display = p.style.display === 'none' ? '' : 'none';
}
</script>
</body>
</html>`;

async function main() {
  await prisma.app.upsert({
    where:  { id: "peirce-lattice" },
    update: { html: HTML },
    create: {
      id: "peirce-lattice", name: "Peirce Lattice", cat: "Knowledge · Semiotics",
      icon: "P", color: "violet", env: "live", url: "peirce.ada-labs.io",
      type: "lattice", desc: "Interactive lattice diagram of Peirce's ten classes of signs.",
      region: "us-east-1", uptime: "8d 14h", latency: "9ms", requests: "85/d", errors: "0%",
      log: JSON.stringify([
        ["10:22:01","load lattice model","info"],
        ["10:22:01","render 10 sign classes",""],
        ["10:22:02","compute lattice edges",""],
        ["10:22:02","interactive · ready","ok"],
      ]),
      sortOrder: 5, html: HTML,
    },
  });

  const app = await prisma.app.findUnique({ where: { id: "peirce-lattice" }, select: { html: true } });
  console.log("✓ peirce-lattice updated ·", app.html ? app.html.length + "b" : "NULL");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
