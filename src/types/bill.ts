export type BillStatus =
  | "Introduced"
  | "In Committee"
  | "Passed"
  | "Enacted"
  | "Vetoed"
  | "Failed";

/** Display labels shared across search, homepage, and bill detail. */
export type PolicyCategory =
  | "Strategic Planning"
  | "Performance Measures"
  | "Artificial Intelligence"
  | "Outcome Evaluations";

/** Stable slug identifiers for categories (URLs, configs). */
export type BillCategorySlug =
  | "strategic-planning"
  | "performance-measures"
  | "artificial-intelligence"
  | "outcome-evaluations";

export type NormalizedLegislativeStage =
  | "Introduced"
  | "Referred to Committee"
  | "Passed First Chamber"
  | "Passed Second Chamber"
  | "Passed Legislature"
  | "Awaiting Governor"
  | "Signed into Law"
  | "Vetoed"
  | "Failed"
  | "Withdrawn";

export interface BillSponsor {
  name: string;
  role?: "primary" | "cosponsor";
  party?: string;
  district?: string;
}

export interface BillAction {
  date: string;
  action: string;
  chamber?: string;
  committee?: string;
  stage?: NormalizedLegislativeStage;
  sourceUrl?: string;
}

export interface BillEditorial {
  policyGoal?: string;
  problemAddressed?: string;
  policyMechanism?: string;
  appliesTo?: string[];
  requirements?: string[];
  implementation?: {
    responsibleAgency?: string;
    oversightBody?: string;
    effectiveDate?: string;
    reportingFrequency?: string;
    rulemakingAuthority?: string;
    funding?: string;
    implementationDeadline?: string;
  };
  enforcement?: string[];
  exemptions?: string[];
}

export interface KeyProvision {
  title: string;
  description: string;
  sectionReference?: string;
  sourceUrl?: string;
}

export interface BillDocument {
  name: string;
  date?: string;
  type?: string;
  url: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  title: string;
  summary: string;
  officialSummary?: string;
  state: string;
  status: BillStatus;
  /** Human-readable status for detail pages when richer than `status`. */
  normalizedStatus?: NormalizedLegislativeStage | string;
  category: PolicyCategory;
  /** Primary topic / AI topic used by search filters. */
  subcategory: string;
  /** Optional additional policy tags for the detail page. */
  subcategories?: string[];
  introducedDate: string;
  lastUpdated: string;
  latestActionDate?: string;
  session?: string;
  chamber?: string;
  billType?: string;
  sponsors: BillSponsor[];
  committees?: string[];
  /** Official legislature page. Prefer over legacy naming. */
  officialUrl?: string;
  /** @deprecated Prefer officialUrl; kept for existing mock records. */
  sourceUrl: string;
  textUrl?: string;
  actions?: BillAction[];
  editorial?: BillEditorial;
  keyProvisions?: KeyProvision[];
  documents?: BillDocument[];
  relatedBillIds?: string[];
  additionalLinks?: {
    fullText?: string;
    latestVersion?: string;
    fiscalNote?: string;
    amendments?: string;
    votingHistory?: string;
  };
}

export interface MockBillsData {
  _meta: {
    description: string;
    generatedFor: string;
    billCount: number;
    disclaimer: string;
  };
  bills: Bill[];
}
