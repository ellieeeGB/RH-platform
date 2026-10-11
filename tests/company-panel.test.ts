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
