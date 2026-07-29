import type { Bill } from "../../types/bill";
import { AIBillUnderstanding } from "./AIBillUnderstanding";

interface BillEditorialLayerProps {
  bill: Bill;
}

export function BillEditorialLayer({ bill }: BillEditorialLayerProps) {
  const isAi = bill.category === "Artificial Intelligence";

  return (
    <section className="bill-section" aria-labelledby="understand-heading">
      <div className="bill-section__intro">
        <h2 id="understand-heading">Understand This Bill</h2>
        <p>
          {isAi
            ? "An editorial reading of the policy goal, mechanism, and implementation path."
            : "Category-specific analysis for this policy area."}
        </p>
      </div>

      {isAi ? (
        <AIBillUnderstanding bill={bill} />
      ) : (
        <p className="bill-callout bill-callout--placeholder" role="status">
          Editorial analysis for this policy category is under development.
        </p>
      )}
    </section>
  );
}
