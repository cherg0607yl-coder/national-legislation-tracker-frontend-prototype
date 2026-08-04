import { useState } from "react";
import type { Bill, KeyProvision } from "../../types/bill";

interface KeyProvisionsProps {
  bill: Bill;
}

function ProvisionItem({
  provision,
  index,
}: {
  provision: KeyProvision;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const number = String(index + 1).padStart(2, "0");
  const hasDetails = Boolean(
    provision.trigger ||
      provision.deadline ||
      provision.exceptions ||
      provision.statutoryText,
  );

  return (
    <li className={`key-prov ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="key-prov__trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        disabled={!hasDetails && !provision.sourceUrl}
      >
        <span className="key-prov__num" aria-hidden="true">
          {number}
        </span>
        <span className="key-prov__main">
          <span className="key-prov__title">{provision.title}</span>
          <span className="key-prov__desc">{provision.description}</span>
          {provision.sectionReference && (
            <span className="key-prov__cite">{provision.sectionReference}</span>
          )}
        </span>
        {hasDetails && (
          <span className="key-prov__chevron" aria-hidden="true">
            {open ? "−" : "+"}
          </span>
        )}
      </button>

      {open && hasDetails && (
        <div className="key-prov__details">
          <dl>
            {provision.trigger && (
              <div>
                <dt>Trigger</dt>
                <dd>{provision.trigger}</dd>
              </div>
            )}
            {provision.deadline && (
              <div>
                <dt>Deadline</dt>
                <dd>{provision.deadline}</dd>
              </div>
            )}
            {provision.exceptions && (
              <div>
                <dt>Exceptions</dt>
                <dd>{provision.exceptions}</dd>
              </div>
            )}
            {provision.statutoryText && (
              <div>
                <dt>Exact statutory text</dt>
                <dd className="key-prov__statute">{provision.statutoryText}</dd>
              </div>
            )}
          </dl>
          {provision.sourceUrl && (
            <a
              href={provision.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="key-prov__link"
            >
              View in bill text ↗
            </a>
          )}
        </div>
      )}
    </li>
  );
}

export function KeyProvisions({ bill }: KeyProvisionsProps) {
  const provisions = bill.keyProvisions ?? [];

  return (
    <section className="bill-section" aria-labelledby="provisions-heading">
      <div className="bill-section__intro">
        <h2 id="provisions-heading">Key Provisions</h2>
        <p>Who must do what, organized as the bill’s core duties.</p>
      </div>

      {provisions.length === 0 ? (
        <p className="bill-callout" role="status">
          Key provision summaries are not yet available for this bill.
        </p>
      ) : (
        <ol className="key-prov-list">
          {provisions.map((provision, index) => (
            <ProvisionItem
              key={`${provision.title}-${index}`}
              provision={provision}
              index={index}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
