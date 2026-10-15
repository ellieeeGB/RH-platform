import test from "node:test";
import assert from "node:assert/strict";
import { executiveReading } from "../src/lib/executive-reading";
import { compareObservations, type ComparisonMetric, type Observation } from "../src/lib/selection-comparison";

function result(before: Observation[], after: Observation[], metric: ComparisonMetric = "turnover") {
  const cuts=[{id:"first",label:"May-Jun 25",period:"May-Jun 25",date:"2025-05"},{id:"last",label:"Jul-Ago 25",period:"Jul-Ago 25",date:"2025-07"}];
  const common=compareObservations([{id:"first",rows:before},{id:"last",rows:after}],metric);
  const ids=[...new Set([...before,...after].map(r=>r.company))];
  return {metric,cuts,rows:ids.map(company=>({company,values:[]})),...common};
}
const observation=(company:string,numerator:number|null,denominator=100):Observation=>({company,numerator,denominator});

test("executive wording does not invent a trend when the responding companies change",()=>{
  const data=result([observation("A",1)],[observation("B",100)]);
  const reading=executiveReading(data);
  assert.equal(reading.canCompare,false);
  assert.match(reading.title,/falta información/);
  assert.doesNotMatch(reading.title,/Aumentaron|Disminuyeron/);
  assert.match(reading.question,/completar los datos/);
});

test("reported zero is a valid observation; missing values never become a zero-change claim",()=>{
  const zeros=executiveReading(result([observation("A",0)],[observation("A",0)]));
  assert.equal(zeros.canCompare,true);
  assert.match(zeros.observation,/de 0 a 0 salidas por cada 100 empleados/);
  const missing=executiveReading(result([observation("A",null)],[observation("A",null)]));
  assert.equal(missing.canCompare,false);
  assert.doesNotMatch(missing.title,/mantuvo igual/);
  assert.match(missing.observation,/No hay suficientes datos/);
});

test("the executive summary respects the minimum cohort and states the dates and unit",()=>{
  const data=result([observation("A",5)],[observation("A",8)]);
  assert.equal(executiveReading(data,5).canCompare,false);
  const reading=executiveReading(data,1);
  assert.equal(reading.canCompare,true);
  assert.match(reading.observation,/de 5 a 8 salidas por cada 100 empleados/);
  assert.match(reading.observation,/May-Jun 25 a Jul-Ago 25/);
  assert.match(reading.observation,/misma compañía/);
  assert.doesNotMatch(reading.title,/pérdida|mejora|causa|productividad/i);
});

test("monthly exit readings stay monthly counts, without inferring percentages or costs",()=>{
  const data=result([observation("A",8)],[observation("A",5)],"monthlyExits");
  data.cuts[0].label="Julio 2025";data.cuts[1].label="Agosto 2025";
  const reading=executiveReading(data);
  assert.match(reading.observation,/de 8 a 5 salidas/);
  assert.match(reading.observation,/Julio 2025 a Agosto 2025/);
  assert.doesNotMatch(reading.observation,/%|por cada 100|MXN/);
  assert.match(reading.title,/menos salidas/);
});
