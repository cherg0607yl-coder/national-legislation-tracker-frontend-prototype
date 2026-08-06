/**
 * Centralized analytical fixtures for the NC AI Policy Design page.
 *
 * ALL FINDINGS BELOW ARE PROVISIONAL — pending team review.
 * Edit this file to revise provenance, substance, distinctiveness,
 * gaps, and supporting bill mappings without changing presentation components.
 */

import type {
  BillSubstance,
  DistinctivenessFinding,
  GapFinding,
  NcLandscapeSummary,
  PolicyBriefState,
} from "../types/policyDesign";

export const NC_POLICY_DESIGN_META = {
  stateCode: "NC",
  stateName: "North Carolina",
  pageTitle: "North Carolina AI Policy Design",
  disclaimer:
    "Prototype page using fictional mock legislation. All comparative findings, bill-substance summaries, distinctiveness claims, and gap descriptions are draft analysis — pending team review. This page does not provide legal advice or draft legislation.",
} as const;

/** Curated landscape narrative for North Carolina AI activity. */
export const NC_LANDSCAPE_SUMMARY: NcLandscapeSummary = {
  headline: "Public-sector AI use, education, and assessment appear most active",
  summary:
    "In the prototype corpus, North Carolina’s tracked AI bills concentrate in impact assessment, education use, studies, and government-use oversight, with additional attention to elections and deepfake content. Progression is mixed: many measures remain in committee, while a smaller set of enacted bills provides early institutional anchors. Treat domain tallies as corpus observations, not as a complete inventory of North Carolina law.",
  featuredBillIds: [
    "bill-080",
    "bill-054",
    "bill-081",
    "bill-057",
    "bill-075",
  ],
  topDomainLabels: [
    "Impact Assessment",
    "Education Use",
    "Studies",
    "Government Use",
    "Elections",
    "Deepfake",
  ],
  provenance: "comparative_analysis",
  reviewStatus: "team_review_required",
};

/**
 * Six-field substance records for selected NC bills.
 * Conditional fields are null only when not identified in available bill text
 * for this prototype fixture — not because extraction failed.
 */
export const NC_BILL_SUBSTANCE: BillSubstance[] = [
  {
    billId: "bill-080",
    problemAddressed:
      "Synthetic media and deepfake content can be used to mislead the public and disrupt civic processes without clear disclosure or accountability rules.",
    appliesTo:
      "Persons who create or distribute covered deepfake content in contexts addressed by the measure, including uses involving public officials or election-related communications as described in the bill text.",
    coreMechanism:
      "Creates oversight and disclosure-oriented requirements for covered deepfake content, paired with designated agency guidance and reporting obligations.",
    exceptions:
      "Narrow research exemption and a limited public-safety exception as stated in the bill text.",
    enforcement:
      "Administrative enforcement by the designated agency, with civil remedies where authorized.",
    administration: "Attorney General",
    provenance: "project_extracted",
    reviewStatus: "team_review_required",
    sourceRefs: ["https://example.gov/bills/nc/hb-2097"],
  },
  {
    billId: "bill-054",
    problemAddressed:
      "Education settings may adopt AI tools without consistent safeguards for students, families, and school agencies.",
    appliesTo:
      "State agencies deploying covered AI tools and private entities offering covered systems to public agencies in education contexts.",
    coreMechanism:
      "Establishes statutory requirements, agency guidance, and reporting obligations for covered education-related AI uses.",
    exceptions:
      "Narrow research exemption and limited public-safety exception as stated in the bill text.",
    enforcement:
      "Administrative enforcement by the designated agency; civil remedies where authorized.",
    administration: "Attorney General",
    provenance: "project_extracted",
    reviewStatus: "team_review_required",
  },
  {
    billId: "bill-081",
    problemAddressed:
      "State government may deploy AI tools without a consistent oversight framework for public-sector use.",
    appliesTo:
      "State agencies deploying covered AI tools and vendors offering covered systems to public agencies.",
    coreMechanism:
      "Creates statewide government-use oversight duties, including guidance and reporting obligations for covered deployments.",
    exceptions: null,
    enforcement:
      "Administrative enforcement by the designated agency; civil remedies where authorized.",
    administration: "Attorney General",
    provenance: "project_extracted",
    reviewStatus: "team_review_required",
  },
  {
    billId: "bill-057",
    problemAddressed:
      "Election-related AI uses may create risks for voters and election administrators without targeted safeguards.",
    appliesTo:
      "State agencies and covered private entities involved in election-related AI deployments described by the measure.",
    coreMechanism:
      "Imposes statutory requirements, agency guidance, and reporting obligations for covered elections-related AI uses.",
    exceptions:
      "Narrow research exemption and limited public-safety exception as stated in the bill text.",
    enforcement: null,
    administration: "Attorney General",
    provenance: "project_extracted",
    reviewStatus: "team_review_required",
  },
  {
    billId: "bill-075",
    problemAddressed:
      "Automated systems may affect people without a structured assessment of impacts before deployment.",
    appliesTo:
      "State agencies deploying covered automated systems and private entities offering those systems to public agencies.",
    coreMechanism:
      "Requires impact assessments and related reporting for covered automated systems.",
    exceptions: null,
    enforcement: null,
    administration: "Attorney General",
    provenance: "project_extracted",
    reviewStatus: "team_review_required",
  },
];

/** Curated distinctiveness findings — do not infer dynamically. */
export const NC_DISTINCTIVENESS_FINDINGS: DistinctivenessFinding[] = [
  {
    id: "finding-education-use",
    title: "Education-use AI measures are comparatively prominent",
    summary:
      "Within the prototype corpus, North Carolina shows a relatively high count of AI bills tagged to education use, including consumer-protection-oriented education measures. This pattern suggests education settings are an active framing for state AI proposals in the tracked set.",
    comparisonContext:
      "Compared with peer concentration states in this corpus (Illinois and New Mexico), education-use tagging appears more frequently among North Carolina AI bills. This is a corpus observation, not a claim that North Carolina uniquely regulates education AI in statute.",
    supportingNcBillIds: ["bill-054", "bill-100"],
    supportingPeerBillIds: ["bill-163"],
    provenance: "comparative_analysis",
    reviewStatus: "team_review_required",
  },
  {
    id: "finding-impact-assessment",
    title: "Impact assessment is a recurring design motif",
    summary:
      "Impact assessment is among the most common AI domains in the North Carolina tracked set, spanning introduced, failed, and active measures that emphasize pre-deployment review and reporting.",
    comparisonContext:
      "Peer states also track impact-assessment bills (for example California’s enacted transparency measure in this corpus). North Carolina’s volume in this domain is notable relative to thinner-coverage states, but quality and enactment outcomes vary.",
    supportingNcBillIds: ["bill-075", "bill-015"],
    supportingPeerBillIds: ["bill-001", "bill-163"],
    provenance: "comparative_analysis",
    reviewStatus: "team_review_required",
  },
  {
    id: "finding-deepfake-enacted",
    title: "Deepfake oversight appears among enacted anchors",
    summary:
      "The corpus includes an enacted North Carolina deepfake oversight measure that provides a concrete institutional reference point alongside a larger pipeline of still-pending AI bills.",
    comparisonContext:
      "Other states in the corpus also advance deepfake or synthetic-media measures. The North Carolina enacted example is useful for comparison of institutionalization, not as evidence of comprehensive synthetic-media policy.",
    supportingNcBillIds: ["bill-080", "bill-083"],
    supportingPeerBillIds: [],
    provenance: "comparative_analysis",
    reviewStatus: "team_review_required",
  },
];

/**
 * Potential policy gaps supported by prototype data.
 * Language must remain corpus-relative ("not identified"), never absolute absence.
 */
export const NC_GAP_FINDINGS: GapFinding[] = [
  {
    id: "gap-private-right-of-action",
    title: "Private right of action for AI harms",
    description:
      "Several peer-state AI bills in this corpus are tagged to private right of action. No North Carolina AI bill in the current corpus is tagged to that domain. This does not mean North Carolina law lacks remedies elsewhere; it means this component was not identified in the tracked AI bill set.",
    coverageStatus: "not_identified",
    comparisonStates: ["IL", "NM"],
    supportingPeerBillIds: ["bill-159", "bill-170", "bill-153", "bill-020"],
    relatedNcBillIds: [],
    provenance: "comparative_analysis",
    reviewStatus: "team_review_required",
  },
  {
    id: "gap-energy-domain",
    title: "Energy-sector AI domain coverage",
    description:
      "Peer legislation in the corpus includes AI measures tagged to energy. North Carolina’s tracked AI set does not currently include that domain tag. Treat this as a coverage observation against the NCSL-style taxonomy used in the prototype, not as a definitive policy void.",
    coverageStatus: "not_identified",
    comparisonStates: ["IL"],
    supportingPeerBillIds: ["bill-198"],
    relatedNcBillIds: [],
    provenance: "comparative_analysis",
    reviewStatus: "team_review_required",
  },
  {
    id: "gap-housing-domain",
    title: "Housing-related AI domain coverage",
    description:
      "Housing-tagged AI bills appear for at least one comparison state in the corpus and are not identified among North Carolina’s tracked AI bills. Further review is needed before treating this as a legislative priority gap.",
    coverageStatus: "not_identified",
    comparisonStates: ["IL", "NM"],
    supportingPeerBillIds: ["bill-173", "bill-264"],
    relatedNcBillIds: [],
    provenance: "comparative_analysis",
    reviewStatus: "team_review_required",
  },
  {
    id: "gap-mechanism-strength",
    title: "Mechanism strength versus peer mandates",
    description:
      "Comparing whether North Carolina bills use studies versus mandates, or lighter versus stronger enforcement designs, requires structured mechanism coding that is not yet available as first-class fields in this prototype.",
    coverageStatus: "insufficient_data",
    comparisonStates: ["IL", "CA", "NM"],
    supportingPeerBillIds: ["bill-001", "bill-159"],
    relatedNcBillIds: ["bill-064", "bill-075"],
    provenance: "insufficient_data",
    reviewStatus: "team_review_required",
  },
  {
    id: "gap-agenda-salience",
    title: "Local agenda salience without introduced bills",
    description:
      "Agenda gaps (issues salient locally via agency risk, news, or AG opinions without introduced bills) require editorial judgment sources that are not in the current mock corpus.",
    coverageStatus: "insufficient_data",
    comparisonStates: [],
    supportingPeerBillIds: [],
    relatedNcBillIds: [],
    provenance: "insufficient_data",
    reviewStatus: "team_review_required",
  },
];

/** Bill IDs featured in the supporting comparison bills section. */
export const NC_SUPPORTING_COMPARISON_BILL_IDS: string[] = [
  "bill-001",
  "bill-159",
  "bill-170",
  "bill-198",
  "bill-153",
  "bill-020",
  "bill-163",
  "bill-173",
  "bill-264",
];

export const DEFAULT_POLICY_BRIEF: PolicyBriefState = {
  objective:
    "Explore how North Carolina might approach AI legislation by comparing tracked national activity, NC emphasis areas, and corpus-relative policy gaps.",
  findingIds: [],
  gapIds: [],
  billIds: [],
  substanceBillIds: [],
  notes: "",
  draftingQuestions: [
    "Which AI domains should North Carolina prioritize for the next session?",
    "Where should oversight live (AG, DIT, sector agencies)?",
    "What evidence would confirm or refute the draft gap findings?",
  ],
};

export function getSubstanceByBillId(
  billId: string,
): BillSubstance | undefined {
  return NC_BILL_SUBSTANCE.find((item) => item.billId === billId);
}

export function getFindingById(
  id: string,
): DistinctivenessFinding | undefined {
  return NC_DISTINCTIVENESS_FINDINGS.find((item) => item.id === id);
}

export function getGapById(id: string): GapFinding | undefined {
  return NC_GAP_FINDINGS.find((item) => item.id === id);
}
