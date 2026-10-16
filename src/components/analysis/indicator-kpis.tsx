"use client";
import { Clock3, BriefcaseBusiness, UserCheck, Activity } from "lucide-react";
import { useFilters } from "@/components/filters/filter-context";
import { DataQuality, MetricValue, Proportion, Sparkline, StatusChip, type Tone } from "@/components/ui/data-visuals";
import { deriveScopeMetrics, getMarketSnapshot, getScopeSnapshot, getPeriodSnapshots, PERIODS, MARKET_SCOPE, type CompanySnapshot } from "@/lib/company-panel";

export function IndicatorKpis() {
  const {company,period,isMarket}=useFilters();
  const own=getScopeSnapshot(company,period), market=getMarketSnapshot(period), metrics=deriveScopeMetrics(own);
  const rows=[
    {label:"Cobertura operativa",value:own?.timeToFill.operational??null,market:market.timeToFill.operational,suffix:" días",Icon:Clock3,get:(r:CompanySnapshot)=>r.timeToFill.operational,lowBetter:true},
    {label:"Cobertura técnica",value:own?.timeToFill.technical??null,market:market.timeToFill.technical,suffix:" días",Icon:BriefcaseBusiness,get:(r:CompanySnapshot)=>r.timeToFill.technical,lowBetter:true},
    {label:"Candidatos adecuados",value:own?.acceptedPer10??null,market:market.acceptedPer10,suffix:"/10",Icon:UserCheck,get:(r:CompanySnapshot)=>r.acceptedPer10,lowBetter:false},
    {label:"Vacantes próximas",value:own?.vacancies.total??null,market:null,suffix:"",Icon:Activity,get:(r:CompanySnapshot)=>r.vacancies.operational!==null&&r.vacancies.administrative!==null?r.vacancies.total:null,lowBetter:null},
  ];
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{rows.map((row,i)=>{
    const panels=PERIODS.map(cut=>getPeriodSnapshots(cut).filter(r=>company===MARKET_SCOPE||r.company===company));
    const common=panels[0].filter(r=>panels.every(panel=>panel.some(p=>p.company===r.company&&row.get(p)!==null))).map(r=>r.company);
    const series=panels.map(panel=>{const values=panel.filter(r=>common.includes(r.company)).map(r=>row.get(r)!).sort((a,b)=>a-b);if(values.length<(isMarket?5:1))return null;return i===3?values.reduce((a,b)=>a+b,0):(values[Math.floor((values.length-1)/2)]+values[Math.floor(values.length/2)])/2;});
    let tone:Tone="neutral",state="Referencia de mercado";
    if(row.value===null) state="Información pendiente";
    else if(i===3) {state="Planear cobertura";tone="attention";}
    else if(!isMarket&&row.market!==null) {const delta=row.value-row.market;const better=row.lowBetter?delta<0:delta>0;tone=delta===0?"neutral":better?"good":"attention";state=delta===0?"Al nivel del mercado":better?"Mejor que el mercado":"Requiere atención";}
    return <article key={row.label} className="kpi-editorial operational-kpi"><div className="kpi-heading"><span>{row.label}</span><row.Icon size={18}/></div><div className="kpi-value"><MetricValue amount={row.value}>{row.value===null?"—":`${row.value.toLocaleString("es-MX")}${row.suffix}`}</MetricValue></div><StatusChip tone={tone}>{state}</StatusChip><p className="kpi-interpretation">{i===3?"Prioriza por impacto y fecha requerida.":i===2?"Revisa dónde se descartan los candidatos.":"Localiza las esperas del proceso de contratación."}</p>
      {i===2&&<Proportion value={row.value} total={10} label={`${row.value??"—"} de cada 10 candidatos adecuados`}/>}
      {i===3&&<Proportion value={metrics.hiringPressurePct} label={`${metrics.hiringPressurePct?.toFixed(1)??"—"}% de la plantilla emparejada`}/>}
      <Sparkline values={series} labels={PERIODS} selected={PERIODS.indexOf(period)} label={`${row.label}; grupo fijo del historial`}/>
      <DataQuality different={isMarket}><p>{isMarket?"La cifra principal usa las respuestas disponibles del corte; la tendencia conserva el mismo grupo en siete bimestres.":"La cifra y la tendencia corresponden a la compañía seleccionada."} Tendencia: {common.length} empresas con respuesta completa. {i===3?"Las vacantes de la tasa y su plantilla pertenecen a las mismas empresas; pueden diferir del total de vacantes reportadas.":`Referencia de mercado: ${row.market??"sin dato"}${row.suffix}, mediana del mismo bimestre.`}</p></DataQuality></article>;
  })}</section>;
}
