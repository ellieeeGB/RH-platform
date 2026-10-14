"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { COMPANIES, MARKET_SCOPE, PERIODS } from "@/lib/company-panel";
import { MONTH_PERIODS } from "@/lib/company-detail";
type FilterContextValue = {
  period: string; company: string; month: string; monthLabel: string; periods: string[]; companies: string[];
  setPeriod: (period: string) => void; setCompany: (company: string) => void; setMonth: (month: string) => void;
  companyLabel: string; isMarket: boolean;
};
const FilterContext = createContext<FilterContextValue | null>(null);
const persist=(key:string,value:string)=>{try{window.localStorage.setItem(key,value);}catch{}};
export function FilterProvider({children}:{children:React.ReactNode}){
  const [period,setPeriodState]=useState(PERIODS.at(-1)!);
  const [company,setCompanyState]=useState(MARKET_SCOPE);
  const [month,setMonthState]=useState('all');
  useEffect(()=>{try{
    const p=localStorage.getItem('catch.period'),c=localStorage.getItem('catch.company'),m=localStorage.getItem('catch.month');
    // Reuse the older hosted edition's selection only until the new keys exist.
    if (!p && !c) {
      const legacy = JSON.parse(localStorage.getItem('catch.filters') ?? 'null');
      const oldPeriod = MONTH_PERIODS.find(item => item.months[0].id === legacy?.period);
      if (oldPeriod) setPeriodState(oldPeriod.label);
      if (legacy?.company === MARKET_SCOPE || COMPANIES.includes(legacy?.company)) setCompanyState(legacy.company);
      if (oldPeriod?.months.some(item => item.id === legacy?.month)) setMonthState(legacy.month);
    }
    if(p&&PERIODS.includes(p))setPeriodState(p);
    if(c&&(c===MARKET_SCOPE||COMPANIES.includes(c)))setCompanyState(c);
    const match=MONTH_PERIODS.find(p=>p.months.some(x=>x.id===m));
    if(match&&m){setPeriodState(match.label);setMonthState(m);}
  }catch{}
    const oldRoutes: Record<string, string> = {overview:"/",plantilla:"/contexto/",compensacion:"/salarios/",reclutamiento:"/talent-acquisition/",retencion:"/retencion/",planeacion:"/workforce-planning/",ausentismo:"/labor-risk/",beneficios:"/beneficios/",laborales:"/relaciones-laborales/",benchmark:"/benchmark/",tabulador:"/tabulador/",escenarios:"/what-if/",reportes:"/reportes/",signals:"/decisiones/#bitacora","action-board":"/decisiones/#bitacora"};
    if (window.location.pathname === "/" && oldRoutes[window.location.hash.slice(1)]) window.location.replace(oldRoutes[window.location.hash.slice(1)]);
  },[]);
  const setPeriod=(p:string)=>{if(!PERIODS.includes(p))return;setPeriodState(p);setMonthState('all');persist('catch.period',p);persist('catch.month','all');};
  const setCompany=(c:string)=>{if(c!==MARKET_SCOPE&&!COMPANIES.includes(c))return;setCompanyState(c);persist('catch.company',c);};
  const setMonth=(m:string)=>{if(m==='all'){setMonthState(m);persist('catch.month',m);return;}const p=MONTH_PERIODS.find(p=>p.months.some(x=>x.id===m));if(!p)return;setPeriodState(p.label);setMonthState(m);persist('catch.period',p.label);persist('catch.month',m);};
  const value=useMemo(()=>({period,company,month,monthLabel:MONTH_PERIODS.flatMap(p=>p.months).find(m=>m.id===month)?.label??'Bimestre completo',periods:PERIODS,companies:COMPANIES,setPeriod,setCompany,setMonth,isMarket:company===MARKET_SCOPE,companyLabel:company===MARKET_SCOPE?'Mercado completo':company}),[period,company,month]);
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}
export function useFilters(){const context=useContext(FilterContext);if(!context)throw new Error('useFilters must be used inside FilterProvider');return context;}
