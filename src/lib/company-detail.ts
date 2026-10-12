import rawDetails from '../../data/processed/company-detail.json';
import { completeHeadcount, getPeriodSnapshots, MARKET_SCOPE, median } from './company-panel';
type Detail = {company:string;period:string;monthlyExits1:number|null;monthlyExits2:number|null;technicalRoles:{name:string;minimum:number|null;average:number|null;maximum:number|null;people:number|null}[];ttfOperationalStatus:string;ttfTechnicalStatus:string;ttfAdministrativeStatus:string;ttfManagerialStatus:string};
const details = rawDetails as {periods:typeof rawDetails.periods;records:Detail[]};
export const MONTH_PERIODS = details.periods;
export const getDetails = (company: string, period: string) => details.records.filter(r => r.period === period && (company === MARKET_SCOPE || r.company === company));
export function monthlyExitSummary(company: string, period: string, month: string) {
  const p = MONTH_PERIODS.find(p => p.label === period);
  const index = p?.months.findIndex(m => m.id === month) ?? -1;
  if (!p?.monthlyAvailable || index < 0) return { count: null, rate: null, n: 0 };
  const records = getDetails(company, period);
  const value = (r: typeof records[number]) => index === 0 ? r.monthlyExits1 : r.monthlyExits2;
  const valid = records.filter(r => value(r) !== null);
  const rows = getPeriodSnapshots(period);
  const pairs = valid.map(r => ({exits: value(r)!, hc: completeHeadcount(rows.find(x => x.company === r.company)!)})).filter(r => r.hc !== null && r.hc > 0);
  return {count: valid.length ? valid.reduce((s,r) => s + value(r)!, 0) : null, rate: pairs.length ? pairs.reduce((s,r) => s + r.exits,0)/pairs.reduce((s,r) => s+r.hc!,0)*100 : null,n:pairs.length};
}
function quantile(values: number[], q: number) { const a = [...values].sort((a,b)=>a-b);if(!a.length)return null;const i=(a.length-1)*q,l=Math.floor(i);return a[l]+(a[Math.ceil(i)]-a[l])*(i-l); }
export function technicalTable(company: string, period: string) {
  const market = getDetails(MARKET_SCOPE,period), own = getDetails(company,period);
  const names = [...new Set(market.flatMap(r => r.technicalRoles.map(x => x.name)))];
  return names.map(name => {
    const roles = market.flatMap(r => r.technicalRoles).filter(x => x.name===name);
    const valid = roles.filter(x => x.average !== null && x.average > 0 && (x.minimum===null || x.average>=x.minimum) && (x.maximum===null || x.average<=x.maximum));
    const values = valid.map(x => x.average!);
    return {name,q1:quantile(values,.25),median:median(values),q3:quantile(values,.75),n:values.length,own:median(own.flatMap(r=>r.technicalRoles).filter(x=>x.name===name).map(x=>x.average))};
  }).filter(r=>r.n>0||r.own!==null);
}
export function downloadCsv(rows: (string | number | null)[][], filename: string) {
  const csv='\uFEFF'+rows.map(r=>r.map(v=>{const text=String(v??'');return '"'+(typeof v==='string'&&/^[\s]*[=+@-]/.test(text)?"'"+text:text).replace(/"/g,'""')+'"';}).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
