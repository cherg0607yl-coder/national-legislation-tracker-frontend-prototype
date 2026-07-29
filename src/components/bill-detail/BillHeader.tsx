import type { Bill } from "../../types/bill";
import {
  displayStatus,
  formatBillIdLine,
  formatOptionalDate,
  statusBadgeClass,
} from "../../lib/bills";

interface BillHeaderProps {
  bill: Bill;
}

export function BillHeader({ bill }: BillHeaderProps) {
  const updated = formatOptionalDate(bill.lastUpdated);
  const status = displayStatus(bill);

  return (
    <header className="bill-header">
      <div className="bill-header__badges">
        <span className="tag tag--category">{bill.category}</span>
        <span className="tag">{formatBillIdLine(bill)}</span>
      </div>

      <p className="bill-header__id">
        {formatBillIdLine(bill)}
      </p>

      <h1 id="bill-title">{bill.title}</h1>

      <div className="bill-header__status-row">
        <span
          className={`status-badge status-badge--${statusBadgeClass(status)}`}
        >
          Status: {status}
        </span>
        {updated && (
          <span className="bill-header__updated">Last updated {updated}</span>
        )}
      </div>
    </header>
  );
}
