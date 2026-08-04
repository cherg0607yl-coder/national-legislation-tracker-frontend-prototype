import type {
  Bill,
  BillSponsor,
  BillStatus,
  NormalizedLegislativeStage,
} from "../types/bill";
import { STATE_NAMES, formatDisplayDate } from "./stats";
import { categoryToSlug } from "./categories";

export const LEGISLATIVE_STAGES: NormalizedLegislativeStage[] = [
  "Introduced",
  "Referred to Committee",
  "Passed First Chamber",
  "Passed Second Chamber",
  "Passed Legislature",
  "Awaiting Governor",
  "Signed into Law",
  "Vetoed",
  "Failed",
  "Withdrawn",
];

const STATUS_TO_STAGE: Record<BillStatus, NormalizedLegislativeStage> = {
  Introduced: "Introduced",
  "In Committee": "Referred to Committee",
  Passed: "Passed First Chamber",
  Enacted: "Signed into Law",
  Vetoed: "Vetoed",
  Failed: "Failed",
};

export function getOfficialUrl(bill: Bill): string {
  return bill.officialUrl ?? bill.sourceUrl;
}

export function sponsorNames(sponsors: BillSponsor[]): string[] {
  return sponsors.map((sponsor) => sponsor.name);
}

export function primarySponsors(sponsors: BillSponsor[]): BillSponsor[] {
  const primary = sponsors.filter((s) => s.role === "primary");
  if (primary.length > 0) return primary;
  return sponsors.slice(0, 1);
}

export function cosponsors(sponsors: BillSponsor[]): BillSponsor[] {
  const marked = sponsors.filter((s) => s.role === "cosponsor");
  if (marked.length > 0) return marked;
  return sponsors.slice(1);
}

export function sponsorInitials(name: string): string {
  const parts = name.replace(/^(Sen\.|Asm\.|Rep\.|Del\.)\s+/i, "").split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function getBillById(bills: Bill[], id: string): Bill | undefined {
  return bills.find((bill) => bill.id === id);
}

export function getRelatedBills(bills: Bill[], bill: Bill, limit = 4): Bill[] {
  if (bill.relatedBillIds?.length) {
    const byId = new Map(bills.map((item) => [item.id, item]));
    return bill.relatedBillIds
      .map((id) => byId.get(id))
      .filter((item): item is Bill => Boolean(item))
      .slice(0, limit);
  }

  return bills
    .filter(
      (item) =>
        item.id !== bill.id &&
        item.category === bill.category &&
        item.state !== bill.state,
    )
    .slice(0, limit);
}

export function relatedReason(bill: Bill, related: Bill): string {
  if (
    bill.category === "Artificial Intelligence" &&
    related.category === "Artificial Intelligence" &&
    bill.subcategory === related.subcategory
  ) {
    return `Similar because both bills address ${bill.subcategory.toLowerCase()} in the AI policy space.`;
  }
  if (bill.category === related.category) {
    return `Similar because both bills fall under ${bill.category}.`;
  }
  return "Similar because of overlapping policy themes across states.";
}

export function displayStatus(bill: Bill): string {
  return bill.normalizedStatus ?? STATUS_TO_STAGE[bill.status] ?? bill.status;
}

export function statusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("committee")) return "in-committee";
  if (normalized.includes("signed") || normalized.includes("enacted")) {
    return "enacted";
  }
  if (normalized.includes("veto")) return "vetoed";
  if (normalized.includes("fail") || normalized.includes("withdrawn")) {
    return "failed";
  }
  if (normalized.includes("pass")) return "passed";
  if (normalized.includes("introduced") || normalized.includes("awaiting")) {
    return "introduced";
  }
  return status.toLowerCase().replace(/\s+/g, "-");
}

export interface TimelineStageView {
  stage: NormalizedLegislativeStage;
  state: "complete" | "current" | "upcoming" | "terminal-inactive";
  date?: string;
  description?: string;
}

export interface TimelineModel {
  hasActionHistory: boolean;
  stages: TimelineStageView[];
  currentStage: NormalizedLegislativeStage;
}

function stageIndex(stage: NormalizedLegislativeStage): number {
  return LEGISLATIVE_STAGES.indexOf(stage);
}

export function buildTimeline(bill: Bill): TimelineModel {
  const actions = bill.actions ?? [];
  const hasActionHistory = actions.length > 0;
  const currentStage =
    (bill.normalizedStatus as NormalizedLegislativeStage | undefined) ??
    STATUS_TO_STAGE[bill.status];

  const reached = new Map<
    NormalizedLegislativeStage,
    NonNullable<Bill["actions"]>[number]
  >();

  for (const action of actions) {
    if (!action.stage) continue;
    const existing = reached.get(action.stage);
    if (!existing || action.date >= existing.date) {
      reached.set(action.stage, action);
    }
  }

  const terminal: NormalizedLegislativeStage[] = [
    "Signed into Law",
    "Vetoed",
    "Failed",
    "Withdrawn",
  ];
  const currentIndex = stageIndex(currentStage);

  const stages: TimelineStageView[] = LEGISLATIVE_STAGES.map((stage) => {
    const action = reached.get(stage);
    const index = stageIndex(stage);
    const isTerminal = terminal.includes(stage);

    if (!hasActionHistory) {
      if (stage === currentStage) {
        return {
          stage,
          state: "current",
          date: bill.latestActionDate ?? bill.lastUpdated,
          description: `Current status from bill record: ${displayStatus(bill)}.`,
        };
      }
      return {
        stage,
        state: "upcoming",
      };
    }

    if (action) {
      const isCurrent = stage === currentStage;
      return {
        stage,
        state: isCurrent ? "current" : "complete",
        date: action.date,
        description: action.action,
      };
    }

    if (stage === currentStage) {
      return {
        stage,
        state: "current",
        date: bill.latestActionDate ?? bill.lastUpdated,
        description: displayStatus(bill),
      };
    }

    if (isTerminal && stage !== currentStage) {
      return { stage, state: "terminal-inactive" };
    }

    if (!isTerminal && index < currentIndex && !terminal.includes(currentStage)) {
      return { stage, state: "complete" };
    }

    if (
      !isTerminal &&
      terminal.includes(currentStage) &&
      index < stageIndex("Signed into Law")
    ) {
      // For signed/vetoed/failed with gaps, mark earlier non-terminal stages complete only if before a known path
      if (currentStage === "Signed into Law" && index <= stageIndex("Awaiting Governor")) {
        return { stage, state: "complete" };
      }
    }

    return { stage, state: "upcoming" };
  });

  return { hasActionHistory, stages, currentStage };
}

export function billSessionLabel(bill: Bill): string | undefined {
  if (bill.session) return bill.session;
  const year = Number(bill.introducedDate.slice(0, 4));
  if (!Number.isFinite(year)) return undefined;
  if (year % 2 === 0) return `${year - 1}–${year}`;
  return `${year}–${year + 1}`;
}

export function billStateLabel(bill: Bill): string {
  return STATE_NAMES[bill.state] ?? bill.state;
}

export function formatBillIdLine(bill: Bill): string {
  return `${billStateLabel(bill)} · ${bill.billNumber}`;
}

export function formatOptionalDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  return formatDisplayDate(iso);
}

export function policyTags(bill: Bill): string[] {
  const tags = new Set<string>();
  tags.add(bill.subcategory);
  for (const tag of bill.subcategories ?? []) tags.add(tag);
  return [...tags];
}

export function categorySlugForBill(bill: Bill) {
  return categoryToSlug(bill.category);
}

export function formatAppliesTo(
  appliesTo: string | string[] | undefined,
): string | undefined {
  if (!appliesTo) return undefined;
  if (Array.isArray(appliesTo)) {
    return appliesTo.length > 0 ? appliesTo.join("; ") : undefined;
  }
  return appliesTo;
}

export interface HowBillWorksModel {
  policyGoal?: string;
  problemAddressed?: string;
  coreMechanism?: string;
  appliesTo?: string;
  expectedResult?: string;
  hasContent: boolean;
}

export function getHowBillWorks(bill: Bill): HowBillWorksModel {
  const ed = bill.editorial;
  const policyGoal = ed?.policyGoal;
  const problemAddressed = ed?.problemAddressed;
  const coreMechanism = ed?.coreMechanism ?? ed?.policyMechanism;
  const appliesTo = formatAppliesTo(ed?.appliesTo);
  const expectedResult = ed?.expectedResult;
  const hasContent = Boolean(
    policyGoal ||
      problemAddressed ||
      coreMechanism ||
      appliesTo ||
      expectedResult,
  );

  return {
    policyGoal,
    problemAddressed,
    coreMechanism,
    appliesTo,
    expectedResult,
    hasContent,
  };
}

export function getEffectiveDateLabel(bill: Bill): string | undefined {
  return (
    bill.effectiveDate ??
    bill.editorial?.implementation?.effectiveDate ??
    undefined
  );
}

export function getPolicyDesign(bill: Bill) {
  return bill.editorial?.policyDesign;
}

export function getWhatChanges(bill: Bill) {
  return bill.editorial?.whatChanges ?? [];
}

export function getConsiderationQuestions(bill: Bill) {
  const questions = bill.editorial?.questions ?? [];
  return questions.slice(0, 3);
}

