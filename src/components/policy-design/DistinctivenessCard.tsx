import { useId, useState } from "react";
import { Link } from "react-router-dom";
import type { Bill } from "../../types/bill";
import type { DistinctivenessFinding } from "../../types/policyDesign";
import { formatBillIdLine } from "../../lib/bills";
import { AnalysisTrustBadges } from "./AnalysisTrustBadges";

interface DistinctivenessCardProps {
  finding: DistinctivenessFinding;
  billsById: Map<string, Bill>;
  inBrief: boolean;
  onToggleBrief: () => void;
}

function BillChipList({
  ids,
  billsById,
  label,
}: {
  ids: string[];
  billsById: Map<string, Bill>;
  label: string;
}) {
  if (ids.length === 0) return null;
  return (
    <div className="finding-bills">
      <p className="finding-bills__label">{label}</p>
      <ul>
        {ids.map((id) => {
          const bill = billsById.get(id);
          if (!bill) {
            return (
              <li key={id}>
                <span>{id} (not in corpus)</span>
              </li>
            );
          }
          return (
            <li key={id}>
              <Link to={`/bills/${id}`}>{formatBillIdLine(bill)}</Link>
              <span className="finding-bills__title"> — {bill.title}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DistinctivenessCard({
  finding,
  billsById,
  inBrief,
  onToggleBrief,
}: DistinctivenessCardProps) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const reactId = useId();
  const titleId = `finding-${finding.id}-title`;
  const panelId = `${reactId}-evidence`;

  return (
    <article className="finding-card" aria-labelledby={titleId}>
      <h3 id={titleId}>{finding.title}</h3>
      <AnalysisTrustBadges
        provenance={finding.provenance}
        reviewStatus={finding.reviewStatus}
      />
      <p>{finding.summary}</p>

      <div className="btn-row finding-card__actions no-print">
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
          {inBrief ? "Remove finding from brief" : "Add finding to brief"}
        </button>
      </div>

      {evidenceOpen ? (
        <div
          id={panelId}
          className="finding-card__evidence"
          role="region"
          aria-label={`Supporting evidence for ${finding.title}`}
        >
          <p className="finding-card__context">
            <strong>Comparison context:</strong> {finding.comparisonContext}
          </p>
          <BillChipList
            ids={finding.supportingNcBillIds}
            billsById={billsById}
            label="Supporting North Carolina bills"
          />
          <BillChipList
            ids={finding.supportingPeerBillIds ?? []}
            billsById={billsById}
            label="Supporting peer-state bills"
          />
        </div>
      ) : null}
    </article>
  );
}
