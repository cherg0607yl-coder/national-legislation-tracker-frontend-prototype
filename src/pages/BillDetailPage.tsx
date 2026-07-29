import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import mockData from "../../data/mock-bills.json";
import type { MockBillsData } from "../types/bill";
import { getBillById, getRelatedBills } from "../lib/bills";
import {
  BillBreadcrumbs,
  BillEditorialLayer,
  BillHeader,
  BillMetadataSidebar,
  BillOverview,
  BillStatusTimeline,
  KeyProvisions,
  PolicyTags,
  RelatedBills,
  SourceDocuments,
} from "../components/bill-detail";
import "../styles/pages/BillDetailPage.css";

const data = mockData as MockBillsData;

export function BillDetailPage() {
  const { id } = useParams<{ id: string }>();

  const bill = useMemo(
    () => (id ? getBillById(data.bills, id) : undefined),
    [id],
  );

  const related = useMemo(
    () => (bill ? getRelatedBills(data.bills, bill) : []),
    [bill],
  );

  if (!id) {
    return (
      <section className="bill-detail section">
        <div className="container bill-detail__state">
          <h1>Bill not specified</h1>
          <p>Choose a bill from search or the homepage to view its detail page.</p>
          <Link to="/search" className="btn btn--primary">
            Search bills
          </Link>
        </div>
      </section>
    );
  }

  if (!bill) {
    return (
      <section className="bill-detail section">
        <div className="container bill-detail__state">
          <h1>Bill not found</h1>
          <p>
            No bill matched <code>{id}</code> in the prototype dataset.
          </p>
          <div className="btn-row">
            <Link to="/search" className="btn btn--primary">
              Back to search
            </Link>
            <Link to="/" className="btn btn--secondary">
              Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <article className="bill-detail section" aria-labelledby="bill-title">
      <div className="container bill-detail__layout">
        <div className="bill-detail__main">
          <BillBreadcrumbs bill={bill} />
          <BillHeader bill={bill} />
          <BillOverview bill={bill} />
          <BillStatusTimeline key={bill.id} bill={bill} />
          <BillEditorialLayer bill={bill} />
          <KeyProvisions bill={bill} />
          <PolicyTags bill={bill} />
          <RelatedBills bill={bill} related={related} />
          <SourceDocuments bill={bill} />
        </div>

        <BillMetadataSidebar bill={bill} />
      </div>
    </article>
  );
}
