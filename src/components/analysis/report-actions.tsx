"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export function ReportActions() {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print-hidden">
      <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm">
        <ArrowLeft size={14} /> Volver al dashboard
      </Link>
      <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm">
        <Printer size={14} /> Imprimir / Guardar PDF
      </button>
    </div>
  );
}
