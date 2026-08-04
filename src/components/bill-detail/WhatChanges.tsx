import type { Bill } from "../../types/bill";
import { getWhatChanges } from "../../lib/bills";

interface WhatChangesProps {
  bill: Bill;
}

export function WhatChanges({ bill }: WhatChangesProps) {
  const rows = getWhatChanges(bill);

  return (
    <section className="bill-section" aria-labelledby="what-changes-heading">
      <div className="bill-section__intro">
        <h2 id="what-changes-heading">What Changes</h2>
        <p>How the bill would alter current practice.</p>
      </div>

      {rows.length === 0 ? (
        <p className="bill-callout" role="status">
          A current-vs-proposed comparison is not yet available for this bill.
        </p>
      ) : (
        <div className="what-changes" role="table" aria-label="What changes">
          <div className="what-changes__head" role="row">
            <span role="columnheader">Current approach</span>
            <span role="columnheader">Bill’s approach</span>
          </div>
          {rows.map((row) => (
            <div
              key={`${row.current}-${row.billApproach}`}
              className="what-changes__row"
              role="row"
            >
              <span role="cell">{row.current}</span>
              <span role="cell">{row.billApproach}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
