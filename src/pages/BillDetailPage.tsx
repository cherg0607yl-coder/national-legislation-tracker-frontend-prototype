import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import mockData from "../../data/mock-bills.json";
import type { MockBillsData } from "../types/bill";
import { getBillById } from "../lib/bills";
import {
  BillBreadcrumbs,
  BillHeader,
  BillMetadataSidebar,
  BillStatusTimeline,
  HowThisBillWorks,
  KeyProvisions,
  PolicyDesignSection,
  QuestionsForConsideration,
  WhatChanges,
} from "../components/bill-detail";
import "../styles/pages/BillDetailPage.css";

const data = mockData as MockBillsData;

export function BillDetailPage() {
  const { id } = useParams<{ id: string }>();

  const bill = useMemo(
    () => (id ? getBillById(data.bills, id) : undefined),
    [id],
  );

  if (!id) {
    return (
      <section className="bill-detail section">
        <div className="container bill-detail__state">
          <h1>Bill not specified</h1>
          <p>
            Choose a bill from search or the homepage to view its detail page.
          </p>
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
          <BillStatusTimeline key={bill.id} bill={bill} />
          <HowThisBillWorks bill={bill} />
          <KeyProvisions bill={bill} />
          <PolicyDesignSection bill={bill} />
          <WhatChanges bill={bill} />
          <QuestionsForConsideration bill={bill} />
        </div>

        <BillMetadataSidebar bill={bill} />
      </div>
    </article>
  );
}
