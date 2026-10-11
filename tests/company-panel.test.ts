import assert from "node:assert/strict";
import test from "node:test";
import {
  COMPANIES,
  PERIODS,
  getCompanySnapshot,
  getMarketExtendedStats,
  getMarketSnapshot,
  getPeriodSnapshots,
} from "../src/lib/company-panel";

test("company panel exposes seven periods and forty anonymized companies", () => {
  assert.equal(PERIODS.length, 7);
  assert.equal(COMPANIES.length, 40);
  assert.equal(COMPANIES[0], "COMPAÑIA 1");
  assert.equal(COMPANIES.at(-1), "COMPAÑIA 40");
  for (const period of PERIODS) assert.equal(getPeriodSnapshots(period).length, 40, `${period}: company count`);
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

test("latest attendance and training totals reconcile to source workbook", () => {
  const market = getMarketSnapshot("Jul-Ago 25");
  assert.equal(market.attendance.absences, 31360);
  assert.equal(market.attendance.incapacityCases, 13204);
  assert.equal(market.training.operationalHours, 122940);
  assert.equal(market.training.administrativeHours, 36911);
  assert.equal(market.training.totalHours, 159851);
});

test("latest labor and benefit prevalence reconcile", () => {
  const stats = getMarketExtendedStats("Jul-Ago 25");
  assert.equal(stats.laborRelations.unionizedCompanies, 32);
  assert.equal(stats.laborRelations.unionizationPct, 80);
  assert.deepEqual(stats.benefits.lifeInsurance, { yes: 33, valid: 40, pct: 82.5 });
  assert.deepEqual(stats.benefits.transport, { yes: 32, valid: 40, pct: 80 });
  assert.deepEqual(stats.benefits.cafeteria, { yes: 25, valid: 40, pct: 62.5 });
});

test("company selection returns extended company-period evidence", () => {
  const company = getCompanySnapshot("COMPAÑIA 1", "Jul-Ago 25");
  assert.ok(company);
  assert.equal(company.headcount.operational, 143);
  assert.equal(company.headcount.administrative, 24);
  assert.equal(company.headcount.other, 40);
  assert.equal(company.headcount.total, 207);
  assert.equal(company.salaryDaily.entry, 278.8);
  assert.equal(company.attendance.absences, 366);
  assert.equal(company.attendance.incapacityCases, 79);
  assert.equal(company.laborRelations.unionized, false);
  assert.equal(company.benefits.voucherOperationalPct, 15);
  assert.equal(company.benefits.savingsOperationalPct, 8);
  assert.equal(company.benefits.lifeInsurance, true);
  assert.equal(company.benefits.transport, true);
  assert.equal(company.benefits.cafeteria, true);
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
