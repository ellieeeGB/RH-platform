import assert from "node:assert/strict";
import test from "node:test";
import {
  COMPANIES,
  PERIODS,
  getCompanySnapshot,
  getMarketSnapshot,
} from "../src/lib/company-panel";

test("company panel exposes seven periods and forty anonymized companies", () => {
  assert.equal(PERIODS.length, 7);
  assert.equal(COMPANIES.length, 40);
  assert.equal(COMPANIES[0], "COMPAÑIA 1");
  assert.equal(COMPANIES.at(-1), "COMPAÑIA 40");
});

test("latest market aggregates reconcile to validated headline totals", () => {
  const market = getMarketSnapshot("Jul-Ago 25");
  assert.equal(market.companyCount, 40);
  assert.equal(market.headcount.operational, 24554);
  assert.equal(market.headcount.administrative, 9863);
  assert.equal(market.headcount.other, 711);
  assert.equal(market.headcount.total, 35128);
  assert.equal(market.hires, 2779);
  assert.equal(market.exits, 2807);
  assert.equal(market.vacancies.operational, 1853);
  assert.equal(market.vacancies.administrative, 471);
});

test("vacancy totals reconcile in every historical period", () => {
  const expected: Record<string, [number, number]> = {
    "Jul-Ago 24": [1618, 338],
    "Sep-Oct 24": [1208, 253],
    "Nov-Dic 24": [1353, 457],
    "Ene-Feb 25": [1442, 408],
    "Mar-Abr 25": [1418, 354],
    "May-Jun 25": [2022, 472],
    "Jul-Ago 25": [1853, 471],
  };

  for (const [period, [operational, administrative]] of Object.entries(expected)) {
    const market = getMarketSnapshot(period);
    assert.equal(market.vacancies.operational, operational, `${period}: operational vacancies`);
    assert.equal(market.vacancies.administrative, administrative, `${period}: administrative vacancies`);
  }
});

test("company selection returns the correct company-period row", () => {
  const company = getCompanySnapshot("COMPAÑIA 1", "Jul-Ago 25");
  assert.ok(company);
  assert.equal(company.headcount.operational, 143);
  assert.equal(company.headcount.administrative, 24);
  assert.equal(company.headcount.other, 40);
  assert.equal(company.headcount.total, 207);
  assert.equal(company.salaryDaily.entry, 278.8);
});

test("latest salary bands remain ordered for every company with complete data", () => {
  for (const companyCode of COMPANIES) {
    const row = getCompanySnapshot(companyCode, "Jul-Ago 25");
    assert.ok(row);
    const { entry, low, high, max } = row.salaryDaily;
    if ([entry, low, high, max].some((value) => value === null)) continue;
    assert.ok((entry as number) <= (low as number), `${companyCode}: entry <= low`);
    assert.ok((low as number) <= (high as number), `${companyCode}: low <= high`);
    assert.ok((high as number) <= (max as number), `${companyCode}: high <= max`);
  }
});
