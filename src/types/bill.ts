export type BillStatus =
  | "Introduced"
  | "In Committee"
  | "Passed"
  | "Enacted"
  | "Vetoed"
  | "Failed";

export type PolicyCategory =
  | "Strategic Planning"
  | "Performance Measures"
  | "Artificial Intelligence"
  | "Outcome Evaluations";

export interface Bill {
  id: string;
  billNumber: string;
  title: string;
  summary: string;
  state: string;
  status: BillStatus;
  category: PolicyCategory;
  subcategory: string;
  introducedDate: string;
  lastUpdated: string;
  sponsors: string[];
  sourceUrl: string;
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
