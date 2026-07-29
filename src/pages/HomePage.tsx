import { useState } from "react";
import mockData from "../../data/mock-bills.json";
import type { MockBillsData } from "../types/bill";
import { Hero } from "../components/Hero";
import { StatsDashboard } from "../components/StatsDashboard";
import { CategorySection } from "../components/CategorySection";
import { BillsSection } from "../components/BillsSection";
import {
  billCountByState,
  countByCategory,
  filterByCategory,
  filterBySession,
  getRecentBills,
  getTrendingBills,
  STATE_NAMES,
  statesWithBills,
  type CategoryFilter,
} from "../lib/stats";

const data = mockData as MockBillsData;

export function HomePage() {
  const bills = data.bills;
  const [sessionId, setSessionId] = useState("2025-2026");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const sessionBills = filterBySession(bills, sessionId);
  const scopeBills = selectedState
    ? sessionBills.filter((b) => b.state === selectedState)
    : sessionBills;
  const filteredBills = filterByCategory(scopeBills, category);
  const categoryCounts = countByCategory(scopeBills);
  const mapBills = filterByCategory(sessionBills, category);
  const scopeLabel = selectedState
    ? (STATE_NAMES[selectedState] ?? selectedState)
    : "Nationwide";

  return (
    <>
      <Hero
        statesWithData={statesWithBills(mapBills)}
        billCounts={billCountByState(mapBills)}
        selectedState={selectedState}
        hoveredState={hoveredState}
        onStateHover={setHoveredState}
        onStateSelect={(state) =>
          setSelectedState((current) => (current === state ? null : state))
        }
        onClearState={() => setSelectedState(null)}
      />
      <StatsDashboard
        bills={bills}
        sessionId={sessionId}
        category={category}
        selectedState={selectedState}
        onSessionChange={setSessionId}
        onCategoryChange={setCategory}
        onClearState={() => setSelectedState(null)}
      />
      <CategorySection
        counts={categoryCounts}
        scopeLabel={scopeLabel}
        onClearState={() => setSelectedState(null)}
      />
      <BillsSection
        recentBills={getRecentBills(filteredBills, 3)}
        trendingBills={getTrendingBills(filteredBills, 3)}
        scopeLabel={scopeLabel}
      />
      <aside className="prototype-banner" role="note">
        <div className="container">
          <p>{data._meta.disclaimer}</p>
        </div>
      </aside>
    </>
  );
}
