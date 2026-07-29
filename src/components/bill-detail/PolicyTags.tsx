import type { Bill } from "../../types/bill";
import { policyTags } from "../../lib/bills";

interface PolicyTagsProps {
  bill: Bill;
}

export function PolicyTags({ bill }: PolicyTagsProps) {
  const tags = policyTags(bill);

  return (
    <section className="bill-section" aria-labelledby="tags-heading">
      <div className="bill-section__intro">
        <h2 id="tags-heading">Policy categories and tags</h2>
        <p>Primary category and topical tags used across the tracker.</p>
      </div>

      <div className="policy-tags" aria-label="Policy tags">
        <span className="tag tag--category">{bill.category}</span>
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
    </section>
  );
}
