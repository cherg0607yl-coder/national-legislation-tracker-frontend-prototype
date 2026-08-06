import { Link } from "react-router-dom";
import type { Bill } from "../../types/bill";
import { getOfficialUrl } from "../../lib/bills";
import { STATE_NAMES } from "../../lib/stats";

function statusClass(status: Bill["status"]): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}

interface ReferenceBillCardProps {
  bill: Bill;
  inBrief: boolean;
  onToggleBrief: () => void;
}

/** Bill reference card with detail + official source + brief action. */
export function ReferenceBillCard({
  bill,
  inBrief,
  onToggleBrief,
}: ReferenceBillCardProps) {
  const stateName = STATE_NAMES[bill.state] ?? bill.state;
  const officialUrl = getOfficialUrl(bill);

  return (
    <article className="ref-bill-card">
      <div className="ref-bill-card__top">
        <div className="ref-bill-card__ids">
          <span>
            {bill.state} {bill.billNumber}
          </span>
          <span>{stateName}</span>
        </div>
        <span
          className={`status-badge status-badge--${statusClass(bill.status)}`}
        >
          {bill.status}
        </span>
      </div>

      <h3>
        <Link to={`/bills/${bill.id}`}>{bill.title}</Link>
      </h3>
      <p>{bill.summary}</p>

      <div className="ref-bill-card__tags" aria-label="Category tags">
        <span className="tag tag--category">{bill.category}</span>
        {bill.category === "Artificial Intelligence" ? (
          <span className="tag tag--topic">{bill.subcategory}</span>
        ) : (
          <span className="tag">{bill.subcategory}</span>
        )}
      </div>

      <div className="btn-row ref-bill-card__actions">
        <Link to={`/bills/${bill.id}`} className="btn btn--secondary">
          Bill detail
        </Link>
        <a
          className="btn btn--secondary"
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Official source
          <span aria-hidden="true">↗</span>
        </a>
        <button type="button" className="btn btn--primary" onClick={onToggleBrief}>
          {inBrief ? "Remove from brief" : "Add to brief"}
        </button>
      </div>
    </article>
  );
}
