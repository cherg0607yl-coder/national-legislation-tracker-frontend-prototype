import { useId, type ReactNode } from "react";

interface DisclosureSectionProps {
  title: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  /** Optional short badge in the header (e.g. item counts). */
  badge?: string;
  className?: string;
  headingLevel?: 2 | 3;
}

/** Accessible accordion section for major page regions. */
export function DisclosureSection({
  title,
  summary,
  open,
  onToggle,
  children,
  badge,
  className = "",
  headingLevel = 2,
}: DisclosureSectionProps) {
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const panelId = `${baseId}-panel`;
  const HeadingTag = headingLevel === 3 ? "h3" : "h2";

  return (
    <section
      className={`disclosure-section${open ? " is-open" : ""} ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <header className="disclosure-section__header">
        <div className="disclosure-section__titles">
          <HeadingTag id={headingId} className="disclosure-section__title">
            {title}
          </HeadingTag>
          {summary ? (
            <p className="disclosure-section__summary">{summary}</p>
          ) : null}
        </div>
        <div className="disclosure-section__aside">
          {badge ? (
            <span className="disclosure-section__badge">{badge}</span>
          ) : null}
          <button
            type="button"
            className="disclosure-section__toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
          >
            <span className="sr-only">
              {open ? "Collapse" : "Expand"} {title}
            </span>
            <span aria-hidden="true">{open ? "Hide" : "Show"}</span>
            <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </button>
        </div>
      </header>

      {open ? (
        <div
          id={panelId}
          className="disclosure-section__panel"
          role="region"
          aria-labelledby={headingId}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

interface ExpandCollapseControlsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  label?: string;
}

export function ExpandCollapseControls({
  onExpandAll,
  onCollapseAll,
  label = "Section visibility",
}: ExpandCollapseControlsProps) {
  return (
    <div className="expand-controls" role="group" aria-label={label}>
      <button type="button" className="text-btn" onClick={onExpandAll}>
        Expand all
      </button>
      <span aria-hidden="true">·</span>
      <button type="button" className="text-btn" onClick={onCollapseAll}>
        Collapse all
      </button>
    </div>
  );
}
