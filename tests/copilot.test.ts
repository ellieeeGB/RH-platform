import assert from "node:assert/strict";
import test from "node:test";
import { answerCopilot } from "../src/lib/copilot-engine";

test("retention questions route to retention evidence", () => {
  const answer = answerCopilot("¿Qué está pasando con la rotación?");
  assert.equal(answer.intent, "retention");
  assert.ok(answer.evidence.some((item) => item.href === "/retencion"));
  assert.ok(answer.answer.includes("54.5%"));
});

test("salary questions route to compensation evidence", () => {
  const answer = answerCopilot("¿Cómo está el salario de ingreso contra mercado?");
  assert.equal(answer.intent, "compensation");
  assert.ok(answer.evidence.some((item) => item.label === "Mediana ingreso"));
  assert.equal(answer.actionHref, "/what-if");
});

test("quality questions expose quality caveats and source route", () => {
  const answer = answerCopilot("¿Hay errores o problemas de calidad de datos?");
  assert.equal(answer.intent, "quality");
  assert.ok(answer.answer.includes("sin datos para evaluar"));
  assert.ok(answer.answer.includes("no equivale a confianza estadística"));
  assert.equal(answer.actionHref, "/data-quality");
});

test("unknown questions fall back to an evidence-backed summary", () => {
  const answer = answerCopilot("Dame una lectura ejecutiva general");
  assert.equal(answer.intent, "summary");
  assert.ok(answer.evidence.length >= 3);
  assert.ok(answer.evidence.every((item) => item.source.endsWith(".json")));
});
