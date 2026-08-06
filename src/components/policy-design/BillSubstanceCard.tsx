import { useId, useState } from "react";
import { Link } from "react-router-dom";
import type { Bill } from "../../types/bill";
import type { BillSubstance } from "../../types/policyDesign";
import { formatBillIdLine, getOfficialUrl } from "../../lib/bills";
import { AnalysisTrustBadges } from "./AnalysisTrustBadges";

interface BillSubstanceCardProps {
  bill: Bill;
  substance: BillSubstance;
  inBrief: boolean;
  onToggleBrief: () => void;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ConditionalField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const isNull = value === null;
  return (
    <div
      className={
        isNull
          ? "substance-field substance-field--null"
          : "substance-field substance-field--conditional"
      }
    >
      <dt>
        {label}
        <span className="substance-field__kind">Conditional</span>
      </dt>
      <dd>
        {isNull ? (
          <span className="substance-field__null">
            Not identified in the bill text
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function substanceCompleteness(substance: BillSubstance): {
  identified: number;
  total: number;
  label: string;
} {
  const conditional = [
    substance.exceptions,
    substance.enforcement,
    substance.administration,
  ];
  const identifiedConditional = conditional.filter((v) => v !== null).length;
  const identified = 3 + identifiedConditional;
  const total = 6;
  return {
    identified,
    total,
    label: `${identified}/${total} fields identified · ${identifiedConditional}/3 conditional`,
  };
}

export function BillSubstanceCard({
  bill,
  substance,
  inBrief,
  onToggleBrief,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: BillSubstanceCardProps) {
  const reactId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (controlledOpen === undefined) setUncontrolledOpen(next);
  };

  const officialUrl = getOfficialUrl(bill);
  const completeness = substanceCompleteness(substance);
  const titleId = `substance-${substance.billId}-title`;
  const panelId = `${reactId}-panel`;

  return (
    <article
      className={`substance-card${open ? " is-open" : ""}`}
      aria-labelledby={titleId}
    >
      <header className="substance-card__header substance-card__header--accordion">
        <div className="substance-card__titles">
          <p className="substance-card__eyebrow">
            {formatBillIdLine(bill)} · {bill.status}
          </p>
          <h3 id={titleId}>{bill.title}</h3>
          <p className="substance-card__completeness">{completeness.label}</p>
        </div>
        <button
          type="button"
          className="disclosure-section__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">
            {open ? "Collapse" : "Expand"} substance for {formatBillIdLine(bill)}
          </span>
          <span aria-hidden="true">{open ? "Hide fields" : "Show fields"}</span>
          <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
      </header>

      {open ? (
        <div
          id={panelId}
          className="substance-card__body"
          role="region"
          aria-labelledby={titleId}
        >
          <AnalysisTrustBadges
            provenance={substance.provenance}
            reviewStatus={substance.reviewStatus}
          />

          <div className="substance-card__group">
            <h4>Core fields</h4>
            <dl className="substance-fields">
              <div className="substance-field substance-field--core">
                <dt>
                  Problem addressed
                  <span className="substance-field__kind">Core</span>
                </dt>
                <dd>{substance.problemAddressed}</dd>
              </div>
              <div className="substance-field substance-field--core">
                <dt>
                  Applies to
                  <span className="substance-field__kind">Core</span>
                </dt>
                <dd>{substance.appliesTo}</dd>
              </div>
              <div className="substance-field substance-field--core">
                <dt>
                  Core mechanism
                  <span className="substance-field__kind">Core</span>
                </dt>
                <dd>{substance.coreMechanism}</dd>
              </div>
            </dl>
          </div>

          <div className="substance-card__group">
            <h4>Conditional fields</h4>
            <p className="substance-card__hint">
              Shown only when explicitly present in available bill text. Null
              means not identified — not an extraction failure.
            </p>
            <dl className="substance-fields">
              <ConditionalField label="Exceptions" value={substance.exceptions} />
              <ConditionalField
                label="Enforcement"
                value={substance.enforcement}
              />
              <ConditionalField
                label="Administration"
                value={substance.administration}
              />
            </dl>
          </div>

          <div className="substance-card__actions btn-row no-print">
            <Link to={`/bills/${bill.id}`} className="btn btn--secondary">
              Bill detail
            </Link>
            <a
              className="btn btn--secondary"
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Official source
              <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onToggleBrief}
            >
              {inBrief
                ? "Remove substance from brief"
                : "Add substance to brief"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

interface BillSubstanceCompareTableProps {
  rows: { bill: Bill; substance: BillSubstance }[];
}

/** Compact side-by-side comparison of substance fields for selected bills. */
export function BillSubstanceCompareTable({
  rows,
}: BillSubstanceCompareTableProps) {
  const fields: {
    key: keyof BillSubstance | "problemAddressed";
    label: string;
    get: (s: BillSubstance) => string;
  }[] = [
    {
      key: "problemAddressed",
      label: "Problem addressed",
      get: (s) => s.problemAddressed,
    },
    { key: "appliesTo", label: "Applies to", get: (s) => s.appliesTo },
    {
      key: "coreMechanism",
      label: "Core mechanism",
      get: (s) => s.coreMechanism,
    },
    {
      key: "exceptions",
      label: "Exceptions",
      get: (s) => s.exceptions ?? "Not identified in the bill text",
    },
    {
      key: "enforcement",
      label: "Enforcement",
      get: (s) => s.enforcement ?? "Not identified in the bill text",
    },
    {
      key: "administration",
      label: "Administration",
      get: (s) => s.administration ?? "Not identified in the bill text",
    },
  ];

  return (
    <div className="substance-compare" role="region" aria-label="Substance comparison table">
      <div className="substance-compare__scroll">
        <table className="substance-compare__table">
          <caption className="sr-only">
            Comparison of six substance fields across selected bills
          </caption>
          <thead>
            <tr>
              <th scope="col">Field</th>
              {rows.map(({ bill }) => (
                <th key={bill.id} scope="col">
                  {formatBillIdLine(bill)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.label}>
                <th scope="row">{field.label}</th>
                {rows.map(({ bill, substance }) => (
                  <td key={`${bill.id}-${field.label}`}>
                    {field.get(substance)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
