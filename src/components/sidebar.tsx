"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { navigation } from "@/lib/navigation";

function CatchMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner shadow-white/5">
      <span className="text-xl font-black tracking-[-0.12em] text-cyan-300">C</span>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[292px] shrink-0 overflow-hidden border-r border-white/10 bg-[#07182d] text-white lg:flex lg:flex-col">
      <div className="relative border-b border-white/10 px-6 py-6">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <CatchMark />
          <div>
            <div className="text-[15px] font-black tracking-tight">Catch Consulting</div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">Intelligence OS</div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Vista actual</div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white">Benchmark RH</div>
            <div className="mt-0.5 text-[11px] text-slate-400">40 empresas · 7 bimestres</div>
          </div>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,.65)]" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[.19em] text-slate-500">{group.label}</div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href ? pathname === item.href : false;
                const className = `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition duration-200 ${
                  active
                    ? "bg-white/[0.11] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                    : item.href
                      ? "text-slate-400 hover:bg-white/[0.055] hover:text-white"
                      : "cursor-default text-slate-600"
                }`;

                return item.href ? (
                  <Link key={item.label} href={item.href} className={className}>
                    {active && <span className="absolute left-0 h-5 w-0.5 rounded-full bg-cyan-300" />}
                    <Icon size={17} strokeWidth={1.8} className={active ? "text-cyan-300" : "text-slate-500 group-hover:text-cyan-300"} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ) : (
                  <div key={item.label} className={className}>
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link href="/copilot" className="group block rounded-2xl bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-violet-400/10 p-4 ring-1 ring-inset ring-white/10 transition hover:ring-cyan-300/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-cyan-200">
              <Sparkles size={15} /> Catch Copilot
            </div>
            <ArrowUpRight size={15} className="text-slate-500 transition group-hover:text-cyan-200" />
          </div>
          <p className="mb-0 mt-2 text-[11px] leading-5 text-slate-400">Pregunta qué cambió, por qué importa y qué conviene hacer.</p>
        </Link>
      </div>
    </aside>
  );
}
