import { useId, useState } from "react";
import { Link } from "react-router-dom";
import type { Bill } from "../../types/bill";
import type { GapFinding } from "../../types/policyDesign";
import { GAP_COVERAGE_LABEL } from "../../types/policyDesign";
import { formatBillIdLine } from "../../lib/bills";
import { STATE_NAMES } from "../../lib/stats";
import { AnalysisTrustBadges } from "./AnalysisTrustBadges";

interface GapFindingCardProps {
  gap: GapFinding;
  billsById: Map<string, Bill>;
  inBrief: boolean;
  onToggleBrief: () => void;
}

export function GapFindingCard({
  gap,
  billsById,
  inBrief,
  onToggleBrief,
}: GapFindingCardProps) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const reactId = useId();
  const titleId = `gap-${gap.id}-title`;
  const panelId = `${reactId}-evidence`;
  const coverageLabel = GAP_COVERAGE_LABEL[gap.coverageStatus];
  const isInsufficient = gap.coverageStatus === "insufficient_data";

  return (
    <article
      className={
        isInsufficient ? "gap-card gap-card--insufficient" : "gap-card"
      }
      aria-labelledby={titleId}
    >
      <header className="gap-card__header">
        <h3 id={titleId}>{gap.title}</h3>
        <p
          className={`gap-card__status gap-card__status--${gap.coverageStatus}`}
        >
          <span className="gap-card__status-label">Coverage status</span>
          <span className="gap-card__status-value">{coverageLabel}</span>
        </p>
      </header>

      <AnalysisTrustBadges
        provenance={gap.provenance}
        reviewStatus={gap.reviewStatus}
      />

      <p>{gap.description}</p>

      {isInsufficient && (
        <p className="gap-card__insufficient" role="status">
          Insufficient data in the current corpus to assess this dimension.
          Draft analysis — pending team review.
        </p>
      )}

      <div className="btn-row gap-card__actions no-print">
        <button
          type="button"
          className="btn btn--secondary"
          aria-expanded={evidenceOpen}
          aria-controls={panelId}
          onClick={() => setEvidenceOpen((value) => !value)}
        >
          {evidenceOpen ? "Hide supporting evidence" : "Show supporting evidence"}
        </button>
        <button type="button" className="btn btn--primary" onClick={onToggleBrief}>
          {inBrief ? "Remove gap from brief" : "Add gap to brief"}
        </button>
      </div>

      {evidenceOpen ? (
        <div
          id={panelId}
          className="gap-card__evidence"
          role="region"
          aria-label={`Supporting evidence for ${gap.title}`}
        >
          {gap.comparisonStates.length > 0 && (
            <p className="gap-card__states">
              <strong>Comparison states:</strong>{" "}
              {gap.comparisonStates
                .map((code) => STATE_NAMES[code] ?? code)
                .join(", ")}
            </p>
          )}

          {gap.supportingPeerBillIds.length > 0 && (
            <div className="finding-bills">
              <p className="finding-bills__label">Supporting peer bills</p>
              <ul>
                {gap.supportingPeerBillIds.map((id) => {
                  const bill = billsById.get(id);
                  return (
                    <li key={id}>
                      {bill ? (
                        <>
                          <Link to={`/bills/${id}`}>
                            {formatBillIdLine(bill)}
                          </Link>
                          <span className="finding-bills__title">
                            {" "}
                            — {bill.title}
                          </span>
                        </>
                      ) : (
                        <span>{id}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {(gap.relatedNcBillIds?.length ?? 0) > 0 && (
            <div className="finding-bills">
              <p className="finding-bills__label">Related North Carolina bills</p>
              <ul>
                {gap.relatedNcBillIds!.map((id) => {
                  const bill = billsById.get(id);
                  return (
                    <li key={id}>
                      {bill ? (
                        <Link to={`/bills/${id}`}>
                          {formatBillIdLine(bill)}
                        </Link>
                      ) : (
                        <span>{id}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
