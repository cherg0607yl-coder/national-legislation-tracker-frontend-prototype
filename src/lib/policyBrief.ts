import type { Bill } from "../types/bill";
import type {
  BillSubstance,
  DistinctivenessFinding,
  GapFinding,
  PolicyBriefState,
} from "../types/policyDesign";
import {
  GAP_COVERAGE_LABEL,
  PROVENANCE_LABEL,
  REVIEW_STATUS_LABEL,
} from "../types/policyDesign";
import {
  DEFAULT_POLICY_BRIEF,
  getFindingById,
  getGapById,
  getSubstanceByBillId,
  NC_POLICY_DESIGN_META,
} from "../data/ncPolicyDesign";
import { formatBillIdLine } from "./bills";

export const POLICY_BRIEF_STORAGE_KEY = "nlt-nc-policy-brief-v1";

export function loadPolicyBrief(): PolicyBriefState {
  try {
    const raw = localStorage.getItem(POLICY_BRIEF_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_POLICY_BRIEF };
    const parsed = JSON.parse(raw) as Partial<PolicyBriefState>;
    return {
      ...DEFAULT_POLICY_BRIEF,
      ...parsed,
      findingIds: parsed.findingIds ?? [],
      gapIds: parsed.gapIds ?? [],
      billIds: parsed.billIds ?? [],
      substanceBillIds: parsed.substanceBillIds ?? [],
      draftingQuestions:
        parsed.draftingQuestions ?? DEFAULT_POLICY_BRIEF.draftingQuestions,
    };
  } catch {
    return { ...DEFAULT_POLICY_BRIEF };
  }
}

export function savePolicyBrief(brief: PolicyBriefState): void {
  try {
    localStorage.setItem(POLICY_BRIEF_STORAGE_KEY, JSON.stringify(brief));
  } catch {
    // Ignore quota / private-mode failures in the prototype.
  }
}

export function clearPolicyBriefStorage(): void {
  try {
    localStorage.removeItem(POLICY_BRIEF_STORAGE_KEY);
  } catch {
    // no-op
  }
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function toggleFinding(
  brief: PolicyBriefState,
  findingId: string,
): PolicyBriefState {
  return { ...brief, findingIds: toggleId(brief.findingIds, findingId) };
}

export function toggleGap(
  brief: PolicyBriefState,
  gapId: string,
): PolicyBriefState {
  return { ...brief, gapIds: toggleId(brief.gapIds, gapId) };
}

export function toggleBill(
  brief: PolicyBriefState,
  billId: string,
): PolicyBriefState {
  return { ...brief, billIds: toggleId(brief.billIds, billId) };
}

export function toggleSubstance(
  brief: PolicyBriefState,
  billId: string,
): PolicyBriefState {
  return {
    ...brief,
    substanceBillIds: toggleId(brief.substanceBillIds, billId),
  };
}

function formatSubstanceBlock(substance: BillSubstance, bill?: Bill): string {
  const heading = bill
    ? formatBillIdLine(bill)
    : `Bill ${substance.billId}`;
  const cond = (label: string, value: string | null) =>
    `${label}: ${value ?? "Not identified in the bill text"}`;

  return [
    heading,
    `Problem addressed: ${substance.problemAddressed}`,
    `Applies to: ${substance.appliesTo}`,
    `Core mechanism: ${substance.coreMechanism}`,
    cond("Exceptions", substance.exceptions),
    cond("Enforcement", substance.enforcement),
    cond("Administration", substance.administration),
    `Provenance: ${PROVENANCE_LABEL[substance.provenance]}`,
    `Review: ${REVIEW_STATUS_LABEL[substance.reviewStatus]}`,
  ].join("\n");
}

export function buildBriefCopyText(
  brief: PolicyBriefState,
  billsById: Map<string, Bill>,
): string {
  const findings = brief.findingIds
    .map((id) => getFindingById(id))
    .filter((item): item is DistinctivenessFinding => Boolean(item));
  const gaps = brief.gapIds
    .map((id) => getGapById(id))
    .filter((item): item is GapFinding => Boolean(item));
  const refBills = brief.billIds
    .map((id) => billsById.get(id))
    .filter((item): item is Bill => Boolean(item));
  const substances = brief.substanceBillIds
    .map((id) => getSubstanceByBillId(id))
    .filter((item): item is BillSubstance => Boolean(item));

  const lines: string[] = [
    NC_POLICY_DESIGN_META.pageTitle,
    "Draft analysis — pending team review",
    NC_POLICY_DESIGN_META.disclaimer,
    "",
    "## Policy objective",
    brief.objective.trim() || "(none)",
    "",
    "## North Carolina landscape",
    "See curated landscape summary on the Policy Design page (draft — pending team review).",
    "",
    "## Distinctive NC approaches",
  ];

  if (findings.length === 0) {
    lines.push("(none selected)");
  } else {
    for (const finding of findings) {
      lines.push(
        `- ${finding.title}`,
        `  ${finding.summary}`,
        `  Comparison: ${finding.comparisonContext}`,
        `  ${REVIEW_STATUS_LABEL[finding.reviewStatus]}`,
      );
    }
  }

  lines.push("", "## Potential policy gaps");
  if (gaps.length === 0) {
    lines.push("(none selected)");
  } else {
    for (const gap of gaps) {
      lines.push(
        `- ${gap.title} [${GAP_COVERAGE_LABEL[gap.coverageStatus]}]`,
        `  ${gap.description}`,
        `  ${REVIEW_STATUS_LABEL[gap.reviewStatus]}`,
      );
    }
  }

  lines.push("", "## Reference bills");
  if (refBills.length === 0) {
    lines.push("(none selected)");
  } else {
    for (const bill of refBills) {
      lines.push(
        `- ${formatBillIdLine(bill)} — ${bill.title} (${bill.status})`,
      );
    }
  }

  lines.push("", "## Bill-substance notes");
  if (substances.length === 0) {
    lines.push("(none selected)");
  } else {
    for (const substance of substances) {
      lines.push(
        formatSubstanceBlock(substance, billsById.get(substance.billId)),
        "",
      );
    }
  }

  lines.push(
    "## External sources",
    "Official legislature links are available on each bill detail page. Prototype URLs are fictional.",
    "",
    "## User notes",
    brief.notes.trim() || "(none)",
    "",
    "## Open drafting questions",
  );

  if (brief.draftingQuestions.length === 0) {
    lines.push("(none)");
  } else {
    for (const question of brief.draftingQuestions) {
      lines.push(`- ${question}`);
    }
  }

  lines.push(
    "",
    "— End of brief —",
    "This brief does not draft legislation or state legal conclusions.",
  );

  return lines.join("\n");
}
