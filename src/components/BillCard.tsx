import { Link } from "react-router-dom";
import type { Bill } from "../types/bill";
import { formatDisplayDate, STATE_NAMES } from "../lib/stats";
import "../styles/components/BillCard.css";

function statusClass(status: Bill["status"]): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}

interface BillCardProps {
  bill: Bill;
}

export function BillCard({ bill }: BillCardProps) {
  const stateName = STATE_NAMES[bill.state] ?? bill.state;

  return (
    <article className="bill-card">
      <Link to={`/bills/${bill.id}`} className="bill-card__link">
        <div className="bill-card__meta">
          <span>
            {bill.state} {bill.billNumber}
          </span>
          <span>{stateName}</span>
        </div>
        <h3>{bill.title}</h3>
        <p>{bill.summary}</p>
        <div className="bill-card__footer">
          <span
            className={`status-badge status-badge--${statusClass(bill.status)}`}
          >
            {bill.status}
          </span>
          <div className="bill-card__aside">
            <span>{bill.category}</span>
            <span>Updated {formatDisplayDate(bill.lastUpdated)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
