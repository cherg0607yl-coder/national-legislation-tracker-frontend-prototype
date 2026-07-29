import type { Bill, BillStatus, PolicyCategory } from "../types/bill";

/** Prototype "today" aligned with the mock dataset timeline. */
export const PROTOTYPE_TODAY = new Date(2026, 6, 29);

export const POLICY_CATEGORIES: PolicyCategory[] = [
  "Strategic Planning",
  "Performance Measures",
  "Artificial Intelligence",
  "Outcome Evaluations",
];

export const CATEGORY_SHORT: Record<PolicyCategory, string> = {
  "Strategic Planning": "Planning",
  "Performance Measures": "PM",
  "Artificial Intelligence": "AI",
  "Outcome Evaluations": "Eval",
};

export type CategoryFilter = PolicyCategory | "all";

export interface LegislativeSession {
  id: string;
  label: string;
  start: string;
  end: string;
}

/** Biennial-style sessions covering the prototype corpus. */
export const LEGISLATIVE_SESSIONS: LegislativeSession[] = [
  {
    id: "2025-2026",
    label: "2025–2026",
    start: "2025-01-01",
    end: "2026-12-31",
  },
  {
    id: "2023-2024",
    label: "2023–2024",
    start: "2023-01-01",
    end: "2024-12-31",
  },
  {
    id: "all",
    label: "All sessions",
    start: "2000-01-01",
    end: "2099-12-31",
  },
];

const ACTIVE_STATUSES: BillStatus[] = [
  "Introduced",
  "In Committee",
  "Passed",
];

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysAgo(days: number, from: Date = PROTOTYPE_TODAY): Date {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return date;
}

export function formatDisplayDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getSessionById(id: string): LegislativeSession {
  return (
    LEGISLATIVE_SESSIONS.find((s) => s.id === id) ?? LEGISLATIVE_SESSIONS[0]
  );
}

export function filterBySession(bills: Bill[], sessionId: string): Bill[] {
  const session = getSessionById(sessionId);
  const start = parseISODate(session.start);
  const end = parseISODate(session.end);
  return bills.filter((b) => {
    const introduced = parseISODate(b.introducedDate);
    return introduced >= start && introduced <= end;
  });
}

export function filterByCategory(
  bills: Bill[],
  category: CategoryFilter,
): Bill[] {
  if (category === "all") return bills;
  return bills.filter((b) => b.category === category);
}

export function isActiveBill(bill: Bill): boolean {
  return ACTIVE_STATUSES.includes(bill.status);
}

export function countUpdatedSince(bills: Bill[], days: number): number {
  const cutoff = daysAgo(days);
  return bills.filter((b) => parseISODate(b.lastUpdated) >= cutoff).length;
}

export function countIntroducedSince(bills: Bill[], days: number): number {
  const cutoff = daysAgo(days);
  return bills.filter((b) => parseISODate(b.introducedDate) >= cutoff).length;
}

export function lastDatabaseUpdate(bills: Bill[]): string | null {
  if (bills.length === 0) return null;
  return bills
    .map((b) => b.lastUpdated)
    .sort((a, b) => parseISODate(b).getTime() - parseISODate(a).getTime())[0];
}

export interface OverviewStats {
  totalTracked: number;
  active: number;
  introducedThisSession: number;
  updatedLast7: number;
  updatedLast30: number;
  enacted: number;
  lastDatabaseUpdate: string | null;
}

export function computeOverviewStats(
  sessionBills: Bill[],
  allBillsForDbStamp: Bill[],
): OverviewStats {
  return {
    totalTracked: sessionBills.length,
    active: sessionBills.filter(isActiveBill).length,
    introducedThisSession: sessionBills.length,
    updatedLast7: countUpdatedSince(sessionBills, 7),
    updatedLast30: countUpdatedSince(sessionBills, 30),
    enacted: sessionBills.filter((b) => b.status === "Enacted").length,
    lastDatabaseUpdate: lastDatabaseUpdate(allBillsForDbStamp),
  };
}

export function countByCategory(bills: Bill[]): Record<PolicyCategory, number> {
  const counts = {
    "Strategic Planning": 0,
    "Performance Measures": 0,
    "Artificial Intelligence": 0,
    "Outcome Evaluations": 0,
  } satisfies Record<PolicyCategory, number>;

  for (const bill of bills) {
    counts[bill.category] += 1;
  }
  return counts;
}

export interface TopicStat {
  topic: string;
  count: number;
  share: number;
}

/** Most frequent subcategories (topics) within a bill set. */
export function getTrendingTopics(bills: Bill[], limit = 5): TopicStat[] {
  const totals = new Map<string, number>();
  for (const bill of bills) {
    totals.set(bill.subcategory, (totals.get(bill.subcategory) ?? 0) + 1);
  }

  const total = bills.length || 1;
  return [...totals.entries()]
    .map(([topic, count]) => ({
      topic,
      count,
      share: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))
    .slice(0, limit);
}

export function getTopicsByCategory(
  bills: Bill[],
  limitPerCategory = 4,
): Record<PolicyCategory, TopicStat[]> {
  const result = {} as Record<PolicyCategory, TopicStat[]>;
  for (const category of POLICY_CATEGORIES) {
    result[category] = getTrendingTopics(
      bills.filter((b) => b.category === category),
      limitPerCategory,
    );
  }
  return result;
}

export interface StateStats {
  state: string;
  stateName: string;
  total: number;
  active: number;
  enacted: number;
  updatedLast30: number;
  topCategory: PolicyCategory | null;
  topTopics: TopicStat[];
  categoryCounts: Record<PolicyCategory, number>;
}

export function computeStateStats(
  bills: Bill[],
  state: string,
): StateStats | null {
  const stateBills = bills.filter((b) => b.state === state);
  if (stateBills.length === 0) {
    return {
      state,
      stateName: STATE_NAMES[state] ?? state,
      total: 0,
      active: 0,
      enacted: 0,
      updatedLast30: 0,
      topCategory: null,
      topTopics: [],
      categoryCounts: countByCategory([]),
    };
  }

  const categoryCounts = countByCategory(stateBills);
  const topCategory =
    (Object.entries(categoryCounts) as [PolicyCategory, number][])
      .sort((a, b) => b[1] - a[1])
      .find(([, count]) => count > 0)?.[0] ?? null;

  return {
    state,
    stateName: STATE_NAMES[state] ?? state,
    total: stateBills.length,
    active: stateBills.filter(isActiveBill).length,
    enacted: stateBills.filter((b) => b.status === "Enacted").length,
    updatedLast30: countUpdatedSince(stateBills, 30),
    topCategory,
    topTopics: getTrendingTopics(stateBills, 3),
    categoryCounts,
  };
}

export function statesWithBills(bills: Bill[]): Set<string> {
  return new Set(bills.map((b) => b.state));
}

export function billCountByState(bills: Bill[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const bill of bills) {
    counts[bill.state] = (counts[bill.state] ?? 0) + 1;
  }
  return counts;
}

export function getRecentBills(bills: Bill[], limit = 6): Bill[] {
  return [...bills]
    .sort(
      (a, b) =>
        parseISODate(b.lastUpdated).getTime() -
        parseISODate(a.lastUpdated).getTime(),
    )
    .slice(0, limit);
}

export function getTrendingBills(bills: Bill[], limit = 6): Bill[] {
  const cutoff = daysAgo(45);
  const scored = bills
    .filter((b) => parseISODate(b.lastUpdated) >= cutoff)
    .map((bill) => {
      let score = 0;
      if (bill.category === "Artificial Intelligence") score += 3;
      if (bill.status === "In Committee" || bill.status === "Passed") score += 2;
      if (bill.status === "Introduced") score += 1;
      const daysSinceUpdate =
        (PROTOTYPE_TODAY.getTime() - parseISODate(bill.lastUpdated).getTime()) /
        (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - daysSinceUpdate / 5);
      return { bill, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.bill);
}

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};
