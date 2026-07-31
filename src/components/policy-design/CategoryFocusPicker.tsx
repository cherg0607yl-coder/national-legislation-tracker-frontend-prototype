import type { PolicyCategory } from "../../types/bill";
import { POLICY_DESIGN_CATEGORIES } from "../../lib/policyDesign";

interface CategoryFocusPickerProps {
  onSelect: (category: PolicyCategory) => void;
}

export function CategoryFocusPicker({ onSelect }: CategoryFocusPickerProps) {
  return (
    <section
      className="policy-design-stage"
      aria-labelledby="policy-design-category-heading"
    >
      <div className="section-heading policy-design-stage__intro">
        <p className="policy-design-eyebrow">Policy Design · Stage 1</p>
        <h1 id="policy-design-category-heading">Choose a policy focus</h1>
        <p>
          Select a research theme to explore legislative momentum across
          states, surface distinctive state approaches, and identify policy
          gaps worth filling.
        </p>
      </div>

      <div
        className="policy-category-picker"
        role="list"
        aria-label="Policy categories"
      >
        {POLICY_DESIGN_CATEGORIES.map((item) => {
          if (!item.available) {
            return (
              <div
                key={item.category}
                className="policy-category-picker__card is-disabled"
                role="listitem"
                aria-disabled="true"
              >
                <span className="policy-category-picker__eyebrow">
                  Coming soon
                </span>
                <h2>{item.category}</h2>
                <p>{item.description}</p>
                <span className="policy-category-picker__status">
                  Not available in this prototype stage
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.category}
              type="button"
              className="policy-category-picker__card is-available"
              role="listitem"
              onClick={() => onSelect(item.category)}
            >
              <span className="policy-category-picker__eyebrow">
                Available now
              </span>
              <h2>{item.category}</h2>
              <p>{item.description}</p>
              <span className="policy-category-picker__cta">
                Continue with {item.category}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
