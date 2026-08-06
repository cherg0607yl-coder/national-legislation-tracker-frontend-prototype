import type { ProvenanceType, ReviewStatus } from "../../types/policyDesign";
import {
  PROVENANCE_LABEL,
  REVIEW_STATUS_LABEL,
} from "../../types/policyDesign";

interface AnalysisTrustBadgesProps {
  provenance: ProvenanceType;
  reviewStatus: ReviewStatus;
  className?: string;
}

/** Visible provenance + review labels for analytical claims. */
export function AnalysisTrustBadges({
  provenance,
  reviewStatus,
  className = "",
}: AnalysisTrustBadgesProps) {
  return (
    <ul
      className={`analysis-trust ${className}`.trim()}
      aria-label="Analysis provenance and review status"
    >
      <li className="analysis-trust__item analysis-trust__item--provenance">
        <span className="analysis-trust__label">Provenance</span>
        <span className="analysis-trust__value">
          {PROVENANCE_LABEL[provenance]}
        </span>
      </li>
      <li className="analysis-trust__item analysis-trust__item--review">
        <span className="analysis-trust__label">Review</span>
        <span className="analysis-trust__value">
          {REVIEW_STATUS_LABEL[reviewStatus]}
        </span>
      </li>
    </ul>
  );
}
