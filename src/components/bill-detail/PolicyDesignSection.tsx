import type { Bill, PolicyDesignCard } from "../../types/bill";
import { getPolicyDesign } from "../../lib/bills";

interface PolicyDesignSectionProps {
  bill: Bill;
}

const CARDS: {
  key: "coverage" | "administration" | "enforcement" | "accountability";
  label: string;
}[] = [
  { key: "coverage", label: "Coverage" },
  { key: "administration", label: "Administration" },
  { key: "enforcement", label: "Enforcement" },
  { key: "accountability", label: "Accountability" },
];

function DesignCard({
  label,
  card,
}: {
  label: string;
  card?: PolicyDesignCard;
}) {
  if (!card) return null;
  return (
    <article className="policy-design-card">
      <h3>{label}</h3>
      <p className="policy-design-card__headline">{card.headline}</p>
      <p className="policy-design-card__detail">{card.detail}</p>
    </article>
  );
}

export function PolicyDesignSection({ bill }: PolicyDesignSectionProps) {
  const design = getPolicyDesign(bill);
  const hasContent = Boolean(
    design &&
      (design.coverage ||
        design.administration ||
        design.enforcement ||
        design.accountability),
  );

  return (
    <section className="bill-section" aria-labelledby="policy-design-heading">
      <div className="bill-section__intro">
        <h2 id="policy-design-heading">Policy Design</h2>
        <p>
          Coverage, administration, enforcement, and accountability in one
          compact view.
        </p>
      </div>

      {!hasContent ? (
        <p className="bill-callout bill-callout--placeholder" role="status">
          {bill.category === "Artificial Intelligence"
            ? "Policy design details are not yet available for this bill."
            : "Editorial analysis for this policy category is under development."}
        </p>
      ) : (
        <div className="policy-design-grid">
          {CARDS.map(({ key, label }) => (
            <DesignCard key={key} label={label} card={design?.[key]} />
          ))}
        </div>
      )}
    </section>
  );
}
