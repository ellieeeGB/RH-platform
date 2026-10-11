"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, Bot, Database, Send, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { answerCopilot, copilotPrompts, type CopilotAnswer } from "@/lib/copilot-engine";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; answer: CopilotAnswer };

export function HRCopilot() {
  const initialAnswer = useMemo(() => answerCopilot("¿Qué cambió este bimestre?"), []);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", answer: initialAnswer },
  ]);
  const [question, setQuestion] = useState("");

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const stamp = Date.now();
    const answer = answerCopilot(trimmed);
    setMessages((current) => [
      ...current,
      { id: stamp, role: "user", text: trimmed },
      { id: stamp + 1, role: "assistant", answer },
    ]);
    setQuestion("");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(question);
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[.72fr_1.28fr]">
      <aside className="space-y-4">
        <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
          <div className="flex items-center justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400 text-slate-950"><Bot size={22} /></div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-300">Evidence Mode</span>
          </div>
          <h2 className="mt-5 text-2xl font-black leading-tight">Primero evidencia. Después lenguaje.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">Este prototipo no llama a un LLM. Clasifica la intención y responde exclusivamente desde los datasets agregados verificados. Así probamos la capa factual antes de añadir generación libre.</p>
          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><Database size={15} className="text-cyan-300" /><span className="text-slate-300">benchmark.json + People Intelligence + Rewards</span></div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><ShieldCheck size={15} className="text-emerald-300" /><span className="text-slate-300">Sin acceso a filas privadas de compañías</span></div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><Sparkles size={15} className="text-violet-300" /><span className="text-slate-300">Cada respuesta trae evidencia y ruta fuente</span></div>
          </div>
        </article>

        <article className="panel p-5">
          <div className="eyebrow">Preguntas sugeridas</div>
          <div className="mt-4 space-y-2">
            {copilotPrompts.map((prompt) => (
              <button key={prompt} onClick={() => ask(prompt)} className="w-full rounded-2xl border border-slate-100 bg-white p-3 text-left text-xs font-bold leading-5 text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50/50 hover:text-cyan-800">{prompt}</button>
            ))}
          </div>
        </article>
      </aside>

      <article className="panel flex min-h-[720px] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
          <div>
            <div className="text-sm font-extrabold text-slate-950">AI HR Copilot</div>
            <div className="mt-0.5 text-[11px] text-slate-400">Prototipo determinístico · Jul–Ago 2025 · mercado agregado</div>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">Grounded</div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/40 p-4 md:p-6">
          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end gap-3">
                  <div className="max-w-[78%] rounded-3xl rounded-tr-lg bg-slate-950 px-4 py-3 text-sm leading-6 text-white">{message.text}</div>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-200 text-slate-600"><UserRound size={17} /></div>
                </div>
              );
            }

            const answer = message.answer;
            return (
              <div key={message.id} className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-cyan-500 text-white"><Bot size={17} /></div>
                <div className="max-w-[92%] space-y-3">
                  <div className="rounded-3xl rounded-tl-lg border border-slate-100 bg-white p-4 shadow-sm md:p-5">
                    <div className="text-sm font-black text-slate-950">{answer.title}</div>
                    <p className="mb-0 mt-2 text-sm leading-6 text-slate-600">{answer.answer}</p>
                    {answer.caveat && <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>Nota:</strong> {answer.caveat}</div>}
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    {answer.evidence.map((item) => (
                      <a key={`${message.id}-${item.label}`} href={item.href} className="rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-cyan-200 hover:shadow-sm">
                        <div className="flex items-start justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-wide text-slate-400">{item.label}</span><ArrowUpRight size={12} className="text-cyan-600" /></div>
                        <div className="mt-2 text-lg font-black text-slate-950">{item.value}</div>
                        <div className="mt-1 truncate text-[9px] text-slate-300">{item.source}</div>
                      </a>
                    ))}
                  </div>

                  <a href={answer.actionHref} className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800">{answer.action}<ArrowUpRight size={13} /></a>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={submit} className="border-t border-slate-100 bg-white p-4 md:p-5">
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-cyan-300 focus-within:ring-4 focus-within:ring-cyan-50">
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Pregunta por rotación, salario, contratación, beneficios, riesgo o calidad…" className="min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-300" />
            <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"><Send size={16} /></button>
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-300">Las respuestas actuales son plantillas basadas en evidencia; no son asesoría automática ni inferencias causales.</div>
        </form>
      </article>
    </section>
  );
}
