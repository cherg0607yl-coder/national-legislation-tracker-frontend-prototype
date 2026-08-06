/**
 * Contracts for the North Carolina AI Policy Design prototype page.
 * Analytical content is provisional until team review.
 */

export type ReviewStatus = "draft" | "team_review_required" | "approved";

export type ProvenanceType =
  | "official_source"
  | "project_extracted"
  | "comparative_analysis"
  | "editorial_interpretation"
  | "insufficient_data";

export type GapCoverageStatus =
  | "addressed"
  | "partial"
  | "not_identified"
  | "insufficient_data";

/** Six-field bill-substance model (core + conditional). */
export interface BillSubstance {
  billId: string;
  /** Core: problem, risk, or policy gap the bill responds to. */
  problemAddressed: string;
  /** Core: people, organizations, technologies, or activities regulated. */
  appliesTo: string;
  /** Core: legal requirement, prohibition, authorization, or program. */
  coreMechanism: string;
  /**
   * Conditional: carve-outs. Null = not identified in the bill text
   * (not an extraction failure).
   */
  exceptions: string | null;
  /**
   * Conditional: penalties, remedies, or consequences.
   * Null = not identified in the bill text.
   */
  enforcement: string | null;
  /**
   * Conditional: agency or body responsible for implementation.
   * Null = not identified in the bill text.
   */
  administration: string | null;
  provenance: ProvenanceType;
  reviewStatus: ReviewStatus;
  /** Optional official or mock source URLs for review. */
  sourceRefs?: string[];
}

export interface DistinctivenessFinding {
  id: string;
  title: string;
  summary: string;
  comparisonContext: string;
  supportingNcBillIds: string[];
  supportingPeerBillIds?: string[];
  provenance: ProvenanceType;
  reviewStatus: ReviewStatus;
}

export interface GapFinding {
  id: string;
  title: string;
  description: string;
  coverageStatus: GapCoverageStatus;
  comparisonStates: string[];
  supportingPeerBillIds: string[];
  relatedNcBillIds?: string[];
  provenance: ProvenanceType;
  reviewStatus: ReviewStatus;
}

export interface NcLandscapeSummary {
  headline: string;
  summary: string;
  featuredBillIds: string[];
  topDomainLabels: string[];
  provenance: ProvenanceType;
  reviewStatus: ReviewStatus;
}

export interface PolicyBriefState {
  objective: string;
  findingIds: string[];
  gapIds: string[];
  billIds: string[];
  substanceBillIds: string[];
  notes: string;
  draftingQuestions: string[];
}

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: "Draft analysis",
  team_review_required: "Draft analysis — pending team review",
  approved: "Team-approved analysis",
};

export const PROVENANCE_LABEL: Record<ProvenanceType, string> = {
  official_source: "Official legislative source",
  project_extracted: "Project-extracted analysis",
  comparative_analysis: "Comparative analysis",
  editorial_interpretation: "Editorial interpretation",
  insufficient_data: "Insufficient data in current corpus",
};

export const GAP_COVERAGE_LABEL: Record<GapCoverageStatus, string> = {
  addressed: "Addressed in current corpus",
  partial: "Partial coverage in current corpus",
  not_identified: "Not identified in the current corpus",
  insufficient_data: "Insufficient data to assess",
};
