import type { Bill } from "../../types/bill";

interface BillOverviewProps {
  bill: Bill;
}

export function BillOverview({ bill }: BillOverviewProps) {
  return (
    <section className="bill-section" aria-labelledby="overview-heading">
      <div className="bill-section__intro">
        <h2 id="overview-heading">Bill Overview</h2>
        <p>A plain-language reading of what this measure covers.</p>
      </div>

      <div className="bill-overview">
        <article className="bill-overview__plain">
          <h3>Plain-language summary</h3>
          <p>{bill.summary}</p>
        </article>

        {bill.officialSummary && (
          <article className="bill-overview__official">
            <h3>Official legislative summary</h3>
            <p>{bill.officialSummary}</p>
          </article>
        )}
      </div>
    </section>
  );
}
