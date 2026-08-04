import type { Bill } from "../../types/bill";
import { getHowBillWorks } from "../../lib/bills";

interface HowThisBillWorksProps {
  bill: Bill;
}

const FIELDS: {
  key: keyof ReturnType<typeof getHowBillWorks>;
  label: string;
}[] = [
  { key: "policyGoal", label: "Policy Goal" },
  { key: "problemAddressed", label: "Problem Addressed" },
  { key: "coreMechanism", label: "Core Mechanism" },
  { key: "appliesTo", label: "Applies To" },
  { key: "expectedResult", label: "Expected Result" },
];

export function HowThisBillWorks({ bill }: HowThisBillWorksProps) {
  const model = getHowBillWorks(bill);

  return (
    <section className="bill-section" aria-labelledby="how-works-heading">
      <div className="how-bill-works">
        <h2 id="how-works-heading">How This Bill Works</h2>

        {model.hasContent ? (
          <dl className="how-bill-works__grid">
            {FIELDS.map(({ key, label }) => {
              const value = model[key];
              if (!value || typeof value !== "string") return null;
              return (
                <div key={key} className="how-bill-works__item">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              );
            })}
          </dl>
        ) : (
          <p className="bill-callout" role="status">
            {bill.category === "Artificial Intelligence"
              ? "A structured substance overview is not yet available for this bill."
              : "Editorial analysis for this policy category is under development."}
          </p>
        )}
      </div>
    </section>
  );
}
