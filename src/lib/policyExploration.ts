import type { Bill, PolicyCategory } from "../types/bill";
import {
  LEGISLATIVE_SESSIONS,
  STATE_NAMES,
  countIntroducedSince,
  countUpdatedSince,
  filterBySession,
  getTrendingTopics,
  parseISODate,
} from "./stats";
import { AI_TOPICS, ALL_STATES } from "./search";

/**
 * NCSL AI legislation domain taxonomy used for Policy Exploration
 * breadth / coverage analysis.
 */
export const NCSL_AI_TAXONOMY = AI_TOPICS;

/** Session options for the Dimension 1 state comparison chart. */
export const ACTIVITY_CHART_SESSIONS = LEGISLATIVE_SESSIONS.filter(
  (s) => s.id !== "all",
);

/**
 * Year / session windows for “yearly increase” (past ~5 years).
 * Current session is listed first; remaining rows match the product copy format.
 */
export const ACTIVITY_YEAR_WINDOWS: {
  id: string;
  label: string;
  start: string;
  end: string;
}[] = [
  {
    id: "current",
    label: "Current session",
    start: "2025-01-01",
    end: "2026-12-31",
  },
  {
    id: "2024-2025",
    label: "2024–2025",
    start: "2024-01-01",
    end: "2025-12-31",
  },
  {
    id: "2023-2024",
    label: "2023–2024",
    start: "2023-01-01",
    end: "2024-12-31",
  },
  {
    id: "2022-2023",
    label: "2022–2023",
    start: "2022-01-01",
    end: "2023-12-31",
  },
  {
    id: "2021-2022",
    label: "2021–2022",
    start: "2021-01-01",
    end: "2022-12-31",
  },
];

export const POLICY_EXPLORATION_CATEGORIES: {
  category: PolicyCategory;
  description: string;
  available: boolean;
}[] = [
  {
    category: "Strategic Planning",
    description:
      "Long-range planning, goal-setting, and priority frameworks for agencies.",
    available: false,
  },
  {
    category: "Performance Measures",
    description:
      "Metrics, reporting standards, and accountability for public programs.",
    available: false,
  },
  {
    category: "Artificial Intelligence",
    description:
      "Explore AI legislative momentum nationwide or by state across five research dimensions.",
    available: true,
  },
  {
    category: "Outcome Evaluations",
    description:
      "Requirements to evaluate program results, evidence, and impact.",
    available: false,
  },
];

/** @deprecated Use POLICY_EXPLORATION_CATEGORIES */
export const POLICY_DESIGN_CATEGORIES = POLICY_EXPLORATION_CATEGORIES;

export function getAiBills(bills: Bill[]): Bill[] {
  return bills.filter((b) => b.category === "Artificial Intelligence");
}

export function scopeAiBills(
  bills: Bill[],
  selectedState: string | null,
): Bill[] {
  const ai = getAiBills(bills);
  if (!selectedState) return ai;
  return ai.filter((b) => b.state === selectedState);
}

export function billCountByState(bills: Bill[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const bill of bills) {
    counts[bill.state] = (counts[bill.state] ?? 0) + 1;
  }
  return counts;
}

export function computeMomentumLevels(
  aiBills: Bill[],
): Record<string, 0 | 1 | 2 | 3> {
  const counts = billCountByState(aiBills);
  const max = Math.max(0, ...Object.values(counts));
  const levels: Record<string, 0 | 1 | 2 | 3> = {};
  for (const [state, count] of Object.entries(counts)) {
    if (max <= 0 || count <= 0) {
      levels[state] = 0;
      continue;
    }
    const ratio = count / max;
    levels[state] = ratio >= 0.75 ? 3 : ratio >= 0.4 ? 2 : 1;
  }
  return levels;
}

export interface SessionActivityRow {
  sessionId: string;
  label: string;
  introduced: number;
}

export interface YearlyActivityRow {
  id: string;
  label: string;
  count: number;
}

export interface MomentumActivity {
  introducedCount: number;
  introducedLast7: number;
  introducedLast30: number;
  introducedLast90: number;
  updatedLast30: number;
  updatedLast90: number;
  bySession: SessionActivityRow[];
  yearlyWindows: YearlyActivityRow[];
  aiTrendSummary: string;
  humanVerification: {
    status: "verified" | "draft";
    note: string;
    reviewer: string;
  };
}

/** AI bills introduced per state in a session — all US states, descending. */
export function stateIntroductionsForSession(
  aiBills: Bill[],
  sessionId: string,
): { id: string; label: string; value: number }[] {
  const inSession = filterBySession(aiBills, sessionId);
  const counts = billCountByState(inSession);
  return ALL_STATES.map((abbr) => ({
    id: abbr,
    label: abbr,
    value: counts[abbr] ?? 0,
  })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

/** NCSL domain coverage for a scoped AI bill set within one legislative session. */
export function buildSessionBreadth(
  scopedAiBills: Bill[],
  sessionId: string,
): SessionBreadthSnapshot {
  const session =
    LEGISLATIVE_SESSIONS.find((s) => s.id === sessionId) ??
    LEGISLATIVE_SESSIONS[0];
  const sessionBills =
    sessionId === "all"
      ? scopedAiBills
      : filterBySession(scopedAiBills, sessionId);
  const total = sessionBills.length;
  const totalDomains = NCSL_AI_TAXONOMY.length;

  const domains: BreadthDomainRow[] = NCSL_AI_TAXONOMY.map((domain) => {
    const domainBills = sessionBills.filter((b) => b.subcategory === domain);
    const count = domainBills.length;
    return {
      domain,
      count,
      share: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
      introduced: count,
      enacted: domainBills.filter((b) => b.status === "Enacted").length,
    };
  });

  const presentDomains = domains
    .filter((d) => d.count > 0)
    .sort(
      (a, b) =>
        b.count - a.count || a.domain.localeCompare(b.domain),
    );
  const uncoveredDomains = domains
    .filter((d) => d.count === 0)
    .map((d) => d.domain);

  const mostPopular = presentDomains[0] ?? null;
  const mostActive =
    [...presentDomains].sort(
      (a, b) =>
        b.enacted - a.enacted ||
        b.introduced - a.introduced ||
        a.domain.localeCompare(b.domain),
    )[0] ?? null;

  const domainsCovered = presentDomains.length;

  return {
    sessionId: session.id,
    sessionLabel: session.label,
    totalBills: total,
    domainsCovered,
    totalDomains,
    coverageShare: Math.round((domainsCovered / totalDomains) * 100),
    domains,
    presentDomains,
    uncoveredDomains,
    mostPopular,
    mostActive,
  };
}

function countIntroducedInWindow(
  bills: Bill[],
  start: string,
  end: string,
): number {
  const startDate = parseISODate(start);
  const endDate = parseISODate(end);
  return bills.filter((b) => {
    const introduced = parseISODate(b.introducedDate);
    return introduced >= startDate && introduced <= endDate;
  }).length;
}

export interface BreadthDomainRow {
  domain: string;
  count: number;
  share: number;
  introduced: number;
  enacted: number;
}

export interface SessionBreadthSnapshot {
  sessionId: string;
  sessionLabel: string;
  totalBills: number;
  domainsCovered: number;
  totalDomains: number;
  coverageShare: number;
  domains: BreadthDomainRow[];
  /** Domains with at least one bill, sorted by share descending. */
  presentDomains: BreadthDomainRow[];
  uncoveredDomains: string[];
  mostPopular: BreadthDomainRow | null;
  mostActive: BreadthDomainRow | null;
}

export interface MomentumBreadth {
  domainsCovered: number;
  totalDomains: number;
  coverageShare: number;
  topics: { topic: string; count: number; share: number }[];
}

export interface MomentumProgression {
  total: number;
  clearedCommittee: number;
  clearedChamber: number;
  enacted: number;
  rates: {
    committee: number;
    chamber: number;
    enacted: number;
  };
  statusBars: { status: string; count: number }[];
}

export interface ExecutionSignal {
  title: string;
  source: string;
  note: string;
  url?: string;
}

export interface MomentumInstitutionalization {
  uniqueSponsors: number;
  avgSponsorsPerBill: number;
  enactedCount: number;
  executionSignals: ExecutionSignal[];
}

export interface InnovationHighlight {
  title: string;
  summary: string;
  source: string;
  editorialNote: string;
  billId?: string;
  state?: string;
}

export interface MomentumSnapshot {
  scopeKey: string;
  scopeLabel: string;
  activity: MomentumActivity;
  breadth: MomentumBreadth;
  progression: MomentumProgression;
  institutionalization: MomentumInstitutionalization;
  innovation: InnovationHighlight[];
}

function clearedCommittee(bill: Bill): boolean {
  return ["In Committee", "Passed", "Enacted"].includes(bill.status);
}

function clearedChamber(bill: Bill): boolean {
  return ["Passed", "Enacted"].includes(bill.status);
}

function buildTrendSummary(
  scopeLabel: string,
  activity: Omit<MomentumActivity, "aiTrendSummary" | "humanVerification">,
  breadth: MomentumBreadth,
  progression: MomentumProgression,
): string {
  const sessionBits = activity.bySession
    .filter((s) => s.sessionId !== "all")
    .map((s) => `${s.label}: ${s.introduced} introduced`)
    .join("; ");
  const topTopics = breadth.topics
    .slice(0, 3)
    .map((t) => t.topic)
    .join(", ");
  return (
    `${scopeLabel} currently shows ${activity.introducedCount} tracked AI bill` +
    `${activity.introducedCount === 1 ? "" : "s"}, with ${activity.introducedLast30} introduced in the last 30 days. ` +
    `Session pattern — ${sessionBits || "limited session split in this corpus"}. ` +
    `Policy breadth covers ${breadth.domainsCovered} of ${breadth.totalDomains} AI domains` +
    `${topTopics ? ` (top: ${topTopics})` : ""}. ` +
    `Progression: ${progression.rates.enacted}% enacted and ${progression.rates.chamber}% cleared a chamber among tracked bills.`
  );
}

const EXECUTION_SIGNALS: Record<string, ExecutionSignal[]> = {
  national: [
    {
      title: "NCSL AI legislation tracking",
      source: "NCSL",
      note: "National Conference of State Legislatures continues to catalog enacted and pending AI measures across states.",
      url: "https://www.ncsl.org",
    },
    {
      title: "State CIO AI governance surveys",
      source: "NASCIO / state CIO reports",
      note: "Chief information officers report rising agency guidance, procurement standards, and inventory efforts after enactment.",
      url: "https://www.nascio.org",
    },
  ],
  IL: [
    {
      title: "Agency follow-through after AI workplace rules",
      source: "State CIO / labor agency briefings (prototype)",
      note: "Prototype signal: Illinois agencies are preparing compliance guidance tied to employment and audit-oriented AI duties.",
    },
    {
      title: "NCSL peer comparison — private right of action",
      source: "NCSL",
      note: "IL’s enforcement posture is frequently cited in multi-state AI bill comparisons.",
      url: "https://www.ncsl.org",
    },
  ],
  NC: [
    {
      title: "Education-sector AI implementation watch",
      source: "State education / CIO notes (prototype)",
      note: "Prototype signal: campus and K-12 AI restrictions create follow-on guidance needs for school boards and community colleges.",
    },
  ],
  NM: [
    {
      title: "Accountability and studies pipeline",
      source: "Legislative interim reports (prototype)",
      note: "Prototype signal: NM’s oversight and studies bills point toward committee-driven learning agendas rather than immediate agency rulemaking.",
    },
  ],
  CA: [
    {
      title: "Post-enactment transparency implementation",
      source: "Agency rulemaking / EO watch (prototype)",
      note: "Prototype signal: California agencies are commonly referenced for inventory, assessment, and AG-led enforcement models.",
    },
  ],
};

const INNOVATION_NOTES: Record<string, InnovationHighlight[]> = {
  national: [
    {
      title: "First-in-nation audit mandates are still rare",
      summary:
        "Across the prototype corpus, most states emphasize disclosure or sector rules; independent third-party safety audits remain uncommon and editorially notable when they appear.",
      source: "Human editorial synthesis",
      editorialNote:
        "Innovation judgments are qualitative. Treat this as an analyst flag, not a ranked score.",
    },
  ],
  IL: [
    {
      title: "Senate Bill 315 — independent safety audits",
      summary:
        "A first-in-the-nation style mandate for annual independent third-party safety audits, requiring companies to publish risk frameworks for catastrophic threats.",
      source: "Policy commentary / editorial brief (prototype)",
      editorialNote:
        "Flagged as groundbreaking because it pairs external audit duties with public risk-framework disclosure—beyond typical notice-and-inventory models.",
      state: "IL",
    },
  ],
  NC: [
    {
      title: "Education-campus facial recognition guardrails",
      summary:
        "NC’s education-sector AI restrictions are distinctive relative to states that focus mainly on private-sector or government enterprise AI.",
      source: "Human editorial synthesis",
      editorialNote:
        "Not necessarily nationally first, but comparatively unusual in emphasizing campus deployment constraints.",
      state: "NC",
    },
  ],
  NM: [
    {
      title: "Private right of action + oversight pairing",
      summary:
        "NM’s mix of enforcement access and oversight/studies framing stands out versus volume-heavy coastal packages.",
      source: "Human editorial synthesis",
      editorialNote:
        "Innovation here is architectural (accountability pathway), not necessarily bill volume.",
      state: "NM",
    },
  ],
  CA: [
    {
      title: "Comprehensive transparency + assessment package",
      summary:
        "California’s denser AI corpus often serves as a benchmark for impact assessment and public reporting architectures.",
      source: "Human editorial synthesis",
      editorialNote:
        "High volume alone is not “innovation”; the editorial flag is the packaging of assessment + inventory + AG enforcement.",
      state: "CA",
    },
  ],
};

function uniqueSponsorCount(bills: Bill[]): number {
  const names = new Set<string>();
  for (const bill of bills) {
    for (const sponsor of bill.sponsors) names.add(sponsor.name);
  }
  return names.size;
}

export function buildMomentumSnapshot(
  allBills: Bill[],
  selectedState: string | null,
): MomentumSnapshot {
  const scoped = scopeAiBills(allBills, selectedState);
  const scopeKey = selectedState ?? "national";
  const scopeLabel = selectedState
    ? (STATE_NAMES[selectedState] ?? selectedState)
    : "Nationwide";

  const bySession: SessionActivityRow[] = LEGISLATIVE_SESSIONS.filter(
    (s) => s.id !== "all",
  ).map((session) => ({
    sessionId: session.id,
    label: session.label,
    introduced: filterBySession(scoped, session.id).length,
  }));

  const yearlyWindows: YearlyActivityRow[] = ACTIVITY_YEAR_WINDOWS.map(
    (window) => ({
      id: window.id,
      label: window.label,
      count: countIntroducedInWindow(scoped, window.start, window.end),
    }),
  );

  const activityBase = {
    introducedCount: scoped.length,
    introducedLast7: countIntroducedSince(scoped, 7),
    introducedLast30: countIntroducedSince(scoped, 30),
    introducedLast90: countIntroducedSince(scoped, 90),
    updatedLast30: countUpdatedSince(scoped, 30),
    updatedLast90: countUpdatedSince(scoped, 90),
    bySession,
    yearlyWindows,
  };

  const topics = getTrendingTopics(scoped, 12);
  const domainsCovered = new Set(scoped.map((b) => b.subcategory)).size;
  const totalDomains = AI_TOPICS.length;
  const breadth: MomentumBreadth = {
    domainsCovered,
    totalDomains,
    coverageShare: Math.round((domainsCovered / totalDomains) * 100),
    topics,
  };

  const total = scoped.length || 1;
  const clearedCommitteeCount = scoped.filter(clearedCommittee).length;
  const clearedChamberCount = scoped.filter(clearedChamber).length;
  const enactedCount = scoped.filter((b) => b.status === "Enacted").length;
  const statusOrder = [
    "Introduced",
    "In Committee",
    "Passed",
    "Enacted",
    "Vetoed",
    "Failed",
  ] as const;
  const statusCounts = new Map<string, number>();
  for (const bill of scoped) {
    statusCounts.set(bill.status, (statusCounts.get(bill.status) ?? 0) + 1);
  }

  const progression: MomentumProgression = {
    total: scoped.length,
    clearedCommittee: clearedCommitteeCount,
    clearedChamber: clearedChamberCount,
    enacted: enactedCount,
    rates: {
      committee: Math.round((clearedCommitteeCount / total) * 100),
      chamber: Math.round((clearedChamberCount / total) * 100),
      enacted: Math.round((enactedCount / total) * 100),
    },
    statusBars: statusOrder
      .filter((status) => (statusCounts.get(status) ?? 0) > 0)
      .map((status) => ({ status, count: statusCounts.get(status) ?? 0 })),
  };

  const sponsorTotal = scoped.reduce((sum, b) => sum + b.sponsors.length, 0);
  const institutionalization: MomentumInstitutionalization = {
    uniqueSponsors: uniqueSponsorCount(scoped),
    avgSponsorsPerBill:
      scoped.length === 0
        ? 0
        : Math.round((sponsorTotal / scoped.length) * 10) / 10,
    enactedCount,
    executionSignals:
      EXECUTION_SIGNALS[scopeKey] ?? EXECUTION_SIGNALS.national,
  };

  const aiTrendSummary = buildTrendSummary(
    scopeLabel,
    activityBase,
    breadth,
    progression,
  );

  const activity: MomentumActivity = {
    ...activityBase,
    aiTrendSummary,
    humanVerification: {
      status: selectedState && ["IL", "NC", "NM", "CA"].includes(selectedState)
        ? "verified"
        : selectedState
          ? "draft"
          : "verified",
      note:
        selectedState && ["IL", "NC", "NM", "CA"].includes(selectedState)
          ? "Analyst reviewed the generated trend summary against tracked bill counts and topic tallies."
          : selectedState
            ? "AI draft summary — awaiting human verification for this state."
            : "Nationwide trend summary reviewed against prototype session and topic aggregates.",
      reviewer: "Yokum Lab research brief (prototype)",
    },
  };

  const innovation =
    INNOVATION_NOTES[scopeKey] ?? INNOVATION_NOTES.national;

  return {
    scopeKey,
    scopeLabel,
    activity,
    breadth,
    progression,
    institutionalization,
    innovation,
  };
}
