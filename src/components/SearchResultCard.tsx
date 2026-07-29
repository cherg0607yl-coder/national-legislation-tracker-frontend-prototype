import { Link } from "react-router-dom";
import type { Bill } from "../types/bill";
import { STATE_NAMES } from "../lib/stats";
import "../styles/components/SearchResultCard.css";

function statusClass(status: Bill["status"]): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}

interface SearchResultCardProps {
  bill: Bill;
}

export function SearchResultCard({ bill }: SearchResultCardProps) {
  const stateName = STATE_NAMES[bill.state] ?? bill.state;

  return (
    <article className="search-result-card">
      <Link to={`/bills/${bill.id}`} className="search-result-card__link">
        <div className="search-result-card__top">
          <div className="search-result-card__ids">
            <span className="search-result-card__bill-no">
              {bill.state} {bill.billNumber}
            </span>
            <span className="search-result-card__state">{stateName}</span>
          </div>
          <span
            className={`status-badge status-badge--${statusClass(bill.status)}`}
          >
            {bill.status}
          </span>
        </div>

        <h3>{bill.title}</h3>
        <p className="search-result-card__summary">{bill.summary}</p>

        <div className="search-result-card__tags" aria-label="Category tags">
          <span className="tag tag--category">{bill.category}</span>
          {bill.category === "Artificial Intelligence" ? (
            <span className="tag tag--topic">{bill.subcategory}</span>
          ) : (
            <span className="tag">{bill.subcategory}</span>
          )}
        </div>
      </Link>
    </article>
  );
}
