import type { BillCategorySlug, PolicyCategory } from "../types/bill";
import { POLICY_CATEGORIES } from "./stats";

export { POLICY_CATEGORIES };

/** Shared category slug ↔ label map (search + detail). */
export const CATEGORY_BY_SLUG: Record<BillCategorySlug, PolicyCategory> = {
  "strategic-planning": "Strategic Planning",
  "performance-measures": "Performance Measures",
  "artificial-intelligence": "Artificial Intelligence",
  "outcome-evaluations": "Outcome Evaluations",
};

export const SLUG_BY_CATEGORY: Record<PolicyCategory, BillCategorySlug> = {
  "Strategic Planning": "strategic-planning",
  "Performance Measures": "performance-measures",
  "Artificial Intelligence": "artificial-intelligence",
  "Outcome Evaluations": "outcome-evaluations",
};

export function categoryToSlug(category: PolicyCategory): BillCategorySlug {
  return SLUG_BY_CATEGORY[category];
}

export function slugToCategory(slug: string): PolicyCategory | null {
  if (slug in CATEGORY_BY_SLUG) {
    return CATEGORY_BY_SLUG[slug as BillCategorySlug];
  }
  return null;
}

export function isPolicyCategory(value: string): value is PolicyCategory {
  return (POLICY_CATEGORIES as string[]).includes(value);
}
