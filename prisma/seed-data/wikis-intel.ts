import { WikiDef } from "../../lib/types";
import { SeedWikiCard } from "./wikis";

export const SEED_WIKIS_INTEL: Record<string, WikiDef> = {

  'anthropic-research': {
    title: 'Anthropic Research',
    titleEm: 'Anthropic Research Intelligence Wiki',
    lede: "Tracking Claude model releases, capability benchmarks, and Dario Amodei's scaling thesis through the Claude Opus 4.x generation.",
    banner: 'research',
    crumb: 'Intel / Wikis / Anthropic',
    pages: 3, updated: 'Jun 14 2026', version: '1.0.0', visibility: 'workspace',
    pageList: [
      { id: 'overview',       name: 'Overview',        current: true },
      { id: 'claude-opus-4-7', name: 'Opus 4.7' },
      { id: 'claude-opus-4-8', name: 'Opus 4.8' },
      { id: 'sources',        name: 'Sources' },
    ],
    toc: [
      { id: 'overview',           name: 'Overview' },
      { id: 'claude-opus-4-7',    name: 'Claude Opus 4.7' },
      { id: 'project-glasswing',  name: 'Project Glasswing', sub: true },
      { id: 'claude-opus-4-8',    name: 'Claude Opus 4.8' },
      { id: 'dynamic-workflows',  name: 'Dynamic Workflows', sub: true },
      { id: 'fast-mode',          name: 'Fast Mode',          sub: true },
      { id: 'scaling-strategy',   name: 'Scaling Strategy' },
      { id: 'seven-ingredients',  name: 'Seven Ingredients',  sub: true },
      { id: 'revenue-trajectory', name: 'Revenue Trajectory', sub: true },
    ],
    sources: [
      { title: 'Introducing Claude Opus 4.7', meta: 'anthropic.com · Apr 16 2026' },
      { title: 'Introducing Claude Opus 4.8', meta: 'anthropic.com · May 28 2026' },
      { title: 'Dario Amodei: Scaling and the Path to AGI', meta: 'Dwarkesh Podcast · Feb 13 2026' },
    ],
    related: [
      { name: 'OpenAI Strategy',  ic: 'OA' },
      { name: 'xAI Intelligence', ic: 'XA' },
      { name: 'Google DeepMind',  ic: 'GD' },
    ],
    content: `
      <div class="wiki-banner-hero" data-c="research"></div>
      <div class="wiki-crumb">
        <span>Intel</span><span class="sep">/</span>
        <span>Wikis</span><span class="sep">/</span>
        <span class="ent">Anthropic</span>
      </div>
      <h1 class="wiki-h1">Anthropic <em>Research.</em></h1>
      <div class="wiki-lede">Tracking Claude model releases, capability benchmarks, and Dario Amodei's scaling thesis through the Claude Opus 4.x generation — verified from primary Anthropic sources.</div>

      <div class="wiki-meta-row">
        <div class="mr">Pages <span class="v">3</span></div>
        <div class="mr">Sources <span class="v">3</span></div>
        <div class="mr">Status <span class="v">Verified</span></div>
        <div class="mr">Updated <span class="v">Jun 14 2026</span></div>
        <div class="mr">Version <span class="v">v1.0.0</span></div>
      </div>

      <h2 id="overview">Overview</h2>
      <p>Anthropic's Claude 4 series entered 2026 with a rapid two-release cadence: Opus 4.7 launched April 16 and was superseded just six weeks later by Opus 4.8 on May 28. Both releases signal a strategic pivot toward agentic reliability — coding correctness, web-navigation accuracy, and large-scale parallel task execution — rather than raw benchmark maximization.</p>
      <p>Concurrently, Dario Amodei outlined Anthropic's scaling thesis in a February podcast, articulating a seven-ingredient framework for continued log-linear capability growth and positioning the company on a trajectory from $1B toward $5–10B in annual revenue.</p>

      <div class="callout insight">
        <div class="ct-label">Strategic Signal</div>
        <p>Both Opus 4.7 and 4.8 are framed around agentic trustworthiness — fewer code flaws, higher web-navigation accuracy — rather than GPT-competitive head-to-head benchmarks. Anthropic is differentiating on reliability, not just raw capability <a class="ref">[1]</a><a class="ref">[2]</a>.</p>
      </div>

      <h2 id="claude-opus-4-7">Claude Opus 4.7</h2>
      <p>Released April 16, 2026. Pricing: <strong>$5/M input · $25/M output tokens</strong>. The model delivered a <strong>13% coding lift</strong> on the GitHub Copilot benchmark and introduced Project Glasswing — Anthropic's new cyber-security safeguard framework for autonomous agents.</p>

      <h3 id="project-glasswing">Project Glasswing</h3>
      <p>Glasswing establishes guard-rails for Claude operating in autonomous pen-testing and offensive security research contexts. The framework restricts autonomous exploitation chains, requires human-in-the-loop confirmation for actions with real-world impact, and adds red-team provenance logging. It was Anthropic's direct response to growing enterprise demand for agentic Claude deployments in security operations <a class="ref">[1]</a>.</p>

      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead><tr><th>Metric</th><th>Value</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>Input price</td><td>$5 / M tokens</td><td></td></tr>
            <tr><td>Output price</td><td>$25 / M tokens</td><td></td></tr>
            <tr><td>GitHub Copilot benchmark</td><td>+13% lift</td><td>vs. prior generation</td></tr>
            <tr><td>Cyber safeguards</td><td>Project Glasswing</td><td>New in this release</td></tr>
            <tr><td>Active lifecycle</td><td>6 weeks</td><td>Superseded May 28 2026</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="claude-opus-4-8">Claude Opus 4.8</h2>
      <p>Released May 28, 2026. The Opus 4.8 release was framed under a reliability-and-honesty mandate: the model is approximately <strong>4× less likely to let code flaws pass</strong> without flagging them, and achieves <strong>84% on Mind2Web</strong> — a web-navigation benchmark testing autonomous browsing task completion across real websites <a class="ref">[2]</a>.</p>

      <h3 id="dynamic-workflows">Dynamic Workflows (Research Preview)</h3>
      <p>Opus 4.8 ships a research preview of <em>Dynamic Workflows</em> inside Claude Code — the ability to spawn hundreds of parallel subagents within a single session. Users issue a high-level directive; Claude Code automatically decomposes it, assigns subtasks to parallel worker agents, and synthesizes results. Anthropic positions this as the first step toward large-scale autonomous software engineering pipelines.</p>

      <h3 id="fast-mode">Fast Mode</h3>
      <p>Introduced alongside 4.8, Fast Mode delivers <strong>2.5× output speed</strong> at <strong>3× lower cost</strong> by routing lower-stakes token generation through an optimized inference path while keeping the full Opus 4.8 weights for reasoning steps. Toggled via the <code>/fast</code> command in Claude Code. Available on Opus 4.8, 4.7, and 4.6.</p>

      <h2 id="scaling-strategy">Scaling Strategy</h2>
      <p>Dario Amodei's February 2026 Dwarkesh podcast appearance outlined Anthropic's long-run thesis for continued capability growth. The core claim: both pre-training and reinforcement learning now exhibit <strong>log-linear scaling gains</strong> with compute — neither has hit a wall, and RL is now treated as a peer scaling dimension rather than a fine-tuning afterthought <a class="ref">[3]</a>.</p>

      <h3 id="seven-ingredients">Seven Ingredients</h3>
      <p>Amodei identified seven levers: <strong>(1) raw compute</strong>, <strong>(2) data quantity</strong>, <strong>(3) data quality</strong>, <strong>(4) training duration</strong>, <strong>(5) scalable objective function</strong>, <strong>(6) normalization and conditioning</strong>, <strong>(7) architectural efficiency</strong>. The insight is that these compound — improving any one lever unlocks additional headroom in the others.</p>

      <h3 id="revenue-trajectory">Revenue Trajectory</h3>
      <p>Amodei described Anthropic's revenue arc as: <strong>$0 → $100M → $1B → $5–10B</strong>. As of the February 2026 podcast the company was scaling toward the $5–10B band, driven primarily by API consumption from enterprise agentic deployments — not consumer products.</p>
    `,
  },

  'openai-strategy': {
    title: 'OpenAI Strategy',
    titleEm: 'OpenAI Strategy Intelligence Wiki',
    lede: 'GPT-5.5 release, the restructured Microsoft partnership, and OpenAI\'s three-pillar agentic strategy — verified from primary sources through April 2026.',
    banner: 'research',
    crumb: 'Intel / Wikis / OpenAI',
    pages: 3, updated: 'Jun 14 2026', version: '1.0.0', visibility: 'workspace',
    pageList: [
      { id: 'overview',              name: 'Overview',           current: true },
      { id: 'gpt-5-5',              name: 'GPT-5.5' },
      { id: 'microsoft-relationship', name: 'Microsoft' },
      { id: 'sources',               name: 'Sources' },
    ],
    toc: [
      { id: 'overview',              name: 'Overview' },
      { id: 'gpt-5-5',              name: 'GPT-5.5' },
      { id: 'bio-bug-bounty',        name: 'Bio Bug Bounty',     sub: true },
      { id: 'microsoft-relationship', name: 'Microsoft Relationship' },
      { id: 'license-restructure',   name: 'License Restructure', sub: true },
      { id: 'revenue-share',         name: 'Revenue Share',       sub: true },
      { id: 'strategy',              name: 'Strategy' },
      { id: 'agentic-everything',    name: 'Agentic Everything',  sub: true },
      { id: 'bedrock-managed',       name: 'Bedrock Managed',     sub: true },
    ],
    sources: [
      { title: 'Introducing GPT-5.5', meta: 'openai.com · Apr 23 2026' },
      { title: 'Microsoft & OpenAI: The Next Phase', meta: 'microsoft.com · Apr 27 2026' },
      { title: 'OpenAI and AWS Bedrock Managed Agents', meta: 'Stratechery · Apr 28 2026' },
    ],
    related: [
      { name: 'Anthropic Research', ic: 'AR' },
      { name: 'LangChain',          ic: 'LC' },
      { name: 'Meta AI',            ic: 'MT' },
    ],
    content: `
      <div class="wiki-banner-hero" data-c="research"></div>
      <div class="wiki-crumb">
        <span>Intel</span><span class="sep">/</span>
        <span>Wikis</span><span class="sep">/</span>
        <span class="ent">OpenAI</span>
      </div>
      <h1 class="wiki-h1">OpenAI <em>Strategy.</em></h1>
      <div class="wiki-lede">GPT-5.5 release, the restructured Microsoft partnership, and OpenAI's three-pillar agentic strategy — verified from primary sources through April 2026.</div>

      <div class="wiki-meta-row">
        <div class="mr">Pages <span class="v">3</span></div>
        <div class="mr">Sources <span class="v">3</span></div>
        <div class="mr">Status <span class="v">Verified</span></div>
        <div class="mr">Updated <span class="v">Jun 14 2026</span></div>
        <div class="mr">Version <span class="v">v1.0.0</span></div>
      </div>

      <h2 id="overview">Overview</h2>
      <p>April 2026 was a pivotal month for OpenAI: the company released GPT-5.5 (codename "Spud") with an agentic coding and computer-use focus, completed a major restructuring of its Microsoft partnership, and announced Bedrock Managed Agents — a direct distribution deal with AWS that marks the beginning of a multi-cloud strategy.</p>

      <div class="callout insight">
        <div class="ct-label">Structural Shift</div>
        <p>OpenAI is moving from "model provider" to "AI infrastructure layer." The Microsoft restructuring, multi-cloud licensing, and Bedrock Managed Agents all point to the same thesis: distribution beats exclusivity at this stage of the market <a class="ref">[2]</a><a class="ref">[3]</a>.</p>
      </div>

      <h2 id="gpt-5-5">GPT-5.5</h2>
      <p>Released April 23, 2026, codename <strong>"Spud."</strong> GPT-5.5 is the first model in the 5.x series to lead with agentic capabilities rather than pure reasoning. Key specs: <strong>$5/M input · $30/M output · 1M token context window</strong> · 82.7% on Terminal-Bench (agentic coding) <a class="ref">[1]</a>.</p>
      <p>The model bundles computer use as a first-class capability — not a separate API surface — and positions Codex-pattern agentic coding as the primary enterprise use case. OpenAI explicitly benchmarks against Claude Code, citing Terminal-Bench as the shared measurement surface.</p>

      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead><tr><th>Metric</th><th>Value</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>Codename</td><td>Spud</td><td>Internal</td></tr>
            <tr><td>Input price</td><td>$5 / M tokens</td><td></td></tr>
            <tr><td>Output price</td><td>$30 / M tokens</td><td>$5 premium vs. Anthropic Opus 4.8</td></tr>
            <tr><td>Context window</td><td>1 M tokens</td><td></td></tr>
            <tr><td>Terminal-Bench</td><td>82.7%</td><td>Agentic coding benchmark</td></tr>
            <tr><td>Computer use</td><td>Native</td><td>Bundled, not a separate API</td></tr>
          </tbody>
        </table>
      </div>

      <h3 id="bio-bug-bounty">Bio Bug Bounty</h3>
      <p>GPT-5.5 launched alongside OpenAI's <em>Bio Bug Bounty</em> program — researchers who discover ways the model can be exploited for biological threat uplift are eligible for payouts up to <strong>$25,000</strong>. OpenAI framed this as a proactive safety measure ahead of anticipated NIST guidelines on frontier-model bio risk.</p>

      <h2 id="microsoft-relationship">Microsoft Relationship</h2>
      <p>On April 27, 2026 — four days after GPT-5.5 launched — Microsoft and OpenAI jointly announced a restructured partnership that fundamentally changes the original 2019 terms.</p>

      <h3 id="license-restructure">License Restructure</h3>
      <p>The revised agreement converts what was an exclusive arrangement to a <strong>non-exclusive license through 2032</strong>. Azure retains preferred-partner status with access guarantees, but OpenAI is now free to deploy models on competing clouds — Google Cloud, AWS, and others. The AGI clause, which would have transferred ownership of certain model weights to OpenAI upon AGI declaration, was <strong>removed entirely</strong> <a class="ref">[2]</a>.</p>

      <h3 id="revenue-share">Revenue Share</h3>
      <p>Microsoft's obligation to pay a revenue share to OpenAI on Azure AI products was eliminated as part of the restructure. In exchange, <strong>OpenAI's revenue share payments to Microsoft</strong> — which flow from OpenAI's own API and ChatGPT revenue — continue through 2030, subject to a cap. The net effect: Microsoft gets predictable payments from OpenAI while reducing its own exposure; OpenAI gains distribution freedom.</p>

      <h2 id="strategy">Strategy</h2>
      <p>Ben Garman (OpenAI's Head of GTM) outlined a three-pillar strategy in the Stratechery interview on April 28 <a class="ref">[3]</a>:</p>

      <h3 id="agentic-everything">Agentic Everything</h3>
      <p>OpenAI's internal north star is <em>Codex pattern</em> at scale — agentic loops where models are given goals, tools, and execution environments rather than prompts. GPT-5.5 is the first model designed from the ground up for this pattern. The company is moving ChatGPT toward persistent agent capabilities throughout 2026.</p>

      <h3 id="bedrock-managed">Bedrock Managed Agents</h3>
      <p>The AWS partnership announced on April 28 makes GPT-5.5 available as a first-class option inside Amazon Bedrock's Managed Agents product. This gives OpenAI access to AWS's enterprise customer base without requiring customers to leave their existing cloud infrastructure. It is OpenAI's first major non-Azure distribution channel and a direct signal that multi-cloud is now strategy, not exception.</p>
    `,
  },

  'langchain': {
    title: 'LangChain',
    titleEm: 'LangChain Intelligence Wiki',
    lede: 'LangGraph 1.0 GA, the LangSmith Fleet rebrand, and Harrison Chase\'s long-horizon agent thesis — verified from primary sources through March 2026.',
    banner: 'research',
    crumb: 'Intel / Wikis / LangChain',
    pages: 3, updated: 'Jun 14 2026', version: '1.0.0', visibility: 'workspace',
    pageList: [
      { id: 'overview',            name: 'Overview',     current: true },
      { id: 'langgraph',           name: 'LangGraph' },
      { id: 'langsmith-fleet',     name: 'LangSmith Fleet' },
      { id: 'sources',             name: 'Sources' },
    ],
    toc: [
      { id: 'overview',             name: 'Overview' },
      { id: 'langgraph',            name: 'LangGraph 1.0' },
      { id: 'langgraph-users',      name: 'Production Users',  sub: true },
      { id: 'langgraph-1-1',        name: 'v1.1 Update',       sub: true },
      { id: 'langsmith-fleet',      name: 'LangSmith Fleet' },
      { id: 'fleet-components',     name: 'Fleet Components',  sub: true },
      { id: 'long-horizon-agents',  name: 'Long-Horizon Agents' },
      { id: 'chase-stack',          name: 'Chase Stack',       sub: true },
      { id: 'context-engineering',  name: 'Context Engineering', sub: true },
    ],
    sources: [
      { title: 'LangGraph 1.0 Generally Available', meta: 'blog.langchain.dev · Oct 29 2025' },
      { title: 'Harrison Chase: The Agent Harness', meta: 'Sequoia Training Data Podcast ep. 77 · Jan 22 2026' },
      { title: 'LangChain March 2026 Newsletter', meta: 'langchain.com · Mar 2026' },
    ],
    related: [
      { name: 'Anthropic Research', ic: 'AR' },
      { name: 'OpenAI Strategy',    ic: 'OA' },
      { name: 'xAI Intelligence',   ic: 'XA' },
    ],
    content: `
      <div class="wiki-banner-hero" data-c="research"></div>
      <div class="wiki-crumb">
        <span>Intel</span><span class="sep">/</span>
        <span>Wikis</span><span class="sep">/</span>
        <span class="ent">LangChain</span>
      </div>
      <h1 class="wiki-h1">LangChain <em>Intelligence.</em></h1>
      <div class="wiki-lede">LangGraph 1.0 GA, the LangSmith Fleet rebrand, and Harrison Chase's long-horizon agent thesis — verified from primary sources through March 2026.</div>

      <div class="wiki-meta-row">
        <div class="mr">Pages <span class="v">3</span></div>
        <div class="mr">Sources <span class="v">3</span></div>
        <div class="mr">Status <span class="v">Verified</span></div>
        <div class="mr">Updated <span class="v">Jun 14 2026</span></div>
        <div class="mr">Version <span class="v">v1.0.0</span></div>
      </div>

      <h2 id="overview">Overview</h2>
      <p>LangChain entered 2026 with its product strategy crystallized around two surfaces: <strong>LangGraph</strong> (the stateful agent orchestration layer) and <strong>LangSmith Fleet</strong> (the enterprise management plane renamed from Agent Builder). Harrison Chase's public thesis, articulated in January 2026, positions LangChain not as a model company but as an <em>agent harness</em> — the infrastructure between model APIs and production systems.</p>

      <div class="callout insight">
        <div class="ct-label">Positioning Insight</div>
        <p>Chase frames LangChain's moat as <em>traces, not code</em>. LangSmith's observability layer accumulates execution traces that become the source of truth for debugging, fine-tuning, and policy enforcement — a data flywheel that compounds with production usage <a class="ref">[2]</a>.</p>
      </div>

      <h2 id="langgraph">LangGraph 1.0</h2>
      <p>LangGraph 1.0 reached general availability on October 29, 2025. The GA release formalized <strong>durable state persistence</strong> as the core primitive — agent state is checkpointed to a backing store after each node execution, enabling long-running workflows to survive failures, resume from arbitrary points, and run across distributed compute <a class="ref">[1]</a>.</p>

      <h3 id="langgraph-users">Production Users</h3>
      <p>Three enterprise customers were using LangGraph in production before the GA announcement: <strong>Uber</strong> (customer support routing), <strong>LinkedIn</strong> (recruiter workflow automation), and <strong>Klarna</strong> (financial decision pipelines). These pre-GA production deployments were cited by LangChain as evidence that the 1.0 stability guarantee was grounded in real-world load.</p>

      <h3 id="langgraph-1-1">v1.1 Update (March 2026)</h3>
      <p>LangGraph 1.1 shipped in March 2026 with two major additions: <strong>type-safe streaming</strong> — structured output at each graph node is now typed end-to-end with TypeScript/Python generics — and <strong>Pydantic coercion</strong> for input/output schemas, eliminating the ad-hoc validation boilerplate that made early LangGraph pipelines brittle <a class="ref">[3]</a>.</p>

      <h2 id="langsmith-fleet">LangSmith Fleet</h2>
      <p>In March 2026, LangChain renamed its <em>Agent Builder</em> product to <strong>LangSmith Fleet</strong>. The rename signals a shift from single-agent authoring to multi-agent fleet management — matching the operational model of enterprises deploying hundreds of specialized agents across departments.</p>

      <h3 id="fleet-components">Fleet Components</h3>
      <p>LangSmith Fleet ships six integrated surfaces <a class="ref">[3]</a>:</p>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead><tr><th>Component</th><th>Function</th></tr></thead>
          <tbody>
            <tr><td><strong>Fleet</strong></td><td>Multi-agent dashboard — deploy, monitor, version, and rollback agents</td></tr>
            <tr><td><strong>Skills</strong></td><td>Reusable capability modules shared across agents in the fleet</td></tr>
            <tr><td><strong>Sandboxes</strong></td><td>Isolated execution environments for testing agent changes before production</td></tr>
            <tr><td><strong>Deploy CLI</strong></td><td>CI/CD integration for agent promotion pipelines</td></tr>
            <tr><td><strong>ABAC</strong></td><td>Attribute-based access control — who can invoke which agents with which tools</td></tr>
            <tr><td><strong>Audit Logs</strong></td><td>Immutable execution trace store for compliance and forensic review</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="long-horizon-agents">Long-Horizon Agents</h2>
      <p>Chase's January 2026 Sequoia podcast articulated where long-horizon agents are succeeding in production and what structural factors make them work <a class="ref">[2]</a>.</p>

      <h3 id="chase-stack">The Chase Stack</h3>
      <p>Chase's mental model: <strong>model → framework → harness</strong>. The model provides raw capability; the framework (LangGraph) provides orchestration primitives; the harness (LangSmith) provides observability, evaluation, and deployment. He argues that enterprises that skip the harness layer end up unable to improve their agents systematically because they have no reliable signal on what's failing.</p>
      <p>Active domains where long-horizon agents are working in 2026: <strong>software engineering</strong>, <strong>AI SRE</strong> (site reliability), <strong>research synthesis</strong>, and <strong>customer support resolution</strong>. Each domain shares a trait: tasks are decomposable into parallelizable subtasks with verifiable intermediate outputs.</p>

      <h3 id="context-engineering">Context Engineering</h3>
      <p>Chase identified <strong>context engineering</strong> — the practice of precisely controlling what information appears in an agent's context window at each step — as the primary determinant of long-horizon agent performance in 2025. Prompt engineering moved from "what to say" to "what to include and exclude." <strong>Persistent memory</strong> (cross-session state) is the next moat: teams that solve it will have agents that improve from each deployment rather than resetting to baseline on each run.</p>
    `,
  },

  'xai': {
    title: 'xAI Intelligence',
    titleEm: 'xAI Intelligence Wiki',
    lede: 'Grok model lineage, Colossus compute infrastructure, and xAI\'s scaling roadmap toward Grok 5 — verified from primary sources with one open investigation.',
    banner: 'research',
    crumb: 'Intel / Wikis / xAI',
    pages: 3, updated: 'Jun 14 2026', version: '1.0.0', visibility: 'workspace',
    pageList: [
      { id: 'overview',            name: 'Overview',      current: true },
      { id: 'grok-models',         name: 'Grok Models' },
      { id: 'compute-and-colossus', name: 'Colossus' },
      { id: 'sources',             name: 'Sources' },
    ],
    toc: [
      { id: 'overview',          name: 'Overview' },
      { id: 'grok-models',       name: 'Grok Model Lineage' },
      { id: 'grok-4',            name: 'Grok 4',          sub: true },
      { id: 'grok-roadmap',      name: 'Model Roadmap',   sub: true },
      { id: 'compute-colossus',  name: 'Compute & Colossus' },
      { id: 'colossus-1',        name: 'Colossus 1',      sub: true },
      { id: 'colossus-2',        name: 'Colossus 2',      sub: true },
      { id: 'scaling-roadmap',   name: 'Scaling Roadmap' },
      { id: 'spacex-caveat',     name: 'SpaceX Claim ⚠️', sub: true },
    ],
    sources: [
      { title: 'Grok 4 Announcement', meta: 'x.ai · Jul 9 2025' },
      { title: 'xAI News Index', meta: 'x.ai/news · 2025–2026' },
      { title: 'Musk X Posts Aggregator', meta: 'Secondary source · 2025–2026' },
    ],
    related: [
      { name: 'Anthropic Research', ic: 'AR' },
      { name: 'Google DeepMind',    ic: 'GD' },
      { name: 'Meta AI',            ic: 'MT' },
    ],
    content: `
      <div class="wiki-banner-hero" data-c="research"></div>
      <div class="wiki-crumb">
        <span>Intel</span><span class="sep">/</span>
        <span>Wikis</span><span class="sep">/</span>
        <span class="ent">xAI</span>
      </div>
      <h1 class="wiki-h1">xAI <em>Intelligence.</em></h1>
      <div class="wiki-lede">Grok model lineage, Colossus compute infrastructure, and xAI's scaling roadmap toward Grok 5 — verified from primary sources with one open investigation flagged below.</div>

      <div class="wiki-meta-row">
        <div class="mr">Pages <span class="v">3</span></div>
        <div class="mr">Sources <span class="v">3</span></div>
        <div class="mr">Status <span class="v">Verified*</span></div>
        <div class="mr">Updated <span class="v">Jun 14 2026</span></div>
        <div class="mr">Version <span class="v">v1.0.0</span></div>
      </div>

      <h2 id="overview">Overview</h2>
      <p>xAI has pursued an aggressive model cadence since Grok-1's open release in March 2024, reaching Grok 4 in July 2025 and releasing silent updates (4.2, 4.3 Beta) through early 2026. The company's differentiating bet is vertical integration: own the compute (Colossus), own the distribution (X/Twitter's 600M+ users), and train at scale on proprietary real-time data.</p>
      <p>One claim in the research base — a SpaceX-xAI acquisition — could not be verified against primary sources and is flagged explicitly below.</p>

      <h2 id="grok-models">Grok Model Lineage</h2>
      <p>xAI's model family spans three years and multiple architectural generations, from Grok-1's open Apache-2.0 release through the closed Grok 4 Heavy <a class="ref">[1]</a>:</p>

      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead><tr><th>Model</th><th>Date</th><th>Key Facts</th></tr></thead>
          <tbody>
            <tr><td>Grok-1</td><td>Nov 2023</td><td>314B MoE, Apache-2.0 open weights</td></tr>
            <tr><td>Grok-1.5 / 1.5V</td><td>Mar 2024</td><td>Vision added</td></tr>
            <tr><td>Grok-2</td><td>Aug 2024</td><td>Full multimodal, Aurora image gen</td></tr>
            <tr><td>Grok-3 / 3 Reasoning</td><td>Feb 2025</td><td>First reasoning variant (chain-of-thought)</td></tr>
            <tr><td><strong>Grok-4</strong></td><td><strong>Jul 9 2025</strong></td><td>256K ctx · 6× efficiency · native tools</td></tr>
            <tr><td>Grok-4 Heavy</td><td>Jul 2025</td><td>50.7% HLE text-only · 61.9% USAMO 2025</td></tr>
            <tr><td>Grok-4.1 / 4.1 Fast</td><td>Sep 2025</td><td>Speed tier added</td></tr>
            <tr><td>Grok-4.2</td><td>Nov 2025</td><td>~500B params; "missing training data" note</td></tr>
            <tr><td>Grok-4.3 Beta</td><td>Apr 17 2026</td><td>Silent release; SuperGrok Heavy only ($300/mo)</td></tr>
            <tr><td>grok-code-fast-1</td><td>2026</td><td>Specialized coding variant</td></tr>
          </tbody>
        </table>
      </div>

      <h3 id="grok-4">Grok 4</h3>
      <p>Grok 4's July 9, 2025 release was xAI's most significant to date. The model achieved <strong>6× inference efficiency</strong> over Grok-3 and introduced a <strong>256K token context window</strong> with native tool use built into the base model (not a separate API layer). Grok-4 Heavy reached <strong>50.7% on HLE</strong> (Humanity's Last Exam, text-only) and <strong>61.9% on USAMO 2025</strong>, placing it at the frontier for mathematical reasoning <a class="ref">[1]</a>.</p>

      <h3 id="grok-roadmap">Model Roadmap</h3>
      <p>Based on xAI's stated roadmap and compute investments, planned models include: <strong>Grok 4.4</strong> (~1T parameters), <strong>Grok 4.5</strong> (~1.5T parameters), and <strong>Grok 5</strong> (6T–10T parameters range). xAI runs approximately 7 models in parallel training at any given time on Colossus infrastructure <a class="ref">[2]</a>.</p>

      <h2 id="compute-colossus">Compute &amp; Colossus</h2>
      <p>xAI's vertical compute strategy is the structural foundation of its scaling thesis. Unlike Anthropic and OpenAI, which rent compute from hyperscalers, xAI owns its training infrastructure outright.</p>

      <h3 id="colossus-1">Colossus 1</h3>
      <p>Located in Memphis, Tennessee. <strong>200,000 NVIDIA H100 GPUs</strong>. Became operational in 2024 and trained Grok-3 and Grok-4. The Memphis facility was notable for its build speed — from site selection to training-capable cluster in under six months.</p>

      <h3 id="colossus-2">Colossus 2</h3>
      <p>A second cluster, estimated at <strong>~300,000 H100 + B200 GPUs</strong>, with a power envelope of approximately <strong>1.5 GW</strong>. Colossus 2 is the planned training substrate for Grok 5 <a class="ref">[2]</a>.</p>

      <h2 id="scaling-roadmap">Scaling Roadmap</h2>
      <p>xAI's long-run bet: own compute, own distribution (X's user base), and train on proprietary real-time signal (X posts, real-time web) that closed competitors cannot access. The roadmap toward Grok 5 (6T–10T parameters) is predicated on Colossus 2 coming online at full capacity.</p>

      <h3 id="spacex-caveat">⚠️ SpaceX-xAI Acquisition — Unverified Claim</h3>
      <div class="callout insight">
        <div class="ct-label">⚠️ Open Investigation</div>
        <p>One secondary source (chatlyai.app) reported a SpaceX acquisition of xAI. <strong>This claim could not be verified against any primary source</strong> — no xAI press release, no SpaceX announcement, no SEC filing. It is listed here as an open investigation, not as fact. Do not act on this claim without independent primary-source verification <a class="ref">[3]</a>.</p>
      </div>
    `,
  },

  'google-deepmind': {
    title: 'Google DeepMind',
    titleEm: 'Google DeepMind Intelligence Wiki',
    lede: 'Gemini model family, DeepMind\'s scientific applications portfolio, and the Google Brain merger — training-baseline content from Claude\'s mid-2025 training data.',
    banner: 'research',
    crumb: 'Intel / Wikis / Google DeepMind',
    pages: 3, updated: 'Jun 14 2026', version: '1.0.0', visibility: 'workspace',
    pageList: [
      { id: 'overview',               name: 'Overview',           current: true },
      { id: 'gemini-model-family',     name: 'Gemini Models' },
      { id: 'scientific-applications', name: 'Science Portfolio' },
      { id: 'sources',                 name: 'Sources' },
    ],
    toc: [
      { id: 'overview',               name: 'Overview' },
      { id: 'gemini-model-family',     name: 'Gemini Model Family' },
      { id: 'gemini-lineage',          name: 'Model Lineage',      sub: true },
      { id: 'scientific-applications', name: 'Scientific Applications' },
      { id: 'protein-and-materials',   name: 'Protein & Materials', sub: true },
      { id: 'math-and-science',        name: 'Math & Science',      sub: true },
      { id: 'structure-and-parent',    name: 'Structure & Parent' },
      { id: 'leadership',              name: 'Leadership',          sub: true },
      { id: 'compute-and-cloud',       name: 'Compute & Cloud',     sub: true },
    ],
    sources: [
      { title: 'Gemini Model Family (Training Baseline)', meta: 'Claude training data · through mid-2025' },
      { title: 'DeepMind Scientific Applications (Training Baseline)', meta: 'Claude training data · through mid-2025' },
      { title: 'Google DeepMind Structure & Parent (Training Baseline)', meta: 'Claude training data · through mid-2025' },
    ],
    related: [
      { name: 'Anthropic Research', ic: 'AR' },
      { name: 'OpenAI Strategy',    ic: 'OA' },
      { name: 'xAI Intelligence',   ic: 'XA' },
    ],
    content: `
      <div class="wiki-banner-hero" data-c="research"></div>
      <div class="wiki-crumb">
        <span>Intel</span><span class="sep">/</span>
        <span>Wikis</span><span class="sep">/</span>
        <span class="ent">Google DeepMind</span>
      </div>
      <h1 class="wiki-h1">Google <em>DeepMind.</em></h1>
      <div class="wiki-lede">Gemini model family, DeepMind's scientific applications portfolio, and the Google Brain merger — training-baseline content pending web verification.</div>

      <div class="wiki-meta-row">
        <div class="mr">Pages <span class="v">3</span></div>
        <div class="mr">Sources <span class="v">3</span></div>
        <div class="mr">Status <span class="v">⚠️ Training-Baseline</span></div>
        <div class="mr">Updated <span class="v">Jun 14 2026</span></div>
        <div class="mr">Version <span class="v">1.0.0-tb</span></div>
      </div>

      <div class="callout insight">
        <div class="ct-label">⚠️ Training-Baseline Content</div>
        <p>All pages in this wiki are derived from Claude's training data through approximately mid-2025. Facts about recent model releases, benchmarks, organizational changes, or financial figures may be outdated. Treat as historical baseline — verify current state from primary sources before acting on any claim.</p>
      </div>

      <h2 id="overview">Overview</h2>
      <p>Google DeepMind is the consolidated AI research and product organization formed by the April 2023 merger of Google Brain and DeepMind. Led by Demis Hassabis, the organization operates as Alphabet's primary AI R&amp;D arm and is responsible for the Gemini model family, TPU hardware, Vertex AI enterprise platform, and a portfolio of scientific AI systems that includes Nobel-winning work on protein structure prediction.</p>

      <h2 id="gemini-model-family">Gemini Model Family</h2>
      <p>Gemini is Google DeepMind's frontier model family, spanning Ultra, Pro, Flash, and Nano tiers. The series replaced the PaLM 2 generation and introduced multimodal capabilities — text, image, audio, and video — as native inputs across the entire range <a class="ref">[1]</a>.</p>

      <h3 id="gemini-lineage">Model Lineage</h3>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead><tr><th>Model</th><th>Date</th><th>Key Facts</th></tr></thead>
          <tbody>
            <tr><td>Gemini 1.0 Ultra/Pro/Nano</td><td>Dec 2023</td><td>First multimodal family; Ultra exceeded GPT-4 on MMLU</td></tr>
            <tr><td>Gemini 1.5 Pro</td><td>Feb 2024</td><td>1M token context · Mixture-of-Experts architecture</td></tr>
            <tr><td>Gemini 1.5 Flash</td><td>May 2024</td><td>Efficiency tier; 1M ctx retained</td></tr>
            <tr><td>Gemini 2.0 Flash</td><td>Dec 2024</td><td>Multimodal Live API; real-time audio/video</td></tr>
            <tr><td>Gemini 2.0 Pro Experimental</td><td>Feb 2025</td><td>Coding and agentic focus</td></tr>
            <tr><td>Gemini 2.5 Pro</td><td>Mar 2025</td><td>Thinking model; extended reasoning chains</td></tr>
            <tr><td>Gemini 2.5 Flash</td><td>Apr 2025</td><td>Speed-optimized thinking variant</td></tr>
          </tbody>
        </table>
      </div>
      <p>The 1.5 Pro's 1M-token context window was the first at commercial scale and remains a structural advantage for document-heavy enterprise use cases. Gemini 2.5 Pro's thinking capability places it in direct competition with OpenAI o-series and Anthropic's extended-thinking models.</p>

      <h2 id="scientific-applications">Scientific Applications</h2>
      <p>DeepMind's scientific AI portfolio spans structural biology, materials science, mathematical reasoning, and climate modeling. Several systems have been published in top-tier journals and one has received Nobel recognition <a class="ref">[2]</a>.</p>

      <h3 id="protein-and-materials">Protein &amp; Materials</h3>
      <p><strong>AlphaFold 3</strong> (2024): Demis Hassabis and John Jumper were awarded the 2024 Nobel Prize in Chemistry for AlphaFold's contributions to protein structure prediction. AlphaFold 3 extended the system beyond proteins to DNA, RNA, and small molecules, enabling drug-target interaction modeling at scale.</p>
      <p><strong>GNoME</strong> (<em>Nature</em>, Nov 2023): Graph Networks for Materials Exploration discovered 2.2 million new crystal structures, expanding the known stable inorganic crystal database by roughly 40×. ~380,000 structures were experimentally validated by partner labs.</p>
      <p><strong>AlphaMissense</strong> (<em>Science</em>, 2023): Classified 89 million missense variants across the human proteome, assigning pathogenicity scores to variants previously of unknown significance in clinical genetics.</p>

      <h3 id="math-and-science">Math &amp; Science</h3>
      <p><strong>AlphaGeometry</strong> (<em>Nature</em>, Jan 2024): Solved 25 of 30 International Mathematical Olympiad geometry problems — matching the median IMO gold medalist performance. The system combines a symbolic deduction engine with a neural theorem suggester trained on synthetic geometry proofs.</p>
      <p><strong>FunSearch</strong> (<em>Nature</em>, 2023): Used LLM-guided evolutionary search to discover new mathematical functions, including improvements to open combinatorics problems (cap set problem).</p>
      <p><strong>GraphCast</strong> (<em>Science</em>, 2023): 10-day weather forecast at 0.25° resolution in under 60 seconds — outperforming ECMWF operational forecasts on most metrics.</p>
      <p><strong>Chinchilla</strong> (NeurIPS 2022): The compute-optimal scaling paper. Showed that Gopher-class models were overtrained on too few tokens relative to compute budget, establishing the Chinchilla scaling law that informed subsequent generations across the industry.</p>

      <h2 id="structure-and-parent">Structure &amp; Parent</h2>
      <p>Google Brain and DeepMind merged in April 2023 to form Google DeepMind. The consolidated organization reports to Google CEO Sundar Pichai and operates as a distinct unit within Alphabet <a class="ref">[3]</a>.</p>

      <h3 id="leadership">Leadership</h3>
      <p><strong>Demis Hassabis</strong> — CEO, Google DeepMind. Nobel laureate 2024 (Chemistry). Leads research strategy and chairs the safety council. <strong>Lila Ibrahim</strong> — COO. Responsible for productization and enterprise partnerships. <strong>Koray Kavukcuoglu</strong> — CTO. Former VP of Research at DeepMind; leads architecture and systems research.</p>

      <h3 id="compute-and-cloud">Compute &amp; Cloud</h3>
      <p>Google's TPU program (v1 through v6 "Trillium") gives DeepMind a hardware advantage: TPU v6 Trillium offers ~4.7× the compute per chip of v5e at roughly equivalent cost, enabling larger training runs than equivalently-priced GPU clusters. Alphabet committed <strong>$50B+ in 2024 capex</strong> — the largest single-year AI infrastructure spend at the time. Enterprise model access routes through <strong>Vertex AI</strong> (Google Cloud's AI platform); Google Cloud holds approximately the #3 position in cloud market share behind AWS and Azure.</p>
    `,
  },

  'meta': {
    title: 'Meta AI',
    titleEm: 'Meta AI Intelligence Wiki',
    lede: 'The Llama open-weight family, Meta\'s strategic rationale for open weights, and Yann LeCun\'s world-model thesis — training-baseline content from Claude\'s mid-2025 training data.',
    banner: 'research',
    crumb: 'Intel / Wikis / Meta',
    pages: 3, updated: 'Jun 14 2026', version: '1.0.0', visibility: 'workspace',
    pageList: [
      { id: 'overview',           name: 'Overview',         current: true },
      { id: 'llama-family',       name: 'Llama Family' },
      { id: 'open-weight-strategy', name: 'Open-Weight Strategy' },
      { id: 'sources',            name: 'Sources' },
    ],
    toc: [
      { id: 'overview',            name: 'Overview' },
      { id: 'llama-family',        name: 'Llama Family' },
      { id: 'llama-lineage',       name: 'Model Lineage',     sub: true },
      { id: 'llama-3-1',           name: 'Llama 3.1 Frontier', sub: true },
      { id: 'open-weight-strategy', name: 'Open-Weight Strategy' },
      { id: 'zuckerberg-rationale', name: 'Zuckerberg Rationale', sub: true },
      { id: 'scale-and-reach',     name: 'Scale & Reach',     sub: true },
      { id: 'fair-and-lecun',      name: 'FAIR & LeCun' },
      { id: 'world-model-thesis',  name: 'World-Model Thesis', sub: true },
      { id: 'jepa',                name: 'JEPA',               sub: true },
    ],
    sources: [
      { title: 'Llama Model Family (Training Baseline)', meta: 'Claude training data · through mid-2025' },
      { title: 'Meta Open-Weight Strategy (Training Baseline)', meta: 'Claude training data · through mid-2025' },
      { title: 'FAIR and LeCun Research (Training Baseline)', meta: 'Claude training data · through mid-2025' },
    ],
    related: [
      { name: 'OpenAI Strategy',    ic: 'OA' },
      { name: 'Google DeepMind',    ic: 'GD' },
      { name: 'LangChain',          ic: 'LC' },
    ],
    content: `
      <div class="wiki-banner-hero" data-c="research"></div>
      <div class="wiki-crumb">
        <span>Intel</span><span class="sep">/</span>
        <span>Wikis</span><span class="sep">/</span>
        <span class="ent">Meta AI</span>
      </div>
      <h1 class="wiki-h1">Meta <em>AI.</em></h1>
      <div class="wiki-lede">The Llama open-weight family, Meta's strategic rationale for open weights, and Yann LeCun's world-model thesis — training-baseline content pending web verification.</div>

      <div class="wiki-meta-row">
        <div class="mr">Pages <span class="v">3</span></div>
        <div class="mr">Sources <span class="v">3</span></div>
        <div class="mr">Status <span class="v">⚠️ Training-Baseline</span></div>
        <div class="mr">Updated <span class="v">Jun 14 2026</span></div>
        <div class="mr">Version <span class="v">1.0.0-tb</span></div>
      </div>

      <div class="callout insight">
        <div class="ct-label">⚠️ Training-Baseline Content</div>
        <p>All pages in this wiki are derived from Claude's training data through approximately mid-2025. Facts about recent model releases, benchmarks, organizational changes, or financial figures may be outdated. Treat as historical baseline — verify current state from primary sources before acting on any claim.</p>
      </div>

      <h2 id="overview">Overview</h2>
      <p>Meta's AI strategy is built on a structural bet: that releasing frontier models as open weights creates more long-run value than keeping them closed. The Llama family is the execution arm of that bet. FAIR (Fundamental AI Research) under Yann LeCun is the research arm, pursuing a fundamentally different architecture thesis — world models via JEPA — that diverges from the transformer-autoregressive paradigm.</p>
      <p>Meta's distribution advantage is singular: <strong>3B+ monthly active users</strong> across Facebook, Instagram, WhatsApp, and Messenger, versus ChatGPT's ~200M weekly active users. This gives Meta AI (the consumer product) a reach that no other AI lab can match organically.</p>

      <h2 id="llama-family">Llama Family</h2>
      <p>Llama is Meta's openly-released language model family, spanning research-only to commercially-licensed to Apache-licensed weights, from 7B to 405B parameters <a class="ref">[1]</a>.</p>

      <h3 id="llama-lineage">Model Lineage</h3>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead><tr><th>Model</th><th>Date</th><th>Key Facts</th></tr></thead>
          <tbody>
            <tr><td>Llama 1</td><td>Feb 2023</td><td>7B–65B · Research-only license · Weights leaked within days</td></tr>
            <tr><td>Llama 2</td><td>Jul 2023</td><td>Commercial license · MAU cap · Microsoft partnership</td></tr>
            <tr><td>Llama 3</td><td>Apr 2024</td><td>8B/70B · 8K context · Strong coding benchmark gains</td></tr>
            <tr><td><strong>Llama 3.1</strong></td><td><strong>Jul 2024</strong></td><td>8B/70B/405B · 128K ctx · First credible open-weight GPT-4 competitor</td></tr>
            <tr><td>Llama 3.2</td><td>Sep 2024</td><td>Multimodal vision · 1B/3B edge variants</td></tr>
            <tr><td>Llama 3.3</td><td>Dec 2024</td><td>70B model reaching 405B-quality on key benchmarks</td></tr>
            <tr><td>Llama 4</td><td>Unverified</td><td>No confirmed release as of training baseline</td></tr>
          </tbody>
        </table>
      </div>

      <h3 id="llama-3-1">Llama 3.1 Frontier</h3>
      <p>Llama 3.1 405B was the first open-weight model to credibly compete with GPT-4 class systems on standard benchmarks: <strong>MMLU 88.6%</strong>, <strong>MATH 73.8%</strong>, <strong>HumanEval 89.0%</strong>. The 128K context window matched closed competitors. More significantly, the 8B and 70B variants exceeded prior closed models of comparable size, demonstrating that Meta's open-weight training efficiency had caught up to frontier closed models at smaller scales <a class="ref">[1]</a>.</p>
      <p>The commercial license permits use by any organization with fewer than 700M monthly active users — effectively a ceiling designed to exclude only the largest platforms (Google, Microsoft) while enabling the rest of the ecosystem.</p>

      <h2 id="open-weight-strategy">Open-Weight Strategy</h2>
      <p>Mark Zuckerberg publicly articulated a four-point rationale for Meta's open-weight approach in 2024, which has since become the canonical framing cited by Meta executives <a class="ref">[2]</a>:</p>

      <h3 id="zuckerberg-rationale">Zuckerberg's Four Points</h3>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead><tr><th>Pillar</th><th>Rationale</th></tr></thead>
          <tbody>
            <tr><td><strong>Ecosystem Growth</strong></td><td>Open weights drive a community of researchers, fine-tuners, and tool builders who improve the models and extend Meta's reach without direct investment</td></tr>
            <tr><td><strong>Reduce Vendor Lock-In</strong></td><td>Meta's own AI infrastructure doesn't depend on OpenAI or Google; open weights give the company a forever-available fallback</td></tr>
            <tr><td><strong>Trust &amp; Policy</strong></td><td>Open models are inspectable; this positions Meta favorably with regulators and researchers skeptical of black-box AI</td></tr>
            <tr><td><strong>No Direct AI Revenue Required</strong></td><td>Meta's business model is advertising — AI improves ad targeting and engagement, but Meta does not need to sell model API access to justify the R&amp;D spend</td></tr>
          </tbody>
        </table>
      </div>

      <h3 id="scale-and-reach">Scale &amp; Reach</h3>
      <p>Meta's 2025 AI capex guidance was <strong>$60–65B</strong>, the largest single-year commitment from any lab at the time. This spend primarily went toward GPU infrastructure (H100 and H200 clusters) and data center buildout. The scale reflects Meta's belief that it needs frontier-model capability not to sell to others but to power its own products — recommendation, content moderation, ad generation, and the Meta AI assistant embedded across its apps.</p>

      <h2 id="fair-and-lecun">FAIR &amp; LeCun</h2>
      <p>FAIR (Fundamental AI Research) is Meta's basic research division, historically responsible for foundational contributions including convolutional neural networks, GAN theory, and modern self-supervised vision. Under Chief AI Scientist Yann LeCun, FAIR pursues a research agenda explicitly skeptical of language model autoregression as the path to AGI <a class="ref">[3]</a>.</p>

      <h3 id="world-model-thesis">World-Model Thesis</h3>
      <p>LeCun's central argument: <strong>LLMs are System 1 thinkers only</strong>. They produce fluent output via pattern matching but lack the internal world model required for grounded, causal reasoning. Without a world model — an internal simulation of physical and social reality — AI systems cannot plan, cannot generalize out-of-distribution, and cannot develop genuine understanding. LeCun considers the autoregressive next-token objective fundamentally incapable of producing this capability regardless of scale.</p>
      <p>The proposed alternative is <strong>JEPA (Joint Embedding Predictive Architecture)</strong>: instead of predicting future tokens in observation space, JEPA predicts future states in a learned abstract representation space. This avoids the pixel-level prediction problem that makes video and physical-world modeling intractable with current approaches.</p>

      <h3 id="jepa">JEPA Implementations</h3>
      <p><strong>I-JEPA</strong> (2023): Image JEPA — predicts masked image regions in latent space rather than pixel space; outperforms MAE on linear-probe evaluation with fewer compute cycles. <strong>V-JEPA</strong> (2024): Video JEPA — extends the approach to temporal prediction; learns physical world representations from video without labels.</p>
      <p>FAIR's broader vision portfolio also includes: <strong>SAM / SAM 2</strong> (Segment Anything Model — universal image and video segmentation), <strong>DINOv2</strong> (self-supervised vision backbone), and <strong>ImageBind</strong> (joint embedding across 6 modalities: image, text, audio, depth, thermal, IMU). These form the sensory substrate of LeCun's proposed future architecture, even as the reasoning core remains under active research.</p>
      <p>Internal tension note: FAIR's long-horizon research agenda (world models, JEPA) operates in parallel with Meta's GenAI team, which ships near-term products (Llama, Meta AI assistant, Imagine) on transformer baselines. The two groups share resources but pursue different north stars — a structural tension that mirrors the classic research-vs-product split at major labs.</p>
    `,
  },

};

export const SEED_WIKI_CARDS_INTEL: SeedWikiCard[] = [
  {
    slug: 'anthropic-research',
    title: 'Anthropic Research',
    banner: 'research',
    desc: 'Claude Opus 4.7 & 4.8 releases, Project Glasswing, Dynamic Workflows, and Dario Amodei\'s seven-ingredient scaling thesis.',
    stats: ['3 pages', '3 sources', 'verified'],
  },
  {
    slug: 'openai-strategy',
    title: 'OpenAI Strategy',
    banner: 'research',
    desc: 'GPT-5.5 ("Spud") release, Microsoft partnership restructure, and the three-pillar agentic strategy including Bedrock Managed Agents.',
    stats: ['3 pages', '3 sources', 'verified'],
  },
  {
    slug: 'langchain',
    title: 'LangChain',
    banner: 'research',
    desc: 'LangGraph 1.0 GA, LangSmith Fleet (renamed Agent Builder), and Harrison Chase\'s long-horizon agent and context-engineering thesis.',
    stats: ['3 pages', '3 sources', 'verified'],
  },
  {
    slug: 'xai',
    title: 'xAI Intelligence',
    banner: 'research',
    desc: 'Grok 4 → 4.3 model lineage, Colossus 1 & 2 compute clusters, and the roadmap toward Grok 5 at 6T–10T parameters.',
    stats: ['3 pages', '3 sources', 'verified*'],
  },
  {
    slug: 'google-deepmind',
    title: 'Google DeepMind',
    banner: 'research',
    desc: 'Gemini 1.0 → 2.5 family, Nobel-winning AlphaFold portfolio, GNoME, AlphaGeometry, and the Brain-DeepMind merger structure.',
    stats: ['3 pages', '3 sources', '⚠️ baseline'],
  },
  {
    slug: 'meta',
    title: 'Meta AI',
    banner: 'research',
    desc: 'Llama 1–3.3 open-weight lineage, Zuckerberg\'s four-point open strategy, and LeCun\'s JEPA world-model research program.',
    stats: ['3 pages', '3 sources', '⚠️ baseline'],
  },
];
