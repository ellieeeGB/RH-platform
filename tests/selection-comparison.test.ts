import test from "node:test";
import assert from "node:assert/strict";
import { COMPANIES, PERIODS, getCompanySnapshot } from "../src/lib/company-panel";
import { AVAILABLE_MONTHS, normalizeSelection, needsComparison, selectionCuts, singleSelection } from "../src/lib/comparison-selection";
import { aggregateObservations, buildComparison, compareObservations, comparisonCsvRows, snapshotObservation } from "../src/lib/selection-comparison";
import { monthlyExitSummary } from "../src/lib/company-detail";

test("company and period selections are whitelisted, deduplicated and chronological", () => {
  const selection = normalizeSelection({ companies: ["COMPAÑIA 10", "bad", "COMPAÑIA 2", "COMPAÑIA 2"], timeMode: "periods", periods: [PERIODS[6], "bad", PERIODS[0], PERIODS[0]], months: [] })!;
  assert.deepEqual(selection.companies, ["COMPAÑIA 2", "COMPAÑIA 10"]);
  assert.deepEqual(selectionCuts(selection).map(c=>c.id), [PERIODS[0], PERIODS[6]]);
  assert.equal(normalizeSelection({...selection,companies:[]}), null);
  assert.equal(normalizeSelection({...selection,periods:[PERIODS[0]]}), null);
  assert.equal(normalizeSelection({...selection,timeMode:"single"}), null);
  assert.equal(normalizeSelection({...selection,timeMode:"unknown"}), null);
  assert.equal(normalizeSelection("invalid"), null);
});

test("one company, two companies, many companies and all companies remain explicit scopes", () => {
  for(const companies of [COMPANIES.slice(0,1),COMPANIES.slice(0,2),COMPANIES.slice(10,20),COMPANIES]) {
    const selection = normalizeSelection({...singleSelection(),companies})!;
    assert.deepEqual(buildComparison(selection,"exits").rows.map(r=>r.company),companies);
    assert.equal(needsComparison(selection),companies.length>1&&companies.length<40);
  }
  const s = normalizeSelection({...singleSelection(),timeMode:"history"})!;
  assert.equal(needsComparison(s),true);
  assert.deepEqual(selectionCuts(s).map(c=>c.id),PERIODS);
});

test("a group's rate uses matched quantities, not the mean of company percentages", () => {
  const rows = [{company:"A",numerator:1,denominator:10},{company:"B",numerator:9,denominator:90},{company:"missing",numerator:null,denominator:1000},{company:"zero population",numerator:20,denominator:0}];
  assert.deepEqual(aggregateObservations(rows,"turnover"),{value:10,n:2,numerator:10,denominator:100});
  rows[0].numerator=0;
  assert.equal(aggregateObservations(rows,"turnover").value,9);
  assert.equal(aggregateObservations([{company:"zero",numerator:0,denominator:null}],"exits").value,0);
  assert.equal(aggregateObservations([{company:"missing",numerator:null,denominator:null}],"exits").value,null);
});

test("time comparisons keep the same companies in every cut and reject duplicates", () => {
  const obs=(company:string,numerator:number|null)=>({company,numerator,denominator:100});
  const cuts=[{id:"first",rows:[obs("same",1),obs("leaves",100)]},{id:"middle",rows:[obs("same",2),obs("enters",0)]},{id:"last",rows:[obs("same",3),obs("enters",0)]}];
  const result=compareObservations(cuts,"turnover");
  assert.deepEqual(result.common,["same"]);
  assert.deepEqual(result.points.map(p=>p.fixed.value),[1,2,3]);
  assert.equal(result.delta,2);
  assert.equal(result.points[0].available.value,50.5);
  assert.throws(()=>compareObservations([cuts[0],cuts[0]],"turnover"),/Duplicate comparison period/);
  assert.throws(()=>compareObservations([{id:"one",rows:[obs("same",1),obs("same",1)]}],"turnover"),/Duplicate comparison company/);
  cuts[1].rows[0].numerator=null;
  assert.equal(compareObservations(cuts,"turnover").delta,null);
});

test("full-history view preserves seven snapshots, never summing headcounts over time", () => {
  const selection=normalizeSelection({...singleSelection("COMPAÑIA 1"),timeMode:"history"})!;
  const result=buildComparison(selection,"headcount");
  assert.equal(result.cuts.length,7);
  for(const [i,period] of PERIODS.entries()) {
    const observation=snapshotObservation(getCompanySnapshot("COMPAÑIA 1",period),"headcount");
    assert.equal(result.points[i].available.value,observation.numerator);
  }
  assert.equal(buildComparison({...selection,timeMode:"single",periods:[PERIODS[0]]},"headcount").cuts.length,1);
});

test("monthly comparisons use only confirmed monthly source values, including zero", () => {
  assert.deepEqual(AVAILABLE_MONTHS.map(m=>m.id),["2024-07","2024-08","2025-07","2025-08"]);
  assert.equal(normalizeSelection({...singleSelection(),timeMode:"months",months:["2024-09","2024-10"]}),null);
  const selection=normalizeSelection({...singleSelection("COMPAÑIA 1"),timeMode:"months",months:["2025-08","2024-07","2024-09","2025-08"]})!;
  const result=buildComparison(selection,"salary");
  assert.equal(result.metric,"monthlyExits");
  assert.deepEqual(result.cuts.map(c=>c.id),["2024-07","2025-08"]);
  result.cuts.forEach((c,i)=>assert.equal(result.rows[0].values[i],monthlyExitSummary("COMPAÑIA 1",c.period,c.id).count));
});

test("incomplete stock fields and invalid salaries stay missing in comparisons", () => {
  const row=structuredClone(getCompanySnapshot("COMPAÑIA 1",PERIODS.at(-1)!)!);
  row.headcount={operational:100,administrative:10,other:null,total:110};row.exits=10;
  assert.equal(aggregateObservations([snapshotObservation(row,"turnover")],"turnover").value,null);
  assert.equal(snapshotObservation(row,"headcount").numerator,null);
  row.vacancies={operational:2,administrative:null,total:2};
  assert.equal(snapshotObservation(row,"vacancies").numerator,null);
  row.salaryDaily={entry:300,low:250,high:400,max:500};
  assert.equal(snapshotObservation(row,"salary").numerator,null);
});

test("CSV is limited to the selected companies and periods and preserves missing values and coverage", () => {
  const selection=normalizeSelection({...singleSelection(),companies:COMPANIES.slice(0,2),timeMode:"periods",periods:PERIODS.slice(0,2)})!;
  const result=buildComparison(selection,"turnover");
  const csv=comparisonCsvRows(result);
  assert.equal(csv.length,1+2*2+2*2);
  assert.ok(csv.slice(1).every(row=>selection.periods.includes(String(row[1]))));
  assert.ok(csv.slice(1,5).every(row=>selection.companies.includes(String(row[0]))));
  assert.equal(csv[0][6],"Empresas con datos");
  for(const row of csv.slice(1,5)) assert.equal(row[5],row[4]===null?"Sin dato válido":"Reportado");
});
