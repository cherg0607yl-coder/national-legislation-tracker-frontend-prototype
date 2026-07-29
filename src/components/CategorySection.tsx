import { Link } from "react-router-dom";
import type { PolicyCategory } from "../types/bill";
import "../styles/components/CategorySection.css";

const CATEGORIES: {
  title: PolicyCategory;
  description: string;
}[] = [
  {
    title: "Strategic Planning",
    description:
      "Legislation guiding long-range state planning, goal setting, and priority frameworks.",
  },
  {
    title: "Performance Measures",
    description:
      "Bills that define metrics, reporting standards, and accountability for public programs.",
  },
  {
    title: "Artificial Intelligence",
    description:
      "State laws governing AI use in government, procurement, and public services.",
  },
  {
    title: "Outcome Evaluations",
    description:
      "Statutes requiring evaluation of program results, evidence, and impact assessments.",
  },
];

interface CategorySectionProps {
  counts: Record<PolicyCategory, number>;
  scopeLabel?: string;
  onClearState?: () => void;
}

export function CategorySection({
  counts,
  scopeLabel = "Nationwide",
  onClearState,
}: CategorySectionProps) {
  const isStateScoped = scopeLabel !== "Nationwide";

  return (
    <section className="section" aria-labelledby="categories-heading">
      <div className="container">
        <div className="category-heading-row">
          <div className="section-heading">
            <h2 id="categories-heading">Explore by Policy Category</h2>
            <p>
              Browse legislation organized around four core research themes
              {isStateScoped ? ` · currently filtered to ${scopeLabel}` : ""}.
            </p>
          </div>
          {isStateScoped && onClearState && (
            <button
              type="button"
              className="btn btn--secondary category-nationwide-btn"
              onClick={onClearState}
            >
              Back to nationwide
            </button>
          )}
        </div>

        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <Link
              key={category.title}
              to={`/search?category=${encodeURIComponent(category.title)}`}
              className="category-card"
            >
              <span className="category-card__eyebrow">Policy area</span>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <span className="category-card__count">
                {counts[category.title]} bills · {scopeLabel}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
