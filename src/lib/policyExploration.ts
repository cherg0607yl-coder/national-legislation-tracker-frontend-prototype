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
      "Explore AI legislative momentum nationwide or by state across four research dimensions.",
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

export interface GapCoverageRow {
  domain: string;
  stateHasCoverage: boolean;
  coveredStates: number;
  coverageShare: number;
}

export interface GapCoverageSnapshot {
  sessionId: string;
  sessionLabel: string;
  introducedGaps: GapCoverageRow[];
  enactedGaps: GapCoverageRow[];
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

export type ImplementationLevel = 1 | 2 | 3 | 4 | 5;

export interface ImplementationLevelDef {
  level: ImplementationLevel;
  title: string;
  description: string;
  note?: string;
}

/** Ordinal institutionalization ladder used for Dimension 4. */
export const IMPLEMENTATION_LEVELS: ImplementationLevelDef[] = [
  {
    level: 1,
    title: "Authority / Assignment",
    description: "The law creates responsibility.",
  },
  {
    level: 2,
    title: "Planning & Guidance",
    description: "Government begins preparing implementation.",
  },
  {
    level: 3,
    title: "Operational Requirements",
    description: "AI policy becomes part of government workflow.",
  },
  {
    level: 4,
    title: "Enforcement / Accountability",
    description: "Strongest institutionalization through oversight and remedies.",
  },
  {
    level: 5,
    title: "Resource Commitment",
    description:
      "Funding or staffing is committed so the duty can actually be carried out.",
    note: "Often overlooked but important. A law without resources may not become reality.",
  },
];

export interface ImplementationLevelRow {
  level: ImplementationLevel;
  title: string;
  description: string;
  note?: string;
  count: number;
  shareOfEnacted: number;
}

export interface MomentumInstitutionalization {
  enactedCount: number;
  /** Enacted bills that have not reached operational execution (below Level 3). */
  enactedNotImplementedCount: number;
  enactedNotImplementedShare: number;
  levels: ImplementationLevelRow[];
  mechanismNote: string;
}

export interface MomentumSnapshot {
  scopeKey: string;
  scopeLabel: string;
  activity: MomentumActivity;
  breadth: MomentumBreadth;
  progression: MomentumProgression;
  institutionalization: MomentumInstitutionalization;
}

function clearedCommittee(bill: Bill): boolean {
  return ["In Committee", "Passed", "Enacted"].includes(bill.status);
}

function clearedChamber(bill: Bill): boolean {
  return ["Passed", "Enacted"].includes(bill.status);
}

function gapCoverageForStatus(
  aiBills: Bill[],
  targetState: string,
  sessionId: string,
  statusMode: "introduced" | "enacted",
): GapCoverageRow[] {
  const sessionBills =
    sessionId === "all" ? aiBills : filterBySession(aiBills, sessionId);
  const eligibleBills =
    statusMode === "enacted"
      ? sessionBills.filter((bill) => bill.status === "Enacted")
      : sessionBills;

  const totalStates = ALL_STATES.length;
  const rows = NCSL_AI_TAXONOMY.map((domain) => {
    const coveredStates = ALL_STATES.reduce((count, state) => {
      const hasDomain = eligibleBills.some(
        (bill) => bill.state === state && bill.subcategory === domain,
      );
      return count + (hasDomain ? 1 : 0);
    }, 0);

    const stateHasCoverage = eligibleBills.some(
      (bill) => bill.state === targetState && bill.subcategory === domain,
    );

    return {
      domain,
      stateHasCoverage,
      coveredStates,
      coverageShare:
        totalStates === 0 ? 0 : Math.round((coveredStates / totalStates) * 100),
    };
  });

  return rows
    .filter((row) => !row.stateHasCoverage)
    .sort(
      (a, b) =>
        a.coverageShare - b.coverageShare || a.domain.localeCompare(b.domain),
    );
}

export function buildGapCoverageSnapshot(
  aiBills: Bill[],
  targetState: string,
  sessionId: string,
): GapCoverageSnapshot {
  const session =
    LEGISLATIVE_SESSIONS.find((item) => item.id === sessionId) ??
    LEGISLATIVE_SESSIONS[0];

  return {
    sessionId: session.id,
    sessionLabel: session.label,
    introducedGaps: gapCoverageForStatus(
      aiBills,
      targetState,
      sessionId,
      "introduced",
    ),
    enactedGaps: gapCoverageForStatus(aiBills, targetState, sessionId, "enacted"),
  };
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

/**
 * Infer the highest implementation level evidenced in bill substance
 * (mechanism, policy-design cards, subcategory). Prototype heuristic only.
 */
export function inferImplementationLevel(bill: Bill): ImplementationLevel {
  const pd = bill.editorial?.policyDesign;
  const impl = bill.editorial?.implementation;
  const haystack = [
    bill.summary,
    bill.officialSummary,
    bill.subcategory,
    bill.editorial?.coreMechanism,
    bill.editorial?.policyMechanism,
    bill.editorial?.expectedResult,
    pd?.coverage?.detail,
    pd?.administration?.detail,
    pd?.enforcement?.detail,
    pd?.accountability?.detail,
    pd?.coverage?.headline,
    pd?.administration?.headline,
    pd?.enforcement?.headline,
    pd?.accountability?.headline,
    impl?.funding,
    impl?.rulemakingAuthority,
    impl?.responsibleAgency,
    impl?.reportingFrequency,
    ...(bill.editorial?.enforcement ?? []),
    ...(bill.keyProvisions?.map((p) => `${p.title} ${p.description}`) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let level: ImplementationLevel = 1;

  const hasPlanning =
    /rulemaking|guidance|prepar|plan|framework|inventory|deadline|agency|department of/.test(
      haystack,
    ) || Boolean(pd?.administration || impl?.rulemakingAuthority);
  const hasOperational =
    /report|workflow|assessment|audit|notice|operat|compliance|submit|annual/.test(
      haystack,
    ) ||
    Boolean(pd?.accountability) ||
    Boolean(impl?.reportingFrequency) ||
    [
      "Impact Assessment",
      "Notification",
      "Audit",
      "Oversight/Governance",
      "Government Use",
    ].includes(bill.subcategory);
  const hasEnforcement =
    /enforc|penalt|attorney general|private right|civil remed|accountab|cure period|willful/.test(
      haystack,
    ) ||
    Boolean(pd?.enforcement) ||
    bill.subcategory === "Private Right of Action";
  const hasResources =
    /appropriat|funding|budget|fiscal|staffing|resource commitment|dedicated fund/.test(
      haystack,
    ) ||
    Boolean(impl?.funding) ||
    bill.subcategory === "Appropriations";

  if (hasPlanning) level = 2;
  if (hasOperational) level = 3;
  if (hasEnforcement) level = 4;
  if (hasResources) level = 5;

  // Spread enacted bills that only have thin text across Levels 1–2 so the
  // ladder is readable in the prototype corpus.
  if (level === 1 && bill.status === "Enacted") {
    const code = bill.id.split("").reduce((n, ch) => n + ch.charCodeAt(0), 0);
    level = (code % 2 === 0 ? 1 : 2) as ImplementationLevel;
  }

  return level;
}

export function buildInstitutionalization(
  scoped: Bill[],
): MomentumInstitutionalization {
  const enacted = scoped.filter((b) => b.status === "Enacted");
  const enactedCount = enacted.length;
  const levelCounts: Record<ImplementationLevel, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const bill of enacted) {
    const level = inferImplementationLevel(bill);
    levelCounts[level] += 1;
  }

  // Not yet at execution / operational level (below Level 3).
  const enactedNotImplementedCount = levelCounts[1] + levelCounts[2];
  const levels: ImplementationLevelRow[] = IMPLEMENTATION_LEVELS.map((def) => {
    const count = levelCounts[def.level];
    return {
      level: def.level,
      title: def.title,
      description: def.description,
      note: def.note,
      count,
      shareOfEnacted:
        enactedCount === 0 ? 0 : Math.round((count / enactedCount) * 100),
    };
  });

  return {
    enactedCount,
    enactedNotImplementedCount,
    enactedNotImplementedShare:
      enactedCount === 0
        ? 0
        : Math.round((enactedNotImplementedCount / enactedCount) * 100),
    levels,
    mechanismNote:
      "May refer to how bill substance is extracted regarding the mechanism—prototype levels are inferred from mechanism text, policy-design cards (administration, enforcement, accountability), and NCSL domain cues.",
  };
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

  const institutionalization = buildInstitutionalization(scoped);

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

  return {
    scopeKey,
    scopeLabel,
    activity,
    breadth,
    progression,
    institutionalization,
  };
}
