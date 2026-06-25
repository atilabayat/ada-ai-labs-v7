import { WikiDef } from "../../lib/types";

export const SEED_WIKIS: Record<string, WikiDef> = {
    'self-improving-agents': {
      title: 'Self-Improving Agents',
      titleEm: 'Self-Improving Agents Research Wiki',
      lede: 'Self-improving agents are AI systems capable of autonomously enhancing their own performance, capabilities, and implementations with minimal external supervision.',
      banner: 'research',
      crumb: 'Research / Wikis / Self-Improving Agents',
      pages: 28, updated: '2h ago', version: '1.2.0', visibility: 'workspace',
      pageList: [
        { id: 'overview', name: 'Overview', current: true },
        { id: 'frameworks', name: 'Frameworks' },
        { id: 'benchmarks', name: 'Benchmarks' },
        { id: 'metacognition', name: 'Metacognitive Learning' },
        { id: 'sources', name: 'Sources' },
      ],
      toc: [
        { id: 'introduction', name: 'Introduction' },
        { id: 'core-challenges', name: 'Core Challenges' },
        { id: 'rigidity', name: 'Rigidity', sub: true },
        { id: 'scalability', name: 'Scalability', sub: true },
        { id: 'verification', name: 'Verification', sub: true },
        { id: 'breakthroughs', name: 'June 2025 Breakthroughs' },
        { id: 'sca', name: 'Self-Challenging Agents', sub: true },
        { id: 'dgm', name: 'Darwin Gödel Machine', sub: true },
        { id: 'metacognitive', name: 'Metacognitive Learning' },
        { id: 'benchmarks', name: 'Benchmark Results' },
        { id: 'open-questions', name: 'Open Research Questions' },
      ],
      sources: [
        { title: 'Self-Challenging Agents: Continuous Self-Improvement via Curriculum Generation', meta: 'arXiv 2506.04287 · Jun 2025' },
        { title: 'Darwin Gödel Machine: Self-Modifying Code Agents', meta: 'arXiv 2505.21156 · May 2025' },
        { title: 'Metacognitive Learning Frameworks for Autonomous Reasoning Systems', meta: 'arXiv 2504.18923 · Apr 2025' },
        { title: 'STOP: Self-Taught Optimizer', meta: 'arXiv 2310.02304 · Oct 2024' },
        { title: 'Gödel Agent: Foundations of Self-Improvement', meta: 'arXiv 2410.04444 · Oct 2024' },
      ],
      related: [
        { name: 'IPA Pattern Compendium', ic: 'IP' },
        { name: 'Knowledge Graph Index', ic: 'KG' },
        { name: 'Peircean Semiotics', ic: 'PS' },
      ],
      content: `
        <div class="wiki-banner-hero" data-c="research"></div>
        <div class="wiki-crumb">
          <span>Research</span><span class="sep">/</span>
          <span>Wikis</span><span class="sep">/</span>
          <span class="ent">Self-Improving Agents</span>
        </div>
        <h1 class="wiki-h1">Self-Improving <em>Agents.</em></h1>
        <div class="wiki-lede">Collecting the latest research on autonomous agent self-improvement — frameworks, benchmarks, and emerging paradigms from 2024 through June 2025.</div>

        <div class="wiki-meta-row">
          <div class="mr">Pages <span class="v">28</span></div>
          <div class="mr">Sources <span class="v">10</span></div>
          <div class="mr">Refs <span class="v">142</span></div>
          <div class="mr">Updated <span class="v">2h ago</span></div>
          <div class="mr">Version <span class="v">v1.2.0</span></div>
        </div>

        <h2 id="introduction">Introduction</h2>
        <p>Self-improving agents are AI systems capable of autonomously enhancing their own performance, capabilities, and implementations with minimal external supervision. Rather than relying on fixed architectures or external optimization loops, these agents can reflect on their behavior, generate improvements, and validate whether changes are beneficial.</p>
        <p>The paradigm shift is significant: instead of humans designing agents and manually improving them, self-improving agents enable a continuous, automated feedback loop where the system itself becomes the architect of its own evolution.</p>

        <div class="callout insight">
          <div class="ct-label">Key Insight</div>
          <p>The traditional paradigm of human-designed-then-improved agents is giving way to systems that compose their own curriculum, evolve their own code, and validate their own improvements <a class="ref">[1]</a><a class="ref">[2]</a>.</p>
        </div>

        <h2 id="core-challenges">Core Challenges</h2>
        <p>Three fundamental challenges define the current frontier:</p>

        <h3 id="rigidity">Rigidity</h3>
        <p>Current approaches rely on fixed, human-designed optimization loops that don't generalize across different task domains. A self-improver trained for code generation typically can't transfer its improvement strategy to mathematical reasoning without substantial re-engineering.</p>

        <h3 id="scalability">Scalability</h3>
        <p>Self-improvement mechanisms struggle to scale as agent capabilities grow, often hitting performance plateaus where additional iterations yield diminishing returns. This is particularly acute in domains with sparse reward signals.</p>

        <h3 id="verification">Verification</h3>
        <p>Determining whether a self-generated modification is actually beneficial requires expensive evaluation cycles. Without robust verification, agents risk converging on locally-optimal but globally-degraded solutions — a failure mode sometimes called <em>self-improvement collapse</em>.</p>

        <h2 id="breakthroughs">June 2025 Breakthroughs</h2>
        <p>Three papers published in mid-2025 represent a step-change in capability:</p>

        <h3 id="sca">Self-Challenging Agents (SCA)</h3>
        <p>SCA introduces continuous self-improvement via <strong>curriculum generation</strong>. Rather than training on a fixed dataset, the agent generates progressively harder problems for itself, evaluates its own solutions, and incorporates verified solutions back into its training corpus <a class="ref">[1]</a>.</p>

        <h3 id="dgm">Darwin Gödel Machine</h3>
        <p>The Darwin Gödel Machine applies <strong>evolutionary search over self-modifying code agents</strong>. Each agent variant proposes modifications to its own implementation; modifications that improve benchmark performance are retained, others are discarded. The system runs for thousands of generations without supervision <a class="ref">[2]</a>.</p>

        <h2 id="metacognitive">Metacognitive Learning</h2>
        <p>An emerging third paradigm proposes a <strong>metacognition layer</strong> — a separate subsystem that monitors the agent's reasoning, identifies failure modes, generates improvement hypotheses, and validates them empirically. Unlike SCA and DGM, which modify behavior or code respectively, metacognitive learning modifies the <em>reasoning policy itself</em> <a class="ref">[3]</a>.</p>

        <div class="callout">
          <div class="ct-label">Architectural Note</div>
          <p>Metacognitive learning resembles a hierarchical reinforcement learning structure where the meta-layer treats the base agent as a sub-policy and operates over a longer time horizon.</p>
        </div>

        <h2 id="benchmarks">Benchmark Results</h2>
        <p>Performance gains on standardized benchmarks across the three frameworks:</p>

        <div class="wiki-table-wrap">
          <table class="wiki-table">
            <thead>
              <tr><th>Framework</th><th>Benchmark</th><th>Baseline</th><th>Result</th><th>Delta</th></tr>
            </thead>
            <tbody>
              <tr><td>SCA</td><td>SWE-Bench</td><td>20.0%</td><td>50.0%</td><td><span class="tg bull">+30.0pp</span></td></tr>
              <tr><td>DGM</td><td>Polyglot</td><td>14.2%</td><td>30.7%</td><td><span class="tg bull">+16.5pp</span></td></tr>
              <tr><td>Metacognitive</td><td>ARC-AGI</td><td>8.4%</td><td>21.2%</td><td><span class="tg bull">+12.8pp</span></td></tr>
              <tr><td>SCA</td><td>MATH</td><td>62.1%</td><td>74.8%</td><td><span class="tg bull">+12.7pp</span></td></tr>
              <tr><td>DGM</td><td>HumanEval</td><td>78.3%</td><td>89.1%</td><td><span class="tg bull">+10.8pp</span></td></tr>
            </tbody>
          </table>
        </div>

        <p>Performance gains of 2–3× on coding benchmarks are notable, but generalization across task domains remains an open question. SCA performs strongly on code and math but its curriculum-generation strategy hasn't been validated on creative or open-ended tasks.</p>

        <h2 id="open-questions">Open Research Questions</h2>
        <p>The wiki is ready to browse and expand — sources are documented so future research can be easily added:</p>
        <ul>
          <li><strong>Cross-domain transfer.</strong> Can a self-improver trained on code transfer its improvement strategy to mathematical reasoning?</li>
          <li><strong>Verification scalability.</strong> Empirical evaluation cycles remain expensive — what cheap proxies exist?</li>
          <li><strong>Convergence guarantees.</strong> Under what conditions does self-improvement provably terminate at a non-degenerate fixed point?</li>
          <li><strong>Capability overhang.</strong> If a metacognitive layer can rewrite the base policy, what safety properties survive?</li>
        </ul>

        <div class="callout warn">
          <div class="ct-label">Maintenance Note</div>
          <p>Next pass: incorporate the July 2025 follow-up papers on hybrid SCA-DGM architectures. Add benchmark data for HumanEval-X and SWE-Bench Verified.</p>
        </div>

        <div class="wiki-footer-nav">
          <a class="wfn-card" data-toc="metacognition">
            <div class="wfn-label">← Previous Section</div>
            <div class="wfn-title">Metacognitive Learning</div>
          </a>
          <a class="wfn-card next" data-toc="benchmarks">
            <div class="wfn-label">Next Section →</div>
            <div class="wfn-title">Benchmark Results</div>
          </a>
        </div>
      `,
    },

    'ipa-pattern-compendium': {
      title: 'IPA Pattern Compendium',
      lede: '35 institutional price action patterns — QM/QML, FVG, BOS, OB, SMC methodology with empirical win-rate columns by regime.',
      banner: 'quant',
      crumb: 'Research / Wikis / IPA Pattern Compendium',
      pages: 52, updated: 'yesterday', version: '3.0.0', visibility: 'workspace',
      pageList: [
        { id: 'overview', name: 'Overview', current: true },
        { id: 'qm-qml', name: 'QM / QML Patterns' },
        { id: 'fvg', name: 'Fair Value Gaps' },
        { id: 'bos-choch', name: 'BOS & CHOCH' },
        { id: 'order-blocks', name: 'Order Blocks' },
        { id: 'session-vp', name: 'Session VP' },
        { id: 'win-rates', name: 'Win Rate Tables' },
      ],
      toc: [
        { id: 'introduction', name: 'Introduction' },
        { id: 'methodology', name: 'Methodology' },
        { id: 'qm-qml', name: 'QM & QML' },
        { id: 'fvg', name: 'Fair Value Gaps (FVG)' },
        { id: 'bos', name: 'Break of Structure (BOS)' },
        { id: 'order-blocks', name: 'Order Blocks (OB)' },
        { id: 'win-rates', name: 'Empirical Win Rates' },
        { id: 'regime-overlay', name: 'Regime Overlay' },
      ],
      sources: [
        { title: 'Ross Cameron — Day Trading Strategies', meta: 'Educational · 2024' },
        { title: 'Minervini — Trade Like a Stock Market Wizard', meta: 'Book · 2013' },
        { title: 'O\'Neil — How to Make Money in Stocks', meta: 'Book · 2009' },
        { title: 'ICT — Inner Circle Trader Methodology', meta: 'Educational · 2024' },
        { title: 'SMC Concepts — Volume Profile & Order Flow', meta: 'Reference · 2025' },
      ],
      related: [
        { name: 'TSLA Ticker Intelligence', ic: 'TS' },
        { name: 'Market Regime Memory', ic: 'MR' },
        { name: 'Self-Improving Agents', ic: 'SI' },
      ],
      content: `
        <div class="wiki-banner-hero" data-c="quant"></div>
        <div class="wiki-crumb">
          <span>Research</span><span class="sep">/</span>
          <span>Wikis</span><span class="sep">/</span>
          <span class="ent">IPA Pattern Compendium</span>
        </div>
        <h1 class="wiki-h1">IPA Pattern <em>Compendium.</em></h1>
        <div class="wiki-lede">A master reference of 35 institutional price action patterns with empirical win rates, volume confirmation columns, and regime-specific overlays. Compiled from Cameron, Minervini, O'Neil, ICT, and SMC methodologies.</div>

        <div class="wiki-meta-row">
          <div class="mr">Patterns <span class="v">35</span></div>
          <div class="mr">Sheets <span class="v">7</span></div>
          <div class="mr">Sources <span class="v">35</span></div>
          <div class="mr">Updated <span class="v">yesterday</span></div>
          <div class="mr">Version <span class="v">v3.0.0</span></div>
        </div>

        <h2 id="introduction">Introduction</h2>
        <p>The IPA (Institutional Price Action) Compendium consolidates 35 high-probability price action patterns observed across MAG-7, SPX, and major futures contracts. Each pattern is logged with a structural definition, confluence requirements, volume confirmation, and an empirical win-rate column derived from a five-year backtest.</p>

        <p>This is a <strong>living reference</strong>. Win rates update nightly as new occurrences are tagged in the IPA Pattern Capture Loop and ingested by the Quant Skill.</p>

        <div class="callout insight">
          <div class="ct-label">Compendium Philosophy</div>
          <p>Patterns are not signals. A pattern is a structural condition; the trade decision requires confluence with the broader regime, volume profile, and ticker-specific catalyst layer.</p>
        </div>

        <h2 id="methodology">Methodology</h2>
        <p>Each pattern documented in the Compendium includes seven required fields:</p>
        <ul>
          <li><strong>Structural definition</strong> — the price action signature in unambiguous terms</li>
          <li><strong>Timeframe scope</strong> — 1m, 5m, 15m, 1h, 4h, 1d applicability</li>
          <li><strong>Confluence requirements</strong> — additional conditions for high-confidence setups</li>
          <li><strong>Volume confirmation</strong> — required SVP or session VP signature</li>
          <li><strong>Regime gate</strong> — bull / bear / chop / vol-expansion applicability, conditioned on the live <a class="ref">[Market Regime Memory]</a></li>
          <li><strong>Empirical win rate</strong> — backtested 5-year win rate by regime</li>
          <li><strong>R-multiple distribution</strong> — average win, average loss, expectancy</li>
        </ul>

        <h2 id="qm-qml">QM & QML Patterns</h2>
        <p>The Quasimodo (QM) and Quasimodo-Liquidity (QML) patterns are foundational reversal structures. QM is defined by a higher-high followed by a lower-low that breaks the prior swing low, then a recovery that fails to reclaim the high. QML adds a liquidity sweep before the failure.</p>

        <div class="wiki-table-wrap">
          <table class="wiki-table">
            <thead>
              <tr><th>Pattern</th><th>Timeframe</th><th>Regime</th><th>Win Rate</th><th>Avg R</th></tr>
            </thead>
            <tbody>
              <tr><td>QM Bearish</td><td>15m–1h</td><td><span class="tg bull">Bull Exhaustion</span></td><td>64.2%</td><td>2.1R</td></tr>
              <tr><td>QML Bearish</td><td>15m–4h</td><td><span class="tg bull">Bull Exhaustion</span></td><td>71.8%</td><td>2.6R</td></tr>
              <tr><td>QM Bullish</td><td>15m–1h</td><td><span class="tg bear">Bear Exhaustion</span></td><td>62.7%</td><td>2.0R</td></tr>
              <tr><td>QML Bullish</td><td>15m–4h</td><td><span class="tg bear">Bear Exhaustion</span></td><td>69.4%</td><td>2.4R</td></tr>
              <tr><td>IQM (Inverse)</td><td>5m–15m</td><td><span class="tg neut">Range</span></td><td>58.1%</td><td>1.7R</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="fvg">Fair Value Gaps (FVG)</h2>
        <p>Fair Value Gaps are three-candle inefficiencies where the wicks of the first and third candles do not overlap, leaving a "gap" of unfilled order flow in the middle candle. FVGs act as magnets for price and as decision zones for continuation versus reversal.</p>
        <p>The Compendium tracks <strong>premium FVGs</strong> (above the equilibrium of the dealing range) and <strong>discount FVGs</strong> (below), with separate win rates for mitigation (price returns and reverses) versus rejection (price returns and continues).</p>

        <div class="callout warn">
          <div class="ct-label">Common Mistake</div>
          <p>Treating every FVG as a trade zone. Only FVGs that align with the higher-timeframe order block and the session volume profile carry the documented win rates.</p>
        </div>

        <h2 id="bos">Break of Structure (BOS)</h2>
        <p>BOS is a directional confirmation — price breaks above a prior swing high (bullish BOS) or below a prior swing low (bearish BOS) with displacement. CHOCH (Change of Character) is the inverse — the first BOS against the prevailing trend, signaling potential regime change.</p>

        <h2 id="order-blocks">Order Blocks (OB)</h2>
        <p>An Order Block is the last opposing candle before a displacement move. Bullish OBs are the last down-candle before an up-displacement; bearish OBs are the last up-candle before a down-displacement. The Compendium catalogs OB types by displacement strength, retest behavior, and confluence with FVGs.</p>

        <h2 id="win-rates">Empirical Win Rates</h2>
        <p>The full win rate table spans all 35 patterns across 4 regimes — but here is a summary by category:</p>

        <div class="wiki-table-wrap">
          <table class="wiki-table">
            <thead>
              <tr><th>Category</th><th>Patterns</th><th>Bull Regime</th><th>Bear Regime</th><th>Chop</th><th>Vol Expansion</th></tr>
            </thead>
            <tbody>
              <tr><td>QM / QML</td><td>5</td><td>66.1%</td><td>67.4%</td><td>54.2%</td><td>72.3%</td></tr>
              <tr><td>FVG (Premium)</td><td>4</td><td>61.8%</td><td>58.9%</td><td>49.7%</td><td>64.1%</td></tr>
              <tr><td>FVG (Discount)</td><td>4</td><td>63.2%</td><td>62.1%</td><td>52.4%</td><td>66.8%</td></tr>
              <tr><td>BOS / CHOCH</td><td>6</td><td>58.7%</td><td>57.3%</td><td>44.1%</td><td>68.9%</td></tr>
              <tr><td>Order Blocks</td><td>8</td><td>64.4%</td><td>63.8%</td><td>51.6%</td><td>69.2%</td></tr>
              <tr><td>SR Flip</td><td>4</td><td>59.1%</td><td>58.4%</td><td>46.8%</td><td>62.7%</td></tr>
              <tr><td>Failed Auction</td><td>4</td><td>71.2%</td><td>70.8%</td><td>62.4%</td><td>76.1%</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="regime-overlay">Regime Overlay</h2>
        <p>The Compendium applies a four-regime classifier to every backtested period — bull, bear, chop, and vol-expansion — derived from the VIX term structure and SPX 50/200 SMA configuration. Win rates are reported per regime because a QM pattern in vol expansion is a fundamentally different setup from the same QM in chop.</p>

        <div class="codeblock"><span class="cc"># Regime classifier (simplified)</span>
<span class="ck">def</span> <span class="cs">classify_regime</span>(vix_ts, spx_smas):
    <span class="ck">if</span> vix_ts.front > 30 <span class="ck">and</span> vix_ts.slope < 0:
        <span class="ck">return</span> <span class="cs">"vol_expansion"</span>
    <span class="ck">if</span> spx_smas.sma50 > spx_smas.sma200:
        <span class="ck">return</span> <span class="cs">"bull"</span>
    <span class="ck">if</span> spx_smas.sma50 < spx_smas.sma200:
        <span class="ck">return</span> <span class="cs">"bear"</span>
    <span class="ck">return</span> <span class="cs">"chop"</span></div>

        <div class="wiki-footer-nav">
          <a class="wfn-card" data-toc="order-blocks">
            <div class="wfn-label">← Previous Section</div>
            <div class="wfn-title">Order Blocks</div>
          </a>
          <a class="wfn-card next" data-toc="regime-overlay">
            <div class="wfn-label">Next Section →</div>
            <div class="wfn-title">Regime Overlay</div>
          </a>
        </div>
      `,
    },

    'tsla-ticker-intelligence': {
      title: 'TSLA Ticker Intelligence',
      lede: 'Living page — dealer positioning, catalysts, IPA setups, and historical regime overlays for TSLA.',
      banner: 'quant',
      crumb: 'Research / Wikis / TSLA Ticker Intelligence',
      pages: 14, updated: '15m ago', version: '2.4.0', visibility: 'workspace',
      pageList: [
        { id: 'overview', name: 'Overview', current: true },
        { id: 'positioning', name: 'Dealer Positioning' },
        { id: 'catalysts', name: 'Catalyst Calendar' },
        { id: 'setups', name: 'Active Setups' },
        { id: 'history', name: 'Regime History' },
      ],
      toc: [
        { id: 'snapshot', name: 'Current Snapshot' },
        { id: 'positioning', name: 'Dealer Positioning' },
        { id: 'walls', name: 'Put / Call Walls' },
        { id: 'gamma', name: 'Gamma Exposure' },
        { id: 'catalysts', name: 'Catalyst Calendar' },
        { id: 'setups', name: 'Active IPA Setups' },
        { id: 'regime', name: 'Current Regime' },
      ],
      sources: [
        { title: 'Tradier Options Chain — TSLA', meta: 'Live · streaming' },
        { title: 'Polygon Aggregates — TSLA 1m', meta: 'Live · streaming' },
        { title: 'TSLA Earnings Transcript Q1', meta: 'SEC · Apr 2026' },
      ],
      related: [
        { name: 'IPA Pattern Compendium', ic: 'IP' },
        { name: 'Market Regime Memory', ic: 'MR' },
      ],
      content: `
        <div class="wiki-banner-hero" data-c="quant"></div>
        <div class="wiki-crumb">
          <span>Research</span><span class="sep">/</span>
          <span>Wikis</span><span class="sep">/</span>
          <span class="ent">TSLA Ticker Intelligence</span>
        </div>
        <h1 class="wiki-h1">TSLA Ticker <em>Intelligence.</em></h1>
        <div class="wiki-lede">A living wiki page for Tesla — refreshed every 15 minutes during market hours. Dealer positioning, active setups, and regime context in one place.</div>

        <div class="wiki-meta-row">
          <div class="mr">Last Price <span class="v">$432.18</span></div>
          <div class="mr">Bias <span class="v">Bullish</span></div>
          <div class="mr">Regime <span class="v">Low Vol</span></div>
          <div class="mr">Updated <span class="v">15m ago</span></div>
        </div>

        <h2 id="snapshot">Current Snapshot</h2>
        <p>TSLA is trading at <strong>$432.18</strong>, up <strong>+2.84%</strong> on the session. Volume is running at 118% of 20-day average. The stock is above its 21-day EMA and reclaimed the 50-day SMA earlier this week.</p>

        <div class="callout">
          <div class="ct-label">Today's Read</div>
          <p>Dealer gamma is positive (+$1.4B), which suppresses intraday volatility. Price is pinned between the call wall at $450 and the put wall at $420. Expect range-bound action unless one wall breaks on volume.</p>
        </div>

        <h2 id="positioning">Dealer Positioning</h2>
        <p>Aggregate dealer gamma is net long across the front-month chain. This means dealers are buying weakness and selling strength — a stabilizing regime that compresses realized volatility.</p>

        <h3 id="walls">Put / Call Walls</h3>
        <div class="wiki-table-wrap">
          <table class="wiki-table">
            <thead><tr><th>Level</th><th>Strike</th><th>OI</th><th>Distance</th><th>Bias</th></tr></thead>
            <tbody>
              <tr><td>Call Wall</td><td>$450</td><td>48,200</td><td>+4.1%</td><td><span class="tg bear">Resistance</span></td></tr>
              <tr><td>Pin</td><td>$435</td><td>32,800</td><td>+0.7%</td><td><span class="tg neut">Magnet</span></td></tr>
              <tr><td>Zero Gamma</td><td>$428</td><td>—</td><td>−1.0%</td><td><span class="tg neut">Pivot</span></td></tr>
              <tr><td>Put Wall</td><td>$420</td><td>52,400</td><td>−2.8%</td><td><span class="tg bull">Support</span></td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="gamma">Gamma Exposure</h3>
        <p>Net GEX is +$1.4B. The zero-gamma level sits at $428 — above this, dealers are long gamma and dampening moves; below, they flip short and amplify them. A close below $428 on volume would be a regime-shift signal worth monitoring.</p>

        <h2 id="catalysts">Catalyst Calendar</h2>
        <ul>
          <li><strong>Q2 Earnings</strong> — Jul 22, 2026 (after close). Implied move ~6%.</li>
          <li><strong>Vehicle Delivery Numbers</strong> — early July. Watch for guidance walk-back.</li>
          <li><strong>FSD v13.5 Rollout</strong> — expected this month. Sentiment catalyst.</li>
        </ul>

        <h2 id="setups">Active IPA Setups</h2>
        <p>The <a class="ref">[IPA Pattern Compendium]</a> has flagged three active setups on TSLA:</p>
        <div class="wiki-table-wrap">
          <table class="wiki-table">
            <thead><tr><th>Pattern</th><th>Timeframe</th><th>Entry</th><th>Stop</th><th>Target</th><th>R</th></tr></thead>
            <tbody>
              <tr><td>QML Bullish</td><td>1h</td><td>$430</td><td>$424</td><td>$448</td><td>3.0R</td></tr>
              <tr><td>FVG (Discount)</td><td>15m</td><td>$429.50</td><td>$427</td><td>$436</td><td>2.6R</td></tr>
              <tr><td>OB Mitigation</td><td>4h</td><td>$425</td><td>$418</td><td>$447</td><td>3.1R</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="regime">Current Regime</h2>
        <p>TSLA is in a <strong>low-volatility bullish regime</strong>. VIX is at 14.2, the front-month VVIX is at 92 (compressed), and the 30-day realized volatility is 28% — well below the trailing average. In this regime, the Compendium's QML and FVG patterns have historically returned 69-72% win rates with ~2.5R average payoff.</p>

        <div class="callout insight">
          <div class="ct-label">Compounding Memory</div>
          <p>This page rebuilds itself from the Quant Skill every 15 minutes during RTH. Historical snapshots are versioned in the <a class="ref">[Market Regime Memory]</a> wiki for backtest cross-reference.</p>
        </div>

        <div class="wiki-footer-nav">
          <a class="wfn-card" data-toc="setups">
            <div class="wfn-label">← Previous Section</div>
            <div class="wfn-title">Active Setups</div>
          </a>
          <a class="wfn-card next" data-toc="regime">
            <div class="wfn-label">Next Section →</div>
            <div class="wfn-title">Current Regime</div>
          </a>
        </div>
      `,
    },

    'peircean-semiotics': {
      title: 'Peircean Semiotics',
      lede: 'Ten classes of signs as a lattice — Firstness, Secondness, Thirdness with citation graph.',
      banner: 'philosophy',
      crumb: 'Research / Wikis / Peircean Semiotics',
      pages: 19, updated: '5d ago', version: '1.0.0', visibility: 'workspace',
      pageList: [
        { id: 'overview', name: 'Overview', current: true },
        { id: 'categories', name: 'Three Categories' },
        { id: 'sign-classes', name: 'Ten Sign Classes' },
        { id: 'lattice', name: 'Lattice Structure' },
        { id: 'sources', name: 'Sources & Citations' },
      ],
      toc: [
        { id: 'introduction', name: 'Introduction' },
        { id: 'categories', name: 'The Three Categories' },
        { id: 'firstness', name: 'Firstness', sub: true },
        { id: 'secondness', name: 'Secondness', sub: true },
        { id: 'thirdness', name: 'Thirdness', sub: true },
        { id: 'sign-classes', name: 'Ten Sign Classes' },
        { id: 'lattice', name: 'Lattice Structure' },
      ],
      sources: [
        { title: 'Peirce — Collected Papers Vols 1-6', meta: 'Harvard · 1931-1935' },
        { title: 'Short — Peirce\'s Theory of Signs', meta: 'Cambridge · 2007' },
        { title: 'Liszka — A General Introduction to Peirce', meta: 'Indiana · 1996' },
      ],
      related: [
        { name: 'Mathematical Logic', ic: 'ML' },
        { name: 'Self-Improving Agents', ic: 'SI' },
      ],
      content: `
        <div class="wiki-banner-hero" data-c="philosophy"></div>
        <div class="wiki-crumb">
          <span>Research</span><span class="sep">/</span>
          <span>Wikis</span><span class="sep">/</span>
          <span class="ent">Peircean Semiotics</span>
        </div>
        <h1 class="wiki-h1">Peircean <em>Semiotics.</em></h1>
        <div class="wiki-lede">Charles Sanders Peirce's theory of signs, organized as a lattice of ten sign classes derived from the three phenomenological categories — Firstness, Secondness, and Thirdness.</div>

        <div class="wiki-meta-row">
          <div class="mr">Pages <span class="v">19</span></div>
          <div class="mr">References <span class="v">42</span></div>
          <div class="mr">Updated <span class="v">5d ago</span></div>
          <div class="mr">Version <span class="v">v1.0.0</span></div>
        </div>

        <h2 id="introduction">Introduction</h2>
        <p>Peirce's semiotic is the most systematic theory of signs in the Western philosophical tradition. Where Saussure offered a dyadic structure of signifier and signified, Peirce constructs a <strong>triadic</strong> theory in which every sign relates a representamen (the sign-vehicle), an object (what the sign stands for), and an interpretant (the cognitive effect the sign produces).</p>
        <p>From this triadic foundation, Peirce derives ten classes of signs through a systematic combination of three trichotomies — yielding the famous lattice that organizes the entire taxonomy.</p>

        <div class="callout insight">
          <div class="ct-label">Philosophical Anchor</div>
          <p>Peirce's three categories are not arbitrary classifications but phenomenological universals — Firstness (quality), Secondness (reaction), Thirdness (mediation). All cognition, on Peirce's view, is irreducibly triadic.</p>
        </div>

        <h2 id="categories">The Three Categories</h2>
        <p>Peirce's phenomenology rests on three categories he claims are exhaustive of conscious experience.</p>

        <h3 id="firstness">Firstness</h3>
        <p>The mode of being that consists in its being itself, without reference to anything else. Quality, feeling, possibility. The redness of red before any comparison.</p>

        <h3 id="secondness">Secondness</h3>
        <p>The mode of being that consists in reaction — the brute existence of one thing against another. Action and resistance, here and now, the existential clash.</p>

        <h3 id="thirdness">Thirdness</h3>
        <p>The mode of being that mediates between Firstness and Secondness. Generality, law, habit, representation. <em>Thirdness is the mode of being of signs themselves.</em></p>

        <h2 id="sign-classes">Ten Sign Classes</h2>
        <p>Each sign is classified along three trichotomies — by the nature of the sign itself (qualisign, sinsign, legisign), by its relation to its object (icon, index, symbol), and by its relation to its interpretant (rheme, dicent, argument). Through combinatorial constraints, only ten of the 27 possible combinations are coherent.</p>

        <div class="wiki-table-wrap">
          <table class="wiki-table">
            <thead><tr><th>Class</th><th>Sign Itself</th><th>To Object</th><th>To Interpretant</th><th>Example</th></tr></thead>
            <tbody>
              <tr><td>I</td><td>Qualisign</td><td>Icon</td><td>Rheme</td><td>A feeling of red</td></tr>
              <tr><td>II</td><td>Sinsign</td><td>Icon</td><td>Rheme</td><td>A particular diagram</td></tr>
              <tr><td>III</td><td>Sinsign</td><td>Index</td><td>Rheme</td><td>A spontaneous cry</td></tr>
              <tr><td>IV</td><td>Sinsign</td><td>Index</td><td>Dicent</td><td>A weathercock</td></tr>
              <tr><td>V</td><td>Legisign</td><td>Icon</td><td>Rheme</td><td>A diagram type</td></tr>
              <tr><td>VI</td><td>Legisign</td><td>Index</td><td>Rheme</td><td>Demonstrative pronoun</td></tr>
              <tr><td>VII</td><td>Legisign</td><td>Index</td><td>Dicent</td><td>A street cry</td></tr>
              <tr><td>VIII</td><td>Legisign</td><td>Symbol</td><td>Rheme</td><td>A common noun</td></tr>
              <tr><td>IX</td><td>Legisign</td><td>Symbol</td><td>Dicent</td><td>A proposition</td></tr>
              <tr><td>X</td><td>Legisign</td><td>Symbol</td><td>Argument</td><td>A syllogism</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="lattice">Lattice Structure</h2>
        <p>The ten classes form a lattice under the inheritance relation — Class X (the argument) inherits all the determinations of the simpler classes. Plotted graphically, the lattice forms a triangular structure with Class I at the apex (pure quality) and Class X at the base (full symbolic argument).</p>

        <p>This lattice has been visualized in our <a class="ref">[Peirce Lattice Diagram]</a> interactive artifact, which is deployed as a standalone application in the Applications module.</p>

        <div class="wiki-footer-nav">
          <a class="wfn-card" data-toc="sign-classes">
            <div class="wfn-label">← Previous Section</div>
            <div class="wfn-title">Ten Sign Classes</div>
          </a>
          <a class="wfn-card next" data-toc="lattice">
            <div class="wfn-label">Next Section →</div>
            <div class="wfn-title">Lattice Structure</div>
          </a>
        </div>
      `,
    },

    'market-regime-memory': {
      title: 'Market Regime Memory',
      lede: 'Historical regime classifications — bull, bear, chop, vol expansion / compression with VIX overlays.',
      banner: 'research',
      crumb: 'Research / Wikis / Market Regime Memory',
      pages: 31, updated: '1w ago', version: '2.1.0', visibility: 'workspace',
      pageList: [
        { id: 'overview', name: 'Overview', current: true },
        { id: 'classifier', name: 'Regime Classifier' },
        { id: 'history', name: '12-Year History' },
        { id: 'transitions', name: 'Regime Transitions' },
      ],
      toc: [
        { id: 'introduction', name: 'Introduction' },
        { id: 'classifier', name: 'The Classifier' },
        { id: 'four-regimes', name: 'Four Regimes' },
        { id: 'history', name: '12-Year History' },
        { id: 'applications', name: 'Downstream Applications' },
      ],
      sources: [
        { title: 'VIX Term Structure Database', meta: 'CBOE · daily' },
        { title: 'SPX Historical OHLCV', meta: 'Polygon · daily' },
        { title: 'NYU Stern Regime Paper', meta: 'SSRN · 2025' },
      ],
      related: [
        { name: 'IPA Pattern Compendium', ic: 'IP' },
        { name: 'TSLA Ticker Intelligence', ic: 'TS' },
      ],
      content: `
        <div class="wiki-banner-hero" data-c="research"></div>
        <div class="wiki-crumb">
          <span>Research</span><span class="sep">/</span>
          <span>Wikis</span><span class="sep">/</span>
          <span class="ent">Market Regime Memory</span>
        </div>
        <h1 class="wiki-h1">Market Regime <em>Memory.</em></h1>
        <div class="wiki-lede">A 12-year historical record of market regimes — bull, bear, chop, and vol-expansion — used to contextualize every IPA pattern, every ticker setup, and every backtest run on the platform.</div>

        <div class="wiki-meta-row">
          <div class="mr">Pages <span class="v">31</span></div>
          <div class="mr">History <span class="v">2014-2026</span></div>
          <div class="mr">Sources <span class="v">12</span></div>
          <div class="mr">Updated <span class="v">1w ago</span></div>
        </div>

        <h2 id="introduction">Introduction</h2>
        <p>The Market Regime Memory is the platform's longest-running living wiki. It classifies every trading day from January 2014 forward into one of four regimes and stores the classification in a queryable index used by the IPA Compendium, the Quant Skill, and the Morning Briefing.</p>

        <h2 id="classifier">The Classifier</h2>
        <p>Regime classification is performed nightly on close-of-day data. The classifier uses three inputs: the VIX term structure (front-month vs three-month), the SPX 50/200 SMA configuration, and the trailing 30-day realized volatility of SPX.</p>

        <h2 id="four-regimes">Four Regimes</h2>
        <div class="wiki-table-wrap">
          <table class="wiki-table">
            <thead><tr><th>Regime</th><th>VIX</th><th>SMA Config</th><th>RV-30</th><th>% of History</th></tr></thead>
            <tbody>
              <tr><td><span class="tg bull">Bull</span></td><td>&lt;20</td><td>50 &gt; 200</td><td>&lt;15%</td><td>52%</td></tr>
              <tr><td><span class="tg bear">Bear</span></td><td>&gt;25</td><td>50 &lt; 200</td><td>&gt;20%</td><td>14%</td></tr>
              <tr><td><span class="tg neut">Chop</span></td><td>15-25</td><td>50 ≈ 200</td><td>10-18%</td><td>24%</td></tr>
              <tr><td><span class="tg">Vol Expansion</span></td><td>&gt;30</td><td>any</td><td>&gt;25%</td><td>10%</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="history">12-Year History</h2>
        <p>Major regime events captured in the memory include the Aug 2015 selloff, the Feb 2018 volmageddon, the Mar 2020 COVID crash, the 2022 rate-driven bear market, and the 2024-2025 grinding bull. Each transition is annotated with the trigger event, the duration, and the IPA pattern performance during the period.</p>

        <h2 id="applications">Downstream Applications</h2>
        <p>The Market Regime Memory is read by four downstream systems:</p>
        <ul>
          <li><strong><a class="ref">[IPA Pattern Compendium]</a></strong> — to compute regime-conditional win rates</li>
          <li><strong>Quant Skill</strong> — to gate live signal generation</li>
          <li><strong>Morning Briefing</strong> — to set the daily macro tone</li>
          <li><strong>Backtester</strong> — to slice historical performance by regime</li>
        </ul>

        <div class="callout insight">
          <div class="ct-label">Why This Wiki Matters</div>
          <p>Without regime conditioning, <a class="ref">[IPA Pattern Compendium]</a> win rates are averages over heterogeneous market states. The regime memory is what makes the Compendium's win rates actionable rather than misleading.</p>
        </div>

        <div class="wiki-footer-nav">
          <a class="wfn-card" data-toc="four-regimes">
            <div class="wfn-label">← Previous Section</div>
            <div class="wfn-title">Four Regimes</div>
          </a>
          <a class="wfn-card next" data-toc="history">
            <div class="wfn-label">Next Section →</div>
            <div class="wfn-title">12-Year History</div>
          </a>
        </div>
      `,
    },

    'mathematical-logic': {
      title: 'Mathematical Logic',
      lede: 'Course reference — propositional, predicate, modal, quantum logic. Lecture notes with worked exercises.',
      banner: 'philosophy',
      crumb: 'Research / Wikis / Mathematical Logic',
      pages: 26, updated: '2w ago', version: '1.4.0', visibility: 'workspace',
      pageList: [
        { id: 'overview', name: 'Overview', current: true },
        { id: 'propositional', name: 'Propositional Logic' },
        { id: 'predicate', name: 'Predicate Logic' },
        { id: 'modal', name: 'Modal Logic' },
        { id: 'quantum', name: 'Quantum Logic' },
      ],
      toc: [
        { id: 'introduction', name: 'Introduction' },
        { id: 'propositional', name: 'Propositional Logic' },
        { id: 'predicate', name: 'Predicate Logic' },
        { id: 'modal', name: 'Modal Logic' },
        { id: 'quantum', name: 'Quantum Logic' },
        { id: 'exercises', name: 'Exercise Sets' },
      ],
      sources: [
        { title: 'Enderton — A Mathematical Introduction to Logic', meta: 'Academic Press · 2001' },
        { title: 'Hughes & Cresswell — A New Introduction to Modal Logic', meta: 'Routledge · 1996' },
        { title: 'Birkhoff & von Neumann — The Logic of Quantum Mechanics', meta: 'Annals of Math · 1936' },
      ],
      related: [
        { name: 'Peircean Semiotics', ic: 'PS' },
      ],
      content: `
        <div class="wiki-banner-hero" data-c="philosophy"></div>
        <div class="wiki-crumb">
          <span>Research</span><span class="sep">/</span>
          <span>Wikis</span><span class="sep">/</span>
          <span class="ent">Mathematical Logic</span>
        </div>
        <h1 class="wiki-h1">Mathematical <em>Logic.</em></h1>
        <div class="wiki-lede">A consolidated course reference spanning propositional, predicate, modal, and quantum logic — built from lecture notes and worked exercises for the university-level course.</div>

        <div class="wiki-meta-row">
          <div class="mr">Pages <span class="v">26</span></div>
          <div class="mr">References <span class="v">85</span></div>
          <div class="mr">Exercises <span class="v">128</span></div>
          <div class="mr">Updated <span class="v">2w ago</span></div>
        </div>

        <h2 id="introduction">Introduction</h2>
        <p>This wiki is the working reference for the Mathematical Logic course curriculum. It is organized into four major divisions — propositional logic as the algebraic base, predicate logic extending to quantification, modal logic adding intensional operators, and quantum logic as a non-distributive lattice generalization motivated by quantum mechanics.</p>

        <h2 id="propositional">Propositional Logic</h2>
        <p>Propositional logic studies truth-functional combinations of atomic propositions. The semantics is given by truth tables, the syntax by a small set of connectives (typically ¬, ∧, ∨, →, ↔), and the deductive system by a Hilbert-style axiomatization or natural deduction.</p>

        <div class="codeblock"><span class="cc">// Soundness and completeness</span>
⊢ φ  ⟺  ⊨ φ

<span class="cc">// For propositional logic, both directions are provable.</span></div>

        <h2 id="predicate">Predicate Logic</h2>
        <p>First-order predicate logic extends propositional logic with quantifiers (∀, ∃) and predicates. Gödel's completeness theorem shows that first-order logic is complete — every semantically valid formula is provable. Gödel's incompleteness theorems then show that any sufficiently expressive arithmetical theory must be either incomplete or inconsistent.</p>

        <h2 id="modal">Modal Logic</h2>
        <p>Modal logic adds intensional operators (□, ◇) for necessity and possibility. Kripke semantics interprets these via accessibility relations between possible worlds. Different axiom systems (K, T, S4, S5) correspond to different structural properties of the accessibility relation.</p>

        <div class="callout">
          <div class="ct-label">Connection</div>
          <p>S5 modal logic — where the accessibility relation is an equivalence — is the logic typically appropriate for metaphysical necessity, where what is necessary is what holds in all worlds whatsoever.</p>
        </div>

        <h2 id="quantum">Quantum Logic</h2>
        <p>Birkhoff and von Neumann (1936) proposed that the logic of quantum mechanical propositions is not Boolean but instead forms an orthomodular lattice that fails distributivity. This is a structural consequence of the projection lattice of a Hilbert space.</p>

        <p>The key failure is that <strong>p ∧ (q ∨ r) ≠ (p ∧ q) ∨ (p ∧ r)</strong> in general, when p, q, r correspond to incompatible measurement outcomes. This non-distributivity is the formal trace of the uncertainty principle.</p>

        <h2 id="exercises">Exercise Sets</h2>
        <p>The wiki includes 128 worked exercises distributed across the four divisions. Each exercise includes a problem statement, a hint, a full solution, and links to relevant theorems in the main text.</p>

        <div class="wiki-footer-nav">
          <a class="wfn-card" data-toc="quantum">
            <div class="wfn-label">← Previous Section</div>
            <div class="wfn-title">Quantum Logic</div>
          </a>
          <a class="wfn-card next" data-toc="exercises">
            <div class="wfn-label">Next Section →</div>
            <div class="wfn-title">Exercise Sets</div>
          </a>
        </div>
      `,
    },
  };

export interface SeedWikiCard {
  slug: string;
  title: string;
  desc: string;
  banner: "research" | "quant" | "philosophy";
  stats: [string, string, string];
}

export interface WikiCard {
  slug: string;
  title: string;
  desc: string;
  banner: "research" | "quant" | "philosophy";
  stats: [string, string, string];
}

export const SEED_WIKI_CARDS: SeedWikiCard[] = [
  { slug: "self-improving-agents", title: "Self-Improving Agents", banner: "research",
    desc: "Latest research on autonomous agent self-improvement — 2024 → June 2025 with benchmarks.",
    stats: ["28 pages", "10 sources", "2h ago"] },
  { slug: "ipa-pattern-compendium", title: "IPA Pattern Compendium", banner: "quant",
    desc: "35 institutional patterns — QM/QML, FVG, BOS, OB, SMC. Empirical win-rate columns by regime.",
    stats: ["52 pages", "35 patterns", "yesterday"] },
  { slug: "tsla-ticker-intelligence", title: "TSLA Ticker Intelligence", banner: "quant",
    desc: "Living page — dealer positioning, catalysts, IPA setups, historical regime overlays.",
    stats: ["14 pages", "live updates", "15m ago"] },
  { slug: "peircean-semiotics", title: "Peircean Semiotics", banner: "philosophy",
    desc: "Ten classes of signs as a lattice — Firstness, Secondness, Thirdness with citation graph.",
    stats: ["19 pages", "42 refs", "5d ago"] },
  { slug: "market-regime-memory", title: "Market Regime Memory", banner: "research",
    desc: "Historical regime classifications — bull, bear, chop, vol expansion / compression with VIX overlays.",
    stats: ["31 pages", "12y history", "1w ago"] },
  { slug: "mathematical-logic", title: "Mathematical Logic", banner: "philosophy",
    desc: "Course reference — propositional, predicate, modal, quantum. Lecture notes with worked exercises.",
    stats: ["26 pages", "85 refs", "2w ago"] },
];

