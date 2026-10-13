import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { percentagePoints, composition, reconcile, assertCompanyIds } from "../scripts/lib/data-contract";
import { runPipeline, validateOutput } from "../scripts/run-data-pipeline";
import manifest from "../data/processed/pipeline-manifest.json";
import { completeSum, matchedRate } from "../src/lib/metric-math";
import { getCompanySnapshot } from "../src/lib/company-panel";
import { checkCompany } from "../src/lib/data-quality";

test("units belong to the field, never the magnitude; inequalities remain missing",()=>{
 assert.equal(percentagePoints(1,"points"),1);assert.equal(percentagePoints(1,"fraction"),100);
 assert.equal(percentagePoints(0.097,"fraction"),9.7);assert.equal(percentagePoints("1%","fraction"),1);
 assert.equal(percentagePoints("menos de 1%","fraction"),null);assert.equal(percentagePoints(101,"points"),null);
 assert.equal(percentagePoints({result:0.08},"fraction"),8);
});
test("compositions reconcile as a complete group with a declared tolerance",()=>{
 assert.deepEqual(composition([1,99]),[0.01,0.99]);assert.equal(composition([0.9,null]),null);
 assert.equal(composition([0.3,0.2,0.2,0.1,0.1]),null);
 const c=composition([20,30,49])!;assert.ok(Math.abs(c.reduce((s,v)=>s+v,0)-1)<1e-12);
 assert.equal(reconcile([2,null],2),null);assert.equal(reconcile([2,0],2),true);
});
test("invalid or incomplete denominators cannot borrow data from another respondent",()=>{
 assert.equal(completeSum([3,null]),null);assert.equal(completeSum([3,0]),3);
 const r=matchedRate([{n:5,d:10},{n:null,d:90},{n:100,d:null},{n:-1,d:10}],r=>r.n,r=>r.d);
 assert.deepEqual(r,{n:1,numerator:5,denominator:10,value:50});
});
test("duplicate company ids cannot masquerade as a 40-company panel",()=>{
 const ids=Array.from({length:40},(_,i)=>`COMPAÑIA ${i+1}`);assertCompanyIds(ids,"test");
 ids[39]=ids[0];assert.throws(()=>assertCompanyIds(ids,"test"));
});
test("quality checks distinguish missing components from inconsistent ones",()=>{
 const r=structuredClone(getCompanySnapshot("COMPAÑIA 2","Jul-Ago 25")!);
 r.training.administrativeHours=null;r.attendance.incapacityCases=10;r.attendance.workRisk=0;r.attendance.generalIllness=8;r.attendance.maternity=0;
 const checks=checkCompany(r);assert.equal(checks.find(c=>c.field==="Capacitación")?.state,"missing");assert.equal(checks.find(c=>c.field==="Incapacidades")?.state,"review");
});
test("every published dataset matches the generation manifest and cohort contract",async()=>{
 assert.deepEqual(await validateOutput("data/processed"),{periods:7,companies:40,records:280});
 for(const [file,hash] of Object.entries(manifest.outputs))assert.equal(createHash("sha256").update(await fs.readFile(path.join("data/processed",file))).digest("hex"),hash,file);
});
test("failed extraction preserves previous generation and cleans its writer lock",async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"catch-pipeline-test-"));
 try {
  const source=path.join(dir,"invalid.xlsx"),target=path.join(dir,"processed");
  const workbook=new ExcelJS.Workbook();workbook.addWorksheet("wrong schema");await workbook.xlsx.writeFile(source);
  await fs.mkdir(target);await fs.writeFile(path.join(target,"sentinel.json"),"original");
  await assert.rejects(runPipeline(source,target),/Extraction failed/);
  assert.equal(await fs.readFile(path.join(target,"sentinel.json"),"utf8"),"original");
  assert.deepEqual((await fs.readdir(dir)).sort(),["invalid.xlsx","processed"]);
 } finally {await fs.rm(dir,{recursive:true,force:true});}
});

test("legacy aggregates, charts and active filters share exactly the same rate cohorts",async()=>{
 const {default:benchmark}=await import("../data/processed/benchmark.json");
 const {default:people}=await import("../data/processed/people-intelligence.json");
 const {getMarketSnapshot,deriveScopeMetrics}=await import("../src/lib/company-panel");
 for(const period of benchmark.periods){
  const metrics=deriveScopeMetrics(getMarketSnapshot(period.period));
  assert.equal(period.matchedRates.exits.value,metrics.turnoverPct);
  assert.equal(period.matchedRates.absences.value,metrics.absenceEventsPer100);
  assert.equal(period.matchedRates.incapacity.value,metrics.incapacityCasesPer100);
  assert.equal(period.matchedRates.exits.n,metrics.coverage.exits);
  assert.ok(Math.abs(people.retention.turnoverTrendPct.find(p=>p.period===period.period)!.value-metrics.turnoverPct!)<=0.005);
 }
});

test("verification rejects a mixed generation before development or build",async()=>{
 const {verifyData}=await import("../scripts/verify-data");
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"catch-integrity-test-"));
 try{
  await fs.cp("data/processed",dir,{recursive:true});
  await fs.appendFile(path.join(dir,"benchmark.json")," ");
  await assert.rejects(verifyData(dir),/changed outside the complete pipeline/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
