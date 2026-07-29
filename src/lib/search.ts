import type { Bill, BillStatus, PolicyCategory } from "../types/bill";
import { sponsorNames } from "./bills";
import { POLICY_CATEGORIES, STATE_NAMES } from "./stats";

export const AI_TOPICS = [
  "Appropriations",
  "Audit",
  "Child Pornography",
  "Criminal Use",
  "Cybersecurity",
  "Deepfake",
  "Education Use",
  "Education/Training",
  "Effect on Labor/Employment",
  "Elections",
  "Energy",
  "Government Use",
  "Health Use",
  "Housing",
  "Impact Assessment",
  "Judicial Use",
  "Notification",
  "Oversight/Governance",
  "Personhood",
  "Private Right of Action",
  "Private Sector Use",
  "Provenance",
  "Responsible Use",
  "Studies",
  "Taxes",
] as const;

export type AiTopic = (typeof AI_TOPICS)[number];

export const BILL_STATUSES: BillStatus[] = [
  "Introduced",
  "In Committee",
  "Passed",
  "Enacted",
  "Vetoed",
  "Failed",
];

export const SEARCH_YEARS = ["2023", "2024", "2025", "2026"] as const;

export const ALL_STATES = Object.keys(STATE_NAMES)
  .filter((code) => code !== "DC")
  .sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));

export { POLICY_CATEGORIES };

export interface SearchFilters {
  categories: PolicyCategory[];
  topics: string[];
  states: string[];
  keyword: string;
  status: BillStatus | "All";
  billNumber: string;
  year: string | "All";
  author: string;
}

export function createDefaultFilters(
  initial?: Partial<SearchFilters>,
): SearchFilters {
  return {
    categories: [],
    topics: [],
    states: [],
    keyword: "",
    status: "All",
    billNumber: "",
    year: "All",
    author: "",
    ...initial,
  };
}

function includesIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function filterBills(bills: Bill[], filters: SearchFilters): Bill[] {
  const keyword = filters.keyword.trim();
  const billNumber = filters.billNumber.trim();
  const author = filters.author.trim();

  return bills.filter((bill) => {
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(bill.category)
    ) {
      return false;
    }

    if (filters.states.length > 0 && !filters.states.includes(bill.state)) {
      return false;
    }

    // AI topic subfilter only applies when topics are chosen
    if (filters.topics.length > 0) {
      if (bill.category !== "Artificial Intelligence") return false;
      if (!filters.topics.includes(bill.subcategory)) return false;
    }

    if (filters.status !== "All" && bill.status !== filters.status) {
      return false;
    }

    if (
      filters.year !== "All" &&
      !bill.introducedDate.startsWith(filters.year)
    ) {
      return false;
    }

    if (billNumber && !includesIgnoreCase(bill.billNumber, billNumber)) {
      return false;
    }

    if (
      author &&
      !sponsorNames(bill.sponsors).some((sponsor) =>
        includesIgnoreCase(sponsor, author),
      )
    ) {
      return false;
    }

    if (keyword) {
      const blob = [
        bill.title,
        bill.summary,
        bill.billNumber,
        bill.category,
        bill.subcategory,
        bill.state,
        ...sponsorNames(bill.sponsors),
      ].join(" ");
      if (!includesIgnoreCase(blob, keyword)) return false;
    }

    return true;
  });
}

export function billKeywords(bill: Bill): string[] {
  return [bill.subcategory];
}
