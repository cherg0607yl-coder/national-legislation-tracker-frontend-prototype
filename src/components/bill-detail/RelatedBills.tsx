import { Link } from "react-router-dom";
import type { Bill } from "../../types/bill";
import {
  billStateLabel,
  displayStatus,
  relatedReason,
  statusBadgeClass,
} from "../../lib/bills";

interface RelatedBillsProps {
  bill: Bill;
  related: Bill[];
}

export function RelatedBills({ bill, related }: RelatedBillsProps) {
  return (
    <section className="bill-section" aria-labelledby="related-heading">
      <div className="bill-section__intro">
        <h2 id="related-heading">Related Approaches in Other States</h2>
        <p>
          Comparable measures that share a policy goal, mechanism, or topic.
        </p>
      </div>

      {related.length === 0 ? (
        <p className="bill-callout" role="status">
          Related bills are not available for this record yet.
        </p>
      ) : (
        <div className="related-bills">
          {related.map((item) => (
            <article key={item.id} className="related-bill">
              <Link to={`/bills/${item.id}`} className="related-bill__link">
                <div className="related-bill__top">
                  <span>
                    {billStateLabel(item)} · {item.billNumber}
                  </span>
                  <span
                    className={`status-badge status-badge--${statusBadgeClass(displayStatus(item))}`}
                  >
                    {displayStatus(item)}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <p className="related-bill__reason">
                  {relatedReason(bill, item)}
                </p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
