import type { Bill } from "../../types/bill";

interface AIBillUnderstandingProps {
  bill: Bill;
}

function DefinitionList({
  entries,
}: {
  entries: { label: string; value?: string }[];
}) {
  const visible = entries.filter((entry) => entry.value);
  if (visible.length === 0) return null;

  return (
    <dl className="ai-understanding__defs">
      {visible.map((entry) => (
        <div key={entry.label}>
          <dt>{entry.label}</dt>
          <dd>{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AIBillUnderstanding({ bill }: AIBillUnderstandingProps) {
  const editorial = bill.editorial;
  if (!editorial) {
    return (
      <p className="bill-callout" role="status">
        Structured editorial analysis is not yet available for this bill.
      </p>
    );
  }

  const impl = editorial.implementation;

  return (
    <div className="ai-understanding">
      {editorial.policyGoal && (
        <article className="ai-understanding__block">
          <h3>Policy Goal</h3>
          <p>{editorial.policyGoal}</p>
        </article>
      )}

      {editorial.problemAddressed && (
        <article className="ai-understanding__block">
          <h3>Problem Addressed</h3>
          <p>{editorial.problemAddressed}</p>
        </article>
      )}

      {editorial.policyMechanism && (
        <article className="ai-understanding__block">
          <h3>Policy Mechanism</h3>
          <p>{editorial.policyMechanism}</p>
        </article>
      )}

      {editorial.appliesTo && editorial.appliesTo.length > 0 && (
        <article className="ai-understanding__block">
          <h3>Applies To</h3>
          <ul>
            {editorial.appliesTo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      )}

      {editorial.requirements && editorial.requirements.length > 0 && (
        <article className="ai-understanding__block">
          <h3>Key Requirements</h3>
          <ul className="ai-understanding__checklist">
            {editorial.requirements.map((item) => (
              <li key={item}>
                <span className="ai-understanding__check" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      )}

      {impl && (
        <article className="ai-understanding__block">
          <h3>Implementation</h3>
          <DefinitionList
            entries={[
              { label: "Responsible agency", value: impl.responsibleAgency },
              { label: "Oversight body", value: impl.oversightBody },
              { label: "Effective date", value: impl.effectiveDate },
              { label: "Reporting frequency", value: impl.reportingFrequency },
              {
                label: "Rulemaking authority",
                value: impl.rulemakingAuthority,
              },
              { label: "Funding", value: impl.funding },
              {
                label: "Implementation deadline",
                value: impl.implementationDeadline,
              },
            ]}
          />
        </article>
      )}

      {editorial.enforcement && editorial.enforcement.length > 0 && (
        <article className="ai-understanding__block">
          <h3>Enforcement</h3>
          <ul>
            {editorial.enforcement.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      )}

      {editorial.exemptions && editorial.exemptions.length > 0 && (
        <article className="ai-understanding__block">
          <h3>Exemptions</h3>
          <ul>
            {editorial.exemptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      )}

      <p className="ai-understanding__note">
        This structured explanation is intended to make the bill easier to
        understand. Users should consult the official legislative text for
        authoritative legal language.
      </p>
    </div>
  );
}
