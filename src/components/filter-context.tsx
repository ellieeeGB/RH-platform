"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { COMPANIES, MARKET_SCOPE, PERIODS } from "@/lib/company-panel";

type FilterContextValue = {
  period: string;
  company: string;
  periods: string[];
  companies: string[];
  setPeriod: (period: string) => void;
  setCompany: (company: string) => void;
  companyLabel: string;
  isMarket: boolean;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriodState] = useState(PERIODS.at(-1) ?? "Jul-Ago 25");
  const [company, setCompanyState] = useState(MARKET_SCOPE);

  useEffect(() => {
    const savedPeriod = window.localStorage.getItem("catch.period");
    const savedCompany = window.localStorage.getItem("catch.company");
    if (savedPeriod && PERIODS.includes(savedPeriod)) setPeriodState(savedPeriod);
    if (savedCompany && (savedCompany === MARKET_SCOPE || COMPANIES.includes(savedCompany))) setCompanyState(savedCompany);
  }, []);

  const setPeriod = (next: string) => {
    if (!PERIODS.includes(next)) return;
    setPeriodState(next);
    window.localStorage.setItem("catch.period", next);
  };

  const setCompany = (next: string) => {
    if (next !== MARKET_SCOPE && !COMPANIES.includes(next)) return;
    setCompanyState(next);
    window.localStorage.setItem("catch.company", next);
  };

  const value = useMemo<FilterContextValue>(() => ({
    period,
    company,
    periods: PERIODS,
    companies: COMPANIES,
    setPeriod,
    setCompany,
    isMarket: company === MARKET_SCOPE,
    companyLabel: company === MARKET_SCOPE ? "Mercado completo" : company,
  }), [period, company]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilters must be used inside FilterProvider");
  return context;
}
