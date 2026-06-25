"use client";

import { useState } from "react";
import { Skill } from "@/lib/types";
import { SkillTab } from "@/lib/queries";

const catTone: Record<string, string> = {
  research:  "bg-[rgba(77,141,255,0.12)] text-accent",
  quant:     "bg-[rgba(245,183,72,0.12)] text-accent-amber",
  dev:       "bg-[rgba(45,212,191,0.12)] text-accent-teal",
  knowledge: "bg-[rgba(255,86,119,0.12)] text-accent-rose",
};

const catDot: Record<string, string> = {
  research:  "bg-accent",
  quant:     "bg-accent-amber",
  dev:       "bg-accent-teal",
  knowledge: "bg-accent-rose",
};

function SkillCard({ s }: { s: Skill }) {
  return (
    <div className="cursor-pointer rounded-[10px] border border-line bg-bg-1 px-[18px] py-4 transition-colors hover:border-line-strong hover:bg-bg-2">
      <div className="mb-[10px] flex items-center gap-[10px]">
        <span className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${catDot[s.cat] ?? "bg-ink-3"} shadow-[0_0_5px_currentColor]`} />
        <div className="font-mono text-[13px] font-medium text-ink-0">{s.name}</div>
        <div className={`ml-auto rounded-[3px] px-[7px] py-px font-mono text-[9px] uppercase tracking-[0.1em] ${catTone[s.cat] ?? "bg-bg-3 text-ink-3"}`}>{s.cat}</div>
      </div>
      <div className="mb-[10px] text-[12px] leading-relaxed text-ink-2">{s.desc}</div>
      <div className="flex gap-[14px] border-t border-line pt-[10px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
        <span>v{s.ver}</span>
        <span>{s.uses} uses</span>
      </div>
    </div>
  );
}

export default function SkillsList({ skills, tabs }: { skills: Skill[]; tabs: SkillTab[] }) {
  const [tab, setTab] = useState("all");
  const list = tab === "all" ? skills : skills.filter((s) => s.cat === tab);

  // Group by s.group, preserving insertion order
  const groups = list.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <div className="mb-5 flex gap-[6px] border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-[10px] font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              tab === t.id ? "border-accent text-ink-0" : "border-transparent text-ink-2 hover:text-ink-0"
            }`}
          >
            {t.label} <span className="ml-1 text-ink-3">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {Object.entries(groups).map(([group, items]) => (
          <section key={group}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">{group}</h3>
              <span className="font-mono text-[9px] text-ink-3 opacity-60">{items.length}</span>
              <div className="flex-1 border-t border-line" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
              {items.map((s) => <SkillCard key={s.id} s={s} />)}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
