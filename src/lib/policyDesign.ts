import type { Bill, PolicyCategory } from "../types/bill";
import { STATE_NAMES, getTrendingTopics, type TopicStat } from "./stats";

export const POLICY_DESIGN_CATEGORIES: {
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
      "Compare how states regulate AI use, transparency, and accountability.",
    available: true,
  },
  {
    category: "Outcome Evaluations",
    description:
      "Requirements to evaluate program results, evidence, and impact.",
    available: false,
  },
];

export const MAX_COMPARE_STATES = 3;

export interface GapExampleBill {
  id: string;
  state: string;
  stateName: string;
  billNumber: string;
  title: string;
  topic: string;
  summary: string;
}

export interface PolicyGap {
  topic: string;
  description: string;
  exampleBills: GapExampleBill[];
}

export interface DistinctiveEmphasis {
  topic: string;
  title: string;
  description: string;
  rarityNote: string;
}

export interface StateAiProfile {
  state: string;
  stateName: string;
  billCount: number;
  enactedCount: number;
  activeCount: number;
  momentumScore: number;
  momentumLevel: 0 | 1 | 2 | 3;
  trendingTopics: TopicStat[];
  summary: string;
  distinctive: DistinctiveEmphasis[];
  gaps: PolicyGap[];
  bills: Bill[];
}

function statusWeight(status: Bill["status"]): number {
  switch (status) {
    case "Enacted":
      return 4;
    case "Passed":
      return 3;
    case "In Committee":
      return 2;
    case "Introduced":
      return 1;
    default:
      return 0.5;
  }
}

export function getAiBills(bills: Bill[]): Bill[] {
  return bills.filter((b) => b.category === "Artificial Intelligence");
}

export function computeMomentumByState(
  aiBills: Bill[],
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const bill of aiBills) {
    scores[bill.state] = (scores[bill.state] ?? 0) + statusWeight(bill.status);
  }
  return scores;
}

export function momentumLevel(score: number, maxScore: number): 0 | 1 | 2 | 3 {
  if (score <= 0 || maxScore <= 0) return 0;
  const ratio = score / maxScore;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.45) return 2;
  if (ratio >= 0.2) return 1;
  return 1;
}

function topicStateCoverage(aiBills: Bill[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const bill of aiBills) {
    const set = map.get(bill.subcategory) ?? new Set<string>();
    set.add(bill.state);
    map.set(bill.subcategory, set);
  }
  return map;
}

function buildDistinctive(
  state: string,
  stateBills: Bill[],
  coverage: Map<string, Set<string>>,
  totalStatesWithAi: number,
): DistinctiveEmphasis[] {
  const topics = [...new Set(stateBills.map((b) => b.subcategory))];
  return topics.map((topic) => {
    const states = coverage.get(topic) ?? new Set();
    const otherCount = [...states].filter((s) => s !== state).length;
    const bill = stateBills.find((b) => b.subcategory === topic)!;
    const rarityNote =
      otherCount === 0
        ? "Only this state tracks a bill in this topic in the prototype corpus."
        : otherCount === 1
          ? "Only one other state currently shares this topic focus."
          : `${otherCount} other states also address this topic (${totalStatesWithAi} with AI bills overall).`;

    return {
      topic,
      title: topic,
      description: bill.summary,
      rarityNote,
    };
  });
}

function buildGaps(
  state: string,
  stateTopics: Set<string>,
  aiBills: Bill[],
  coverage: Map<string, Set<string>>,
): PolicyGap[] {
  const nationalTopics = getTrendingTopics(aiBills, 12);
  const missing = nationalTopics
    .filter((t) => !stateTopics.has(t.topic))
    .filter((t) => (coverage.get(t.topic)?.size ?? 0) >= 1)
    .slice(0, 3);

  return missing.map((topicStat) => {
    const examples = aiBills
      .filter(
        (b) => b.subcategory === topicStat.topic && b.state !== state,
      )
      .slice(0, 2)
      .map((b) => ({
        id: b.id,
        state: b.state,
        stateName: STATE_NAMES[b.state] ?? b.state,
        billNumber: b.billNumber,
        title: b.title,
        topic: b.subcategory,
        summary: b.summary,
      }));

    return {
      topic: topicStat.topic,
      description: `Other states are advancing ${topicStat.topic.toLowerCase()} AI measures, but ${STATE_NAMES[state] ?? state} does not yet have a tracked bill in this topic.`,
      exampleBills: examples,
    };
  });
}

const EDITORIAL_SUMMARY: Partial<Record<string, string>> = {
  NC: "North Carolina’s expanded AI corpus leans toward education-sector uses, campus and training safeguards, impact assessment, and election-related automated tools. Relative to labor-heavy or private-right-of-action states, NC’s distinctive edge is school and civic-tech guardrails—while gaps often remain in employment AI rules and private enforcement pathways.",
  IL: "Illinois shows strong momentum around workplace AI, government deployment standards, health uses, and private rights of action. Its comparative strength is labor and consumer-enforcement framing; education-campus and election-deepfake packages appear thinner than in some peer states.",
  NM: "New Mexico’s AI activity emphasizes private rights of action, oversight/governance, studies, and housing-related automated decisions. That creates a distinctive accountability and research posture—while dense education-use or employment packages are less common than in NC or IL.",
  CA: "California shows the densest AI legislative footprint among early prototype leaders, pairing impact-assessment and accountability themes with criminal-use controls. Its package remains a useful benchmark when identifying gaps elsewhere.",
  TX: "Texas activity in this corpus leans toward audit and oversight of automated systems, offering a compliance-oriented contrast to disclosure-heavy approaches elsewhere.",
  NY: "New York’s tracked AI measure focuses on child-protection and criminal misuse of generative tools—narrow but high-salience framing compared with broader transparency regimes.",
};

export function buildStateAiProfile(
  state: string,
  allBills: Bill[],
): StateAiProfile {
  const aiBills = getAiBills(allBills);
  const stateBills = aiBills.filter((b) => b.state === state);
  const scores = computeMomentumByState(aiBills);
  const maxScore = Math.max(0, ...Object.values(scores));
  const score = scores[state] ?? 0;
  const coverage = topicStateCoverage(aiBills);
  const statesWithAi = new Set(aiBills.map((b) => b.state)).size;
  const stateTopics = new Set(stateBills.map((b) => b.subcategory));
  const trendingTopics = getTrendingTopics(stateBills, 8);

  const defaultSummary =
    stateBills.length === 0
      ? `${STATE_NAMES[state] ?? state} has no Artificial Intelligence bills in the current prototype dataset. Use the gaps below to explore approaches other states are testing.`
      : `${STATE_NAMES[state] ?? state} currently tracks ${stateBills.length} AI bill${stateBills.length === 1 ? "" : "s"} in this prototype. Top focus: ${trendingTopics.map((t) => t.topic).join(", ") || "general AI policy"}.`;

  return {
    state,
    stateName: STATE_NAMES[state] ?? state,
    billCount: stateBills.length,
    enactedCount: stateBills.filter((b) => b.status === "Enacted").length,
    activeCount: stateBills.filter((b) =>
      ["Introduced", "In Committee", "Passed"].includes(b.status),
    ).length,
    momentumScore: score,
    momentumLevel: momentumLevel(score, maxScore),
    trendingTopics,
    summary: EDITORIAL_SUMMARY[state] ?? defaultSummary,
    distinctive:
      stateBills.length > 0
        ? buildDistinctive(state, stateBills, coverage, statesWithAi)
        : [],
    gaps: buildGaps(state, stateTopics, aiBills, coverage),
    bills: stateBills,
  };
}

export function buildMomentumLevels(
  aiBills: Bill[],
): Record<string, 0 | 1 | 2 | 3> {
  const scores = computeMomentumByState(aiBills);
  const maxScore = Math.max(0, ...Object.values(scores));
  const levels: Record<string, 0 | 1 | 2 | 3> = {};
  for (const [state, score] of Object.entries(scores)) {
    levels[state] = momentumLevel(score, maxScore);
  }
  return levels;
}

export function toggleCompareState(
  current: string[],
  state: string,
  max = MAX_COMPARE_STATES,
): string[] {
  if (current.includes(state)) {
    return current.filter((s) => s !== state);
  }
  if (current.length >= max) {
    return [...current.slice(1), state];
  }
  return [...current, state];
}

export function topMomentumStates(
  aiBills: Bill[],
  limit = 10,
): { state: string; stateName: string; billCount: number; score: number }[] {
  const scores = computeMomentumByState(aiBills);
  const counts: Record<string, number> = {};
  for (const bill of aiBills) {
    counts[bill.state] = (counts[bill.state] ?? 0) + 1;
  }

  return Object.keys(counts)
    .map((state) => ({
      state,
      stateName: STATE_NAMES[state] ?? state,
      billCount: counts[state] ?? 0,
      score: scores[state] ?? 0,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.billCount - a.billCount ||
        a.stateName.localeCompare(b.stateName),
    )
    .slice(0, limit);
}

export function statusBreakdown(
  bills: Bill[],
): { status: string; count: number }[] {
  const order = [
    "Introduced",
    "In Committee",
    "Passed",
    "Enacted",
    "Vetoed",
    "Failed",
  ];
  const counts = new Map<string, number>();
  for (const bill of bills) {
    counts.set(bill.status, (counts.get(bill.status) ?? 0) + 1);
  }
  return order
    .filter((status) => (counts.get(status) ?? 0) > 0)
    .map((status) => ({ status, count: counts.get(status) ?? 0 }));
}

/** Shared topics across selected profiles for grouped comparison bars. */
export function buildTopicCompareRows(
  profiles: StateAiProfile[],
  limit = 6,
): {
  topic: string;
  series: { state: string; stateName: string; value: number }[];
}[] {
  if (profiles.length === 0) return [];

  const topicTotals = new Map<string, number>();
  for (const profile of profiles) {
    for (const topic of profile.trendingTopics) {
      topicTotals.set(
        topic.topic,
        (topicTotals.get(topic.topic) ?? 0) + topic.count,
      );
    }
  }

  const topTopics = [...topicTotals.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([topic]) => topic);

  return topTopics.map((topic) => ({
    topic,
    series: profiles.map((profile) => ({
      state: profile.state,
      stateName: profile.stateName,
      value:
        profile.trendingTopics.find((t) => t.topic === topic)?.count ??
        profile.bills.filter((b) => b.subcategory === topic).length,
    })),
  }));
}
