import assert from "node:assert/strict";
import test from "node:test";
import { answerCopilot } from "../src/lib/copilot-engine";
import { deriveScopeMetrics, getScopeSnapshot, getCompanySnapshot } from "../src/lib/company-panel";
import { qualityReport } from "../src/lib/data-quality";
import { analyzeSignal } from "../src/lib/signal-analysis";
const scope={company:"COMPAÑIA 2",period:"Jul-Ago 25"};

test("latest market retention discloses the restricted six-company sample",()=>{
 const a=answerCopilot("¿Qué pasa con la rotación?");assert.equal(a.intent,"retention");assert.ok(a.answer.includes("54.5%"));assert.ok(a.answer.includes("Solo 6 empresas"));
});
test("company retention does not borrow market tenure patterns",()=>{
 const a=answerCopilot("bajas",scope),m=deriveScopeMetrics(getScopeSnapshot(scope.company,scope.period));
 assert.deepEqual(a.scope,scope);assert.equal(a.evidence[2].value,String(m.coverage.exits));assert.ok(!a.answer.includes("54.5%"));assert.ok(a.answer.includes("No hay un desglose validado"));
});
test("prior periods do not receive latest market aggregates",()=>{
 const s={company:"market",period:"Jul-Ago 24"},a=answerCopilot("resumen",s);
 assert.deepEqual(a.scope,s);assert.equal(a.evidence[0].value,"35,948");assert.ok(!answerCopilot("retención",s).answer.includes("54.5%"));
});
test("salary benchmark excludes the selected company and uses the chosen cut",()=>{
 const a=answerCopilot("salario",scope);assert.equal(a.intent,"compensation");assert.equal(a.actionHref,"/benchmark");
 assert.equal(a.evidence[0].value,new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:2}).format(getCompanySnapshot(scope.company,scope.period)!.salaryDaily.entry!));
 assert.ok(a.answer.includes("excluye a la empresa seleccionada"));assert.ok(a.evidence.every(e=>e.source.includes(scope.period)));
});
test("data missing routes to quality before the absence keyword",()=>{
 const a=answerCopilot("¿Qué datos faltan?",scope),r=qualityReport(scope.period,scope.company);
 assert.equal(a.intent,"quality");assert.equal(a.evidence[2].value,String(r.missing));assert.ok(a.caveat?.includes("no equivale a confianza estadística"));
});
test("change questions use matched companies and disclose the leading contribution",()=>{
 const a=answerCopilot("¿Qué cambió en las bajas entre las mismas empresas?"),r=analyzeSignal("exits","Jul-Ago 25");
 assert.equal(a.intent,"signals");assert.equal(a.evidence[1].value,String(r.n));assert.ok(a.answer.includes(r.contributors[0].company));
});
test("the first period cannot invent a previous comparison",()=>{
 const a=answerCopilot("qué cambió",{company:"market",period:"Jul-Ago 24"});assert.equal(a.intent,"signals");assert.equal(a.evidence.length,0);assert.ok(a.answer.includes("primer corte"));
});
test("unsupported and conflicting requests cannot silently answer another question",()=>{
 for(const question of ["¿Cuál es el clima?","pronostica la rotación","salario de empresa 3","salario en 2024","bajas de julio","fuentes de reclutamiento"])assert.equal(answerCopilot(question,scope).intent,"unsupported",question);
 assert.equal(answerCopilot("resumen",{company:"COMPAÑIA 99",period:"Jul-Ago 25"}).intent,"unsupported");
});
test("unknown benefit responses remain missing, explicit no remains no",()=>{
 for(let i=1;i<=40;i++){
  const s={company:`COMPAÑIA ${i}`,period:"Jul-Ago 25"},r=getCompanySnapshot(s.company,s.period)!;
  const a=answerCopilot("prestaciones",s);
  const values=[r.benefits.lifeInsurance,r.benefits.transport,r.benefits.cafeteria];
  assert.deepEqual(a.evidence.map(e=>e.value),values.map(v=>v===null?"Sin dato":v?"Sí":"No"));
 }
});
