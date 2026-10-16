import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { ComparisonPlot } from "../src/components/analysis/comparison-view";
import { MarketBullet, Sparkline, PeriodSlope } from "../src/components/ui/data-visuals";
import { buildComparison } from "../src/lib/selection-comparison";
import { singleSelection } from "../src/lib/comparison-selection";
import { PERIODS } from "../src/lib/company-panel";
import { movementSentence, movementTone } from "../src/lib/visual-reading";

Object.assign(globalThis, { React });

test("server-rendered comparison SVG keeps every title instead of emitting empty titles", () => {
  const selection=singleSelection("COMPAÑIA 1");
  selection.timeMode="history";selection.periods=PERIODS;
  const result=buildComparison(selection,"turnover");
  for(const grouped of [true,false]) {
    const html=renderToString(React.createElement(ComparisonPlot,{result,grouped}));
    assert.doesNotMatch(html,/<title[^>]*><\/title>/);
    assert.match(html,/<title[^>]*>Bajas por cada 100/);
    assert.match(html,/Eje vertical/);
    assert.ok([...html.matchAll(/<title[^>]*>(.*?)<\/title>/g)].every(match=>!match[1].includes("<!--")));
  }
});

test("lower exits are favorable, while headcount and hires do not imply success", () => {
  assert.equal(movementTone("exits",-5),"good");
  assert.equal(movementTone("exits",5),"alert");
  assert.equal(movementTone("hires",5),"neutral");
  assert.equal(movementTone("headcount",-5),"neutral");
  assert.equal(movementTone("exits",null),"neutral");
  assert.equal(movementSentence("hires",5),"5 contrataciones más que el bimestre anterior.");
});

test("sparklines preserve missing observations and an actual reported zero", () => {
  const html=renderToString(React.createElement(Sparkline,{values:[0,null,3],labels:["A","B","C"],label:"Prueba",selected:2}));
  assert.match(html,/A: 0; B: sin dato; C: 3/);
  assert.equal([...html.matchAll(/class="sparkline-stroke"/g)].length,2);
  assert.equal([...html.matchAll(/<circle /g)].length,2);
});

test("market markers describe equality, improvement and missing reference accurately", () => {
  const bullet=(own:number|null,market:number|null)=>renderToString(React.createElement(MarketBullet,{label:"Operativo",own,market,maximum:30,isMarket:false}));
  assert.match(bullet(10,15),/5.*días.*más rápido/);
  assert.match(bullet(15,10),/5.*días.*más lento/);
  assert.match(bullet(10,10),/Al ritmo del mercado/);
  assert.doesNotMatch(bullet(null,10),/más rápido|más lento|Al ritmo/);
});


test("period slope preserves zero, labels and a proportional zero-based scale", () => {
  const slope=(before:number,after:number)=>renderToString(React.createElement(PeriodSlope,{before,after,firstLabel:"May-Jun 25",lastLabel:"Jul-Ago 25",unit:"salidas",tone:after<before?"good":"neutral"}));
  const zero=slope(0,0);
  assert.match(zero,/Sin cambio entre periodos/);
  assert.doesNotMatch(zero,/NaN|Infinity/);
  const lower=slope(12.85,10.07);
  assert.match(lower,/12.85 → 10.07 salidas/);
  assert.match(lower,/Mejora entre periodos/);
  assert.match(lower,/May-Jun 25/);
  assert.match(lower,/Jul-Ago 25/);
  const points=[...lower.matchAll(/<circle[^>]+cy="([^"]+)"/g)].map(match=>Number(match[1]));
  assert.ok(points[1]>points[0],"A smaller value appears lower on the same scale");
  const tiny=[...slope(100,99.9).matchAll(/<circle[^>]+cy="([^"]+)"/g)].map(match=>Number(match[1]));
  assert.ok(Math.abs(tiny[1]-tiny[0])<1,"A tiny change cannot occupy the full chart height");
});
