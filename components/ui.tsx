import React from "react";

type Tone = "blue" | "teal" | "amber" | "rose" | "violet";

const toneMap: Record<Tone, { dot: string; text: string }> = {
  blue: { dot: "bg-accent shadow-[0_0_12px_var(--accent)]", text: "text-accent" },
  teal: { dot: "bg-accent-teal shadow-[0_0_12px_var(--accent-teal)]", text: "text-accent-teal" },
  amber: { dot: "bg-accent-amber shadow-[0_0_12px_var(--accent-amber)]", text: "text-accent-amber" },
  rose: { dot: "bg-accent-rose shadow-[0_0_12px_var(--accent-rose)]", text: "text-accent-rose" },
  violet: { dot: "bg-accent-violet shadow-[0_0_12px_var(--accent-violet)]", text: "text-accent-violet" },
};

export function PageInner({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[1400px] px-10 pb-[60px] pt-8 max-[1024px]:px-6">{children}</div>;
}

export function PageHead({
  tag,
  tone = "blue",
  title,
  em,
  sub,
}: {
  tag: string;
  tone?: Tone;
  title: string;
  em?: string;
  sub: string;
}) {
  const t = toneMap[tone];
  return (
    <div className="mb-7">
      <div className={`mb-[14px] inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] ${t.text}`}>
        <span className={`h-[6px] w-[6px] rounded-full ${t.dot}`} />
        {tag}
      </div>
      <h1 className="mb-3 font-display text-[42px] font-medium leading-[1.05] tracking-[-0.025em] max-[1024px]:text-[34px]">
        {title}{" "}
        {em && (
          <em className="bg-gradient-to-br from-accent to-accent-hot bg-clip-text font-normal not-italic text-transparent [font-style:italic]">
            {em}
          </em>
        )}
      </h1>
      <p className="max-w-[640px] text-[14px] leading-relaxed text-ink-1">{sub}</p>
    </div>
  );
}

export function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[14px] flex items-center gap-[10px] font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[10px] border border-line bg-bg-1 px-5 py-[18px] ${className}`}>{children}</div>;
}
