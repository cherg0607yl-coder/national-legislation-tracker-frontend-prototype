import { Link } from "react-router-dom";
import type { Bill } from "../../types/bill";
import { billStateLabel } from "../../lib/bills";

interface BillBreadcrumbsProps {
  bill: Bill;
}

export function BillBreadcrumbs({ bill }: BillBreadcrumbsProps) {
  const state = billStateLabel(bill);

  return (
    <nav className="bill-crumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/search">Search Bills</Link>
        </li>
        <li aria-current="page">
          {state} {bill.billNumber}
        </li>
      </ol>
    </nav>
  );
}
