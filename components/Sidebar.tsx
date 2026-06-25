"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { NavSectionDef } from "@/lib/types";

// Inner component isolates useSearchParams so the outer Sidebar can be
// statically prerendered — Next.js requires a Suspense boundary around any
// component that calls useSearchParams.
function SidebarNav({ nav }: { nav: NavSectionDef[] }) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const isActive = (route: string) => {
    const [routePath, routeQuery] = route.split("?");
    if (pathname !== routePath) {
      return route === "/wikis" && pathname.startsWith("/wikis");
    }
    if (routeQuery) {
      const required = new URLSearchParams(routeQuery);
      for (const [k, v] of required) {
        if (searchParams.get(k) !== v) return false;
      }
      return true;
    }
    return !searchParams.toString();
  };

  return (
    <nav className="flex-1 overflow-y-auto px-[10px]">
      {nav.map((section) => (
        <div key={section.title}>
          <div className="px-[14px] pb-[6px] pt-[18px] font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
            {section.title}
          </div>
          {section.items.map((item) => {
            const active = isActive(item.route);
            return (
              <Link
                key={item.route}
                href={item.route}
                className={`relative mb-[1px] flex items-center gap-[11px] rounded-md px-3 py-2 text-[13px] transition-colors ${
                  active
                    ? "bg-gradient-to-r from-[rgba(77,141,255,0.15)] to-[rgba(77,141,255,0.03)] text-ink-0"
                    : "text-ink-1 hover:bg-[rgba(77,141,255,0.06)] hover:text-ink-0"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-sm bg-accent shadow-[0_0_8px_var(--accent)]" />
                )}
                <span className="inline-flex h-[14px] w-[14px] items-center justify-center opacity-80">
                  {item.icon}
                </span>
                {item.label}
                {item.badge && (
                  <span
                    className={`ml-auto rounded-[3px] px-[6px] py-[2px] font-mono text-[9px] ${
                      item.badgeKind === "live"
                        ? "bg-[rgba(45,212,191,0.12)] text-accent-teal"
                        : item.badgeKind === "warn"
                        ? "bg-[rgba(245,183,72,0.12)] text-accent-amber"
                        : "bg-bg-3 text-ink-2"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({ nav }: { nav: NavSectionDef[] }) {
  return (
    <aside className="flex flex-col overflow-hidden border-r border-line bg-gradient-to-b from-bg-1 to-bg-0">
      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-3 border-b border-line px-[22px] py-[18px] pt-[22px]">
        <div className="brand-mark relative h-8 w-8 overflow-hidden rounded-lg" />
        <div className="leading-tight">
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-ink-2">Alpha Data Architects</div>
          <div className="font-display text-base font-semibold tracking-tight">AI Labs</div>
        </div>
      </Link>

      {/* Nav — Suspense required by Next.js for useSearchParams */}
      <Suspense fallback={<div className="flex-1" />}>
        <SidebarNav nav={nav} />
      </Suspense>

      {/* Profile */}
      <div className="flex items-center gap-[11px] border-t border-line bg-bg-1 p-[14px]">
        <div className="avatar relative grid h-[34px] w-[34px] place-items-center rounded-full bg-gradient-to-br from-accent-hot to-accent-rose font-display text-sm font-bold text-white">
          A
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[13px] font-medium">Atila Bayat</div>
          <div className="mt-[2px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-2">
            Founder · Research Dir
          </div>
        </div>
        <div className="text-ink-3">⌃</div>
      </div>
    </aside>
  );
}
