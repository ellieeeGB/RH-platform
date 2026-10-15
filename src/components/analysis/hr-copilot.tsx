"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Bot, Database, Send, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useFilters } from "@/components/filters/filter-context";
import { answerCopilot, copilotPrompts, type CopilotAnswer, type CopilotScope } from "@/lib/copilot-engine";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; answer: CopilotAnswer };

export function HRCopilot() {
  const {company,period} = useFilters();
  return <Conversation key={`${company}|${period}`} scope={{company,period}} />;
}

function Conversation({scope}:{scope:CopilotScope}) {
  const scopeLabel = `${scope.company === "market" ? "Mercado completo" : scope.company} · ${scope.period}`;
  const [messages, setMessages] = useState<Message[]>(() => [
    {id:1, role:"assistant", answer:answerCopilot("Dame un resumen de mi selección",scope)},
  ]);
  const log = useRef<HTMLDivElement>(null);
  const sequence = useRef(2);
  useEffect(() => { if(log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages]);
  const [question, setQuestion] = useState("");

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const stamp = sequence.current;
    sequence.current += 2;
    const answer = answerCopilot(trimmed, scope);
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
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-300">Con evidencia</span>
          </div>
          <h2 className="mt-5 text-2xl font-black leading-tight">Pregunta sobre tu empresa y tu bimestre.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">Consulta los indicadores de tu selección, compara respuestas completas y encuentra qué conviene revisar antes de decidir.</p>
          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><Database size={15} className="text-cyan-300" /><span className="text-slate-300">Cifras calculadas desde el estudio de RH</span></div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><ShieldCheck size={15} className="text-emerald-300" /><span className="text-slate-300">Empresa y periodo visibles en cada respuesta</span></div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><Sparkles size={15} className="text-violet-300" /><span className="text-slate-300">Abre el indicador que respalda la respuesta</span></div>
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

      <article className="panel flex min-w-0 min-h-[520px] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
          <div>
            <div className="text-sm font-extrabold text-slate-950">Asistente de análisis</div>
            <div className="mt-0.5 text-xs text-slate-600">{scopeLabel}</div>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">Datos del estudio</div>
        </div>

        <div ref={log} role="log" aria-label="Conversación de análisis" aria-live="polite" className="max-h-[65vh] min-h-[300px] flex-1 space-y-5 overflow-y-auto bg-slate-50/40 p-4 md:p-6">
          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end gap-3">
                  <div className="max-w-[78%] [overflow-wrap:anywhere] rounded-3xl rounded-tr-lg bg-slate-950 px-4 py-3 text-sm leading-6 text-white">{message.text}</div>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-200 text-slate-600"><UserRound size={17} /></div>
                </div>
              );
            }

            const answer = message.answer;
            return (
              <div key={message.id} className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-cyan-500 text-white"><Bot size={17} /></div>
                <div className="min-w-0 flex-1 space-y-3 [overflow-wrap:anywhere]">
                  <div className="rounded-3xl rounded-tl-lg border border-slate-100 bg-white p-4 shadow-sm md:p-5">
                    <div className="mb-2 text-xs font-semibold text-cyan-800">{answer.scope.company === "market" ? "Mercado completo" : answer.scope.company} · {answer.scope.period}</div>
                    <div className="text-sm font-black text-slate-950">{answer.title}</div>
                    <p className="mb-0 mt-2 text-sm leading-6 text-slate-600">{answer.answer}</p>
                    {answer.caveat && <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>Nota:</strong> {answer.caveat}</div>}
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    {answer.evidence.map((item) => (
                      <Link key={`${message.id}-${item.label}`} href={item.href} className="rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-cyan-200 hover:shadow-sm">
                        <div className="flex items-start justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-wide text-slate-400">{item.label}</span><ArrowUpRight size={12} className="text-cyan-600" /></div>
                        <div className="mt-2 text-lg font-black text-slate-950">{item.value}</div>
                        <div className="mt-1 text-[11px] leading-5 text-slate-500">{item.source}</div>
                      </Link>
                    ))}
                  </div>

                  <Link href={answer.actionHref} className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800">{answer.action}<ArrowUpRight size={13} /></Link>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={submit} className="border-t border-slate-100 bg-white p-4 md:p-5">
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-cyan-300 focus-within:ring-4 focus-within:ring-cyan-50">
            <input aria-label="Pregunta sobre la selección activa" maxLength={500} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Pregunta por rotación, salario, contratación, beneficios, riesgo o calidad…" className="min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-300" />
            <button type="submit" aria-label="Enviar pregunta" disabled={!question.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white disabled:opacity-40"><Send size={16} /></button>
          </div>
          <div className="mt-2 text-center text-xs leading-5 text-slate-500">Asistente de consultas guiadas. Al cambiar empresa o periodo, comienza una conversación con esa selección.</div>
        </form>
      </article>
    </section>
  );
}
