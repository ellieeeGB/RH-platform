import test from "node:test";
import assert from "node:assert/strict";
import { decomposeRates, decisionStudy, buildTalentMap, contrastPeers, type TalentPoint } from "../src/lib/decision-intelligence";
import { getCompanySnapshot, PERIODS, getPeriodSnapshots } from "../src/lib/company-panel";
import { readDecisionNotes, type DecisionNote } from "../src/lib/decision-journal";

test("decomposition exposes an aggregate reversal even when both company rates increase", () => {
  const d = decomposeRates([{company:"A",exits:1,headcount:10},{company:"B",exits:45,headcount:90}], [{company:"A",exits:18,headcount:90},{company:"B",exits:6,headcount:10}]);
  assert.equal(d.beforeRate,46);assert.equal(d.afterRate,24);assert.equal(d.delta,-22);
  assert.ok(Math.abs(d.within!-10)<1e-12);assert.ok(Math.abs(d.weight!+32)<1e-12);
});
test("paired rates preserve the exact decomposition across the entire real panel", () => {
  for(const period of PERIODS){
    const d = decisionStudy(period).decomposition;
    if(d.delta===null){assert.equal(d.within,null);assert.equal(d.weight,null);continue;}
    assert.ok(Math.abs(d.delta-d.within!-d.weight!)<1e-10,period);
    assert.ok(Math.abs(d.observedDelta!-d.delta-d.coverageEffect!)<1e-10,period);
  }
});
test("no company can borrow a missing or zero denominator; absence differs from a reported zero", () => {
  const before=[{company:"A",exits:0,headcount:10},{company:"B",exits:4,headcount:0},{company:"C",exits:null,headcount:30}];
  const after=[{company:"A",exits:1,headcount:10},{company:"B",exits:2,headcount:20},{company:"C",exits:4,headcount:30}];
  const d=decomposeRates(before,after);
  assert.equal(d.n,1);assert.equal(d.beforeRate,0);assert.equal(d.afterRate,10);assert.equal(d.weight,0);assert.equal(d.within,10);
  assert.equal(decomposeRates([],after).delta,null);
  assert.throws(()=>decomposeRates([before[0],before[0]],after),/Duplicate/);
});
test("uniform replication changes counts, never rate effects; input order is irrelevant", () => {
  const before=[{company:"A",exits:1,headcount:10},{company:"B",exits:3,headcount:30}],after=[{company:"B",exits:2,headcount:50},{company:"A",exits:2,headcount:15}];
  const a=decomposeRates(before,after),b=decomposeRates(before.map(r=>({...r,exits:r.exits*7,headcount:r.headcount*7})).reverse(),after.map(r=>({...r,exits:r.exits*7,headcount:r.headcount*7})).reverse());
  for(const key of ["delta","within","weight"] as const)assert.ok(Math.abs(a[key]!-b[key]!)<1e-10);
});
test("map requires the same complete company in both axes and conserves all exclusion counts", () => {
  const valid=structuredClone(getCompanySnapshot("COMPAÑIA 1","Jul-Ago 25")!),missing=structuredClone(valid),invalid=structuredClone(valid),zero=structuredClone(valid);
  missing.headcount.other=null;invalid.salaryDaily.entry=9999;zero.exits=0;
  const result=buildTalentMap([valid,missing,invalid,zero]);
  assert.equal(result.points.length,2);assert.equal(result.points[1].turnover,0);
  assert.equal(result.points.length+Object.values(result.exclusions).reduce((s,n)=>s+n,0),4);
  assert.equal(result.salary.median,null); // Fewer than five valid companies.
});
test("contrast peers exclude self, unknown union status and size or salary mismatches", () => {
  const a:TalentPoint={company:"A",salary:300,headcount:100,exits:10,turnover:10,unionized:true,review:false};
  const peers=[a,{...a,company:"B",salary:315,turnover:5},{...a,company:"C",headcount:201},{...a,company:"D",salary:340},{...a,company:"E",unionized:null}];
  assert.deepEqual(contrastPeers(a,peers).map(r=>r.company),["B"]);
  assert.deepEqual(contrastPeers({...a,unionized:null},peers),[]);
});
test("selected company cannot receive the market decomposition or another cohort", () => {
  const study=decisionStudy("Jul-Ago 25","COMPAÑIA 1");
  assert.equal(study.decomposition.n,1);assert.equal(study.decomposition.contributors[0].company,"COMPAÑIA 1");
  assert.equal(study.decomposition.weight,0);
  assert.ok(study.points.length>1); // The contextual map remains visible.
  const excluded=decisionStudy("Jul-Ago 25","COMPAÑIA 1","1000plus");
  assert.equal(excluded.decomposition.n,0);
  assert.ok(excluded.points.every(p=>p.headcount>=1000));
  for(const p of getPeriodSnapshots("Mar-Abr 25"))if(p.company==="COMPAÑIA 28")assert.ok(decisionStudy(p.period).points.find(x=>x.company===p.company)?.review);
});
test("stored hypotheses preserve the original evidence and reject malformed local records", () => {
  const n:DecisionNote={id:"original",createdAt:"2026-10-14T10:00:00Z",period:"Jul-Ago 25",company:"COMPAÑIA 1",sourceSha256:"a".repeat(64),implementationSha256:"b".repeat(64),hypothesis:"Confirmar incorporación",owner:"Equipo",due:"2026-10-20",status:"open",result:"",evidence:{salary:300,turnover:10,comparableN:1,rateChange:2,within:2,weight:0,peerSize:"all",peerUnion:"all",excludeFlagged:false}};
  assert.deepEqual(readDecisionNotes(JSON.stringify([n,n,{...n,id:"bad",evidence:{...n.evidence,turnover:"10"}}])),[n]);
  assert.deepEqual(readDecisionNotes("bad JSON"),[]);assert.deepEqual(readDecisionNotes('{}'),[]);
});

test("excluding an unconfirmed jump is explicit, symmetric across cuts and never rewrites the source", () => {
  for(const period of ["Mar-Abr 25","May-Jun 25"]){
    const original=getCompanySnapshot("COMPAÑIA 28",period)!.headcount.total;
    const full=decisionStudy(period),sensitive=decisionStudy(period,"market","all","all",true);
    assert.ok(full.decomposition.contributors.some(r=>r.company==="COMPAÑIA 28"));
    assert.ok(!sensitive.decomposition.contributors.some(r=>r.company==="COMPAÑIA 28"));
    assert.ok(sensitive.excludedForReview>0);
    assert.equal(getCompanySnapshot("COMPAÑIA 28",period)!.headcount.total,original);
    assert.ok(Math.abs(sensitive.decomposition.delta!-sensitive.decomposition.within!-sensitive.decomposition.weight!)<1e-10);
  }
});
