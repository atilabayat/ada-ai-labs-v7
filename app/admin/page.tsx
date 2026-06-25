import { PageInner, PageHead, Panel } from "@/components/ui";

const KEYS = [
  // LLM / Inference
  { name: "Anthropic",         val: "sk-ant-api03-••••••••••••••••••••••••3f9a", status: "ACTIVE",   ok: true,  group: "LLM" },
  { name: "Fireworks AI",      val: "fw_••••••••••••••••••••••••f3d2",           status: "ACTIVE",   ok: true,  group: "LLM" },
  // Embeddings / Vector
  { name: "Voyage AI",         val: "pa-••••••••••••••••••••••••neOa",           status: "ACTIVE",   ok: true,  group: "Embeddings" },
  // Market Data
  { name: "Tradier",           val: "trd_••••••••••••••••••••••••8829",          status: "ACTIVE",   ok: true,  group: "Market" },
  { name: "Flash Alpha",       val: "ewOG••••••••••••••••••••••••rIDDd",         status: "FREE PLAN", ok: true, group: "Market" },
  // Web Research
  { name: "Tavily",            val: "tvly-dev-••••••••••••••••••••••••we9y9",    status: "ACTIVE",   ok: true,  group: "Research" },
  { name: "Brave Search",      val: "BSA3••••••••••••••••••••••••Ps248uh",       status: "ACTIVE",   ok: true,  group: "Research" },
  { name: "Exa",               val: "cdb1••••••••••••••••••••••••6ef682",        status: "ACTIVE",   ok: true,  group: "Research" },
  // Academic
  { name: "Semantic Scholar",  val: "s2k-p3••••••••••••••••••••••••IDDd",       status: "ACTIVE",   ok: true,  group: "Academic" },
  { name: "CORE Open Access",  val: "1mvu••••••••••••••••••••••••XCRN",          status: "ACTIVE",   ok: true,  group: "Academic" },
  // Economic / News
  { name: "FRED",              val: "c197••••••••••••••••••••••••5a665",         status: "ACTIVE",   ok: true,  group: "Economic" },
  { name: "NewsAPI",           val: "1ed8••••••••••••••••••••••••1653",          status: "ACTIVE",   ok: true,  group: "News" },
  { name: "MediaStack",        val: "9961••••••••••••••••••••••••87bb",          status: "ACTIVE",   ok: true,  group: "News" },
  // Corporate
  { name: "OpenCorporates",    val: "— not configured —",                         status: "NOT SET",  ok: false, group: "Corporate" },
];

const HEALTH = [
  { name: "Orchestrator", pct: 94, warn: false },
  { name: "Postgres", pct: 98, warn: false },
  { name: "Qdrant", pct: 62, warn: true },
  { name: "Redis Cache", pct: 88, warn: false },
  { name: "Storage", pct: 71, warn: false },
  { name: "Agents Pool", pct: 84, warn: false },
];

const AUDIT: { dot: string; text: React.ReactNode; time: string }[] = [
  { dot: "bg-accent-teal", text: <><span className="font-medium text-ink-0">atila.bayat</span> promoted IPA Compendium dev → staging</>, time: "1h ago" },
  { dot: "bg-accent", text: <><span className="font-medium text-ink-0">atila.bayat</span> created new skill /vix-regime</>, time: "3h ago" },
  { dot: "bg-accent-amber", text: <><span className="font-medium text-ink-0">system</span> rotated Tradier key (auto-renewal)</>, time: "yesterday" },
  { dot: "bg-accent", text: <><span className="font-medium text-ink-0">atila.bayat</span> deployed Peirce Lattice to production</>, time: "2d ago" },
  { dot: "bg-accent-rose", text: <><span className="font-medium text-ink-0">orchestrator</span> rolled back failed deployment</>, time: "4d ago" },
];

const SETTINGS: [string, string, string?][] = [
  ["organization", "alpha-data-architects"],
  ["workspace", "ada-ai-labs"],
  ["region", "us-east-1"],
  ["plan", "RESEARCH · SANDBOX", "text-accent-amber"],
  ["owner", "atilab@alphadataarchitects.com"],
  ["seats", "1 / 1"],
  ["created", "2026-04-12"],
  ["build", "0.3.0-beta"],
];

export default function AdminPage() {
  return (
    <PageInner>
      <PageHead
        tag="Administration · Restricted"
        tone="amber"
        title="System"
        em="governance."
        sub="API keys, system health, user permissions, audit trail. Visible to workspace owner only."
      />

      <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <div className="font-display text-[18px] font-medium">API Keys &amp; Secrets</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">{KEYS.length} keys · {KEYS.filter(k => k.ok).length} active</div>
          </div>
          <div className="max-h-[420px] overflow-y-auto pr-1">
            {(() => {
              const groups = Array.from(new Set(KEYS.map(k => k.group)));
              return groups.map(g => (
                <div key={g}>
                  <div className="mb-[4px] mt-[10px] font-mono text-[8px] uppercase tracking-[0.14em] text-ink-3 first:mt-0">{g}</div>
                  {KEYS.filter(k => k.group === g).map((k) => (
                    <div key={k.name} className="flex items-center gap-3 border-b border-line py-[8px] font-mono text-[12px] last:border-0">
                      <span className="w-[130px] shrink-0 text-ink-0">{k.name}</span>
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded bg-bg-2 px-2 py-1 text-[11px] text-ink-2">{k.val}</span>
                      <span className={`shrink-0 text-[9px] uppercase tracking-[0.1em] ${k.ok ? "text-accent-teal" : k.status === "NOT SET" ? "text-ink-3" : "text-accent-amber"}`}>{k.status}</span>
                    </div>
                  ))}
                </div>
              ));
            })()}
          </div>
        </Panel>

        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <div className="font-display text-[18px] font-medium">System Health</div>
            <div className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.1em] text-accent hover:text-ink-0">View Logs →</div>
          </div>
          {HEALTH.map((h) => (
            <div key={h.name} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
              <span className="w-[130px] text-[13px] text-ink-0">{h.name}</span>
              <div className="h-[6px] flex-1 overflow-hidden rounded-[3px] bg-bg-3">
                <div className={`h-full rounded-[3px] ${h.warn ? "bg-accent-amber" : "bg-accent-teal"}`} style={{ width: `${h.pct}%` }} />
              </div>
              <span className="w-10 text-right font-mono text-[11px] text-ink-1">{h.pct}%</span>
            </div>
          ))}
        </Panel>

        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <div className="font-display text-[18px] font-medium">Audit Trail</div>
            <div className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.1em] text-accent hover:text-ink-0">Export →</div>
          </div>
          {AUDIT.map((a, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-line py-[10px] text-[13px] last:border-0">
              <span className={`h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_8px_currentColor] ${a.dot}`} />
              <span className="flex-1 text-ink-1">{a.text}</span>
              <span className="font-mono text-[10px] text-ink-3">{a.time}</span>
            </div>
          ))}
        </Panel>

        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <div className="font-display text-[18px] font-medium">Workspace Settings</div>
            <div className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.1em] text-accent hover:text-ink-0">Edit →</div>
          </div>
          <div className="font-mono text-[11px] leading-loose text-ink-1">
            {SETTINGS.map(([k, v, c]) => (
              <div key={k} className="flex justify-between">
                <span className="text-ink-3">{k}</span>
                <span className={c ?? ""}>{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PageInner>
  );
}
