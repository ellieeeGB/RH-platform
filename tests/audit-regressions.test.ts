import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveScopeMetrics,getCompanySnapshot,getMarketSnapshot,completeHeadcount} from '../src/lib/company-panel';
import {monthlyExitSummary,technicalTable,getDetails} from '../src/lib/company-detail';
test('One percentage point stays one, and market rates require complete paired respondents',()=>{
 const r=getCompanySnapshot('COMPAÑIA 40','Jul-Ago 25')!;assert.equal(r.rejectionPct.antidoping,1);assert.equal(r.rejectionPct.psychometric,1);
 const m=deriveScopeMetrics(getMarketSnapshot('Jul-Ago 25'));assert.equal(m.coverage.exits,29);assert.ok(Math.abs(m.turnoverPct!-2791/26977*100)<1e-10);assert.equal(m.netMovement,-28);
 assert.equal(completeHeadcount(getCompanySnapshot('COMPAÑIA 14','Jul-Ago 25')!),null);
});
test('Monthly exits are not inferred from repeated headers; selected company and month work',()=>{
 assert.equal(monthlyExitSummary('COMPAÑIA 40','Jul-Ago 25','2025-07').count,3);assert.equal(monthlyExitSummary('COMPAÑIA 40','Jul-Ago 25','2025-08').count,7);
 assert.equal(monthlyExitSummary('market','Sep-Oct 24','2024-09').count,null);
 assert.equal(monthlyExitSummary('market','Jul-Ago 25','2024-07').count,null);
});
test('Technical table is from the source and retains scoped company values',()=>{
 const table=technicalTable('COMPAÑIA 40','Jul-Ago 25');const role=table.find(x=>x.name==='Técnico de Mantenimiento')!;assert.equal(role.own,23574);assert.ok(role.n>0);assert.ok(role.q1!<=role.median!&&role.median!<=role.q3!);
 assert.equal(getDetails('market','Jul-Ago 25').filter(r=>r.ttfManagerialStatus==='over-60').length,10);
});
