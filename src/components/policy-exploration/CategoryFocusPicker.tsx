import type { PolicyCategory } from "../../types/bill";
import { POLICY_EXPLORATION_CATEGORIES } from "../../lib/policyExploration";

interface CategoryFocusPickerProps {
  onSelect: (category: PolicyCategory) => void;
}

export function CategoryFocusPicker({ onSelect }: CategoryFocusPickerProps) {
  return (
    <section
      className="policy-explore-stage"
      aria-labelledby="policy-explore-category-heading"
    >
      <div className="section-heading policy-explore-stage__intro">
        <p className="policy-explore-eyebrow">Policy Exploration · Stage 1</p>
        <h1 id="policy-explore-category-heading">Choose a policy focus</h1>
        <p>
          Select a research theme to explore legislative momentum nationwide or
          by state across structured activity, coverage, progression, and
          institutionalization dimensions.
        </p>
      </div>

      <div
        className="policy-category-picker"
        role="list"
        aria-label="Policy categories"
      >
        {POLICY_EXPLORATION_CATEGORIES.map((item) => {
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
