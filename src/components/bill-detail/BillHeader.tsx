import type { Bill } from "../../types/bill";
import {
  billSessionLabel,
  billStateLabel,
  displayStatus,
  getOfficialUrl,
  policyTags,
  statusBadgeClass,
} from "../../lib/bills";

interface BillHeaderProps {
  bill: Bill;
}

export function BillHeader({ bill }: BillHeaderProps) {
  const status = displayStatus(bill);
  const tags = policyTags(bill);
  const officialUrl = getOfficialUrl(bill);

  return (
    <header className="bill-header">
      <div className="bill-header__meta-line">
        <span className="tag tag--category">{bill.category}</span>
        <span className="bill-header__id">
          {billStateLabel(bill)} · {bill.billNumber}
          {bill.session ? ` · ${billSessionLabel(bill)}` : ""}
        </span>
      </div>

      <h1 id="bill-title">{bill.title}</h1>

      <div className="bill-header__status-row">
        <span
          className={`status-badge status-badge--${statusBadgeClass(status)}`}
        >
          {status}
        </span>
        <a
          className="bill-header__official"
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Official bill page
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      {tags.length > 0 && (
        <div className="policy-tags" aria-label="Topic tags">
          {tags.map((tag) => (
            <span
              key={tag}
              className={
                bill.category === "Artificial Intelligence"
                  ? "tag tag--topic"
                  : "tag"
              }
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
