import test from "node:test";
import assert from "node:assert/strict";
import { compareObservations, analyzeSignal } from "../src/lib/signal-analysis";
const row = (company:string,value:number|null)=>({company,value});
test("response composition is separated exactly from change in the same companies",()=>{
 const r=compareObservations([row("A",10),row("B",20),row("C",40)],[row("A",15),row("B",0),row("D",100)]);
 assert.equal(r.delta,45); assert.equal(r.matchedDelta,-15); assert.equal(r.compositionDelta,60);
 assert.equal(r.n,2);assert.equal(r.entering,1);assert.equal(r.leaving,1);assert.equal(r.sensitivity,null);
});
test("missing, zero bases and negative observations do not invent percentage changes",()=>{
 const r=compareObservations([row("A",0),row("B",null)],[row("A",2),row("B",-5)]);
 assert.equal(r.matchedPct,null);assert.equal(r.matchedDelta,2);assert.equal(r.n,1);
 assert.equal(compareObservations([], [row("A",2)]).delta,null);
});
test("one influential company can reverse the direction under leave-one-out",()=>{
 const before=Array.from({length:6},(_,i)=>row(String(i),10));
 const r=compareObservations(before,before.map((r,i)=>row(r.company,i===0?100:5)));
 assert.equal(r.sensitivity?.directionStable,false);assert.equal(r.sensitivity?.min,-50);
 assert.equal(r.contributors[0].company,"0");
});
test("all positive matched changes retain direction, and company scope cannot borrow peers",()=>{
 const before=Array.from({length:6},(_,i)=>row(String(i),10));
 assert.equal(compareObservations(before,before.map(r=>row(r.company,20))).sensitivity?.directionStable,true);
 const r=analyzeSignal("exits","Jul-Ago 25","COMPAÑIA 2");
 assert.ok(r.n<=1);assert.equal(r.sensitivity,null);assert.ok(r.contributors.every(c=>c.company==="COMPAÑIA 2"));
});
