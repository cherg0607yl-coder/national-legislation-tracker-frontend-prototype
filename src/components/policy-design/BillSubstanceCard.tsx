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

export function BillSubstanceCard({
  bill,
  substance,
  inBrief,
  onToggleBrief,
}: BillSubstanceCardProps) {
  const officialUrl = getOfficialUrl(bill);

  return (
    <article
      className="substance-card"
      aria-labelledby={`substance-${substance.billId}-title`}
    >
      <header className="substance-card__header">
        <p className="substance-card__eyebrow">
          {formatBillIdLine(bill)} · {bill.status}
        </p>
        <h3 id={`substance-${substance.billId}-title`}>{bill.title}</h3>
        <AnalysisTrustBadges
          provenance={substance.provenance}
          reviewStatus={substance.reviewStatus}
        />
      </header>

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
          Shown only when explicitly present in available bill text. Null means
          not identified — not an extraction failure.
        </p>
        <dl className="substance-fields">
          <ConditionalField label="Exceptions" value={substance.exceptions} />
          <ConditionalField label="Enforcement" value={substance.enforcement} />
          <ConditionalField
            label="Administration"
            value={substance.administration}
          />
        </dl>
      </div>

      <div className="substance-card__actions btn-row">
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
        <button type="button" className="btn btn--primary" onClick={onToggleBrief}>
          {inBrief ? "Remove substance from brief" : "Add substance to brief"}
        </button>
      </div>
    </article>
  );
}
