import { Sparkles } from "lucide-react";
import { navigation } from "@/lib/navigation";

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-[274px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-sm font-black text-white">RH</div>
        <div>
          <div className="font-extrabold tracking-tight text-slate-900">People Intelligence</div>
          <div className="text-xs text-slate-400">Decision system</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {navigation.map((group) => (
          <div key={group.label} className="mb-7">
            <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">{group.label}</div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      item.active
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="m-4 rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-cyan-800">
          <Sparkles size={15} /> AI copiloto
        </div>
        <p className="m-0 text-xs leading-5 text-slate-600">Pregunta qué cambió, qué riesgo aumentó o qué métrica merece atención.</p>
      </div>
    </aside>
  );
}
