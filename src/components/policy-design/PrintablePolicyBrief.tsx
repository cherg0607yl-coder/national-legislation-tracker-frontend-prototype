import type { Bill } from "../../types/bill";
import type { PolicyBriefState } from "../../types/policyDesign";
import {
  GAP_COVERAGE_LABEL,
  REVIEW_STATUS_LABEL,
} from "../../types/policyDesign";
import {
  getFindingById,
  getGapById,
  getSubstanceByBillId,
  NC_LANDSCAPE_SUMMARY,
  NC_POLICY_DESIGN_META,
} from "../../data/ncPolicyDesign";
import { formatBillIdLine, getOfficialUrl } from "../../lib/bills";

interface PrintablePolicyBriefProps {
  brief: PolicyBriefState;
  billsById: Map<string, Bill>;
}

/**
 * Print-only policy brief document. Hidden on screen; the sole printed content
 * when Print brief is used (screen UI is hidden via @media print).
 */
export function PrintablePolicyBrief({
  brief,
  billsById,
}: PrintablePolicyBriefProps) {
  const findings = brief.findingIds
    .map((id) => getFindingById(id))
    .filter(Boolean);
  const gaps = brief.gapIds.map((id) => getGapById(id)).filter(Boolean);
  const bills = brief.billIds
    .map((id) => billsById.get(id))
    .filter((bill): bill is Bill => Boolean(bill));
  const substances = brief.substanceBillIds
    .map((id) => ({
      substance: getSubstanceByBillId(id),
      bill: billsById.get(id),
    }))
    .filter((row) => row.substance);

  const printedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="print-brief" aria-hidden="true">
      <header className="print-brief__cover">
        <p className="print-brief__eyebrow">National Legislation Tracker</p>
        <h1>{NC_POLICY_DESIGN_META.pageTitle}</h1>
        <p className="print-brief__subtitle">Policy briefing memorandum</p>
        <p className="print-brief__meta">
          Printed {printedOn} · {REVIEW_STATUS_LABEL.team_review_required}
        </p>
      </header>

      <section className="print-brief__section">
        <h2>1. Executive summary</h2>
        <p>{brief.objective.trim() || "No policy objective recorded."}</p>
        <p className="print-brief__counts">
          Selected for this brief: {findings.length} distinctive finding
          {findings.length === 1 ? "" : "s"}, {gaps.length} gap
          {gaps.length === 1 ? "" : "s"}, {bills.length} reference bill
          {bills.length === 1 ? "" : "s"}, {substances.length} substance note
          {substances.length === 1 ? "" : "s"}.
        </p>
      </section>

      <section className="print-brief__section">
        <h2>2. North Carolina landscape</h2>
        <h3>{NC_LANDSCAPE_SUMMARY.headline}</h3>
        <p>{NC_LANDSCAPE_SUMMARY.summary}</p>
        <p className="print-brief__note">
          Draft project analysis — pending team review
        </p>
      </section>

      <section className="print-brief__section print-brief__section--break">
        <h2>3. Distinctive findings</h2>
        {findings.length === 0 ? (
          <p>No distinctive findings selected.</p>
        ) : (
          findings.map((finding) =>
            finding ? (
              <article key={finding.id} className="print-brief__item">
                <h3>{finding.title}</h3>
                <p>{finding.summary}</p>
                <p>
                  <strong>Comparison context:</strong>{" "}
                  {finding.comparisonContext}
                </p>
                <p className="print-brief__note">
                  {REVIEW_STATUS_LABEL[finding.reviewStatus]}
                </p>
              </article>
            ) : null,
          )
        )}
      </section>

      <section className="print-brief__section">
        <h2>4. Potential gaps</h2>
        {gaps.length === 0 ? (
          <p>No gaps selected.</p>
        ) : (
          gaps.map((gap) =>
            gap ? (
              <article key={gap.id} className="print-brief__item">
                <h3>{gap.title}</h3>
                <p>
                  <strong>Coverage:</strong>{" "}
                  {GAP_COVERAGE_LABEL[gap.coverageStatus]}
                </p>
                <p>{gap.description}</p>
                <p className="print-brief__note">
                  {REVIEW_STATUS_LABEL[gap.reviewStatus]}
                </p>
              </article>
            ) : null,
          )
        )}
      </section>

      <section className="print-brief__section print-brief__section--break">
        <h2>5. Reference bills</h2>
        {bills.length === 0 ? (
          <p>No reference bills selected.</p>
        ) : (
          <div className="print-brief__bills">
            {bills.map((bill) => (
              <article key={bill.id} className="print-brief__bill">
                <h3>
                  {formatBillIdLine(bill)} — {bill.status}
                </h3>
                <p className="print-brief__bill-title">{bill.title}</p>
                <p>{bill.summary}</p>
                <p className="print-brief__source">
                  Official source (prototype): {getOfficialUrl(bill)}
                </p>
              </article>
            ))}
          </div>
        )}

        {substances.length > 0 ? (
          <div className="print-brief__substance-block">
            <h3>Bill-substance notes</h3>
            {substances.map(({ substance, bill }) =>
              substance ? (
                <article
                  key={substance.billId}
                  className="print-brief__item print-brief__substance"
                >
                  <h4>
                    {bill
                      ? formatBillIdLine(bill)
                      : substance.billId}
                  </h4>
                  <p>
                    <strong>Problem:</strong> {substance.problemAddressed}
                  </p>
                  <p>
                    <strong>Applies to:</strong> {substance.appliesTo}
                  </p>
                  <p>
                    <strong>Mechanism:</strong> {substance.coreMechanism}
                  </p>
                  <p>
                    <strong>Exceptions:</strong>{" "}
                    {substance.exceptions ??
                      "Not identified in the bill text"}
                  </p>
                  <p>
                    <strong>Enforcement:</strong>{" "}
                    {substance.enforcement ??
                      "Not identified in the bill text"}
                  </p>
                  <p>
                    <strong>Administration:</strong>{" "}
                    {substance.administration ??
                      "Not identified in the bill text"}
                  </p>
                </article>
              ) : null,
            )}
          </div>
        ) : null}
      </section>

      <section className="print-brief__section">
        <h2>6. Notes and drafting questions</h2>
        <h3>User notes</h3>
        <p>{brief.notes.trim() || "None."}</p>
        <h3>Open drafting questions</h3>
        {brief.draftingQuestions.length === 0 ? (
          <p>None.</p>
        ) : (
          <ul>
            {brief.draftingQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="print-brief__section print-brief__section--break">
        <h2>7. Sources and review disclaimer</h2>
        <p>{NC_POLICY_DESIGN_META.disclaimer}</p>
        <p>
          Official legislature links for selected bills appear above. Prototype
          URLs are fictional. This brief does not draft legislation or state
          legal conclusions.
        </p>
        <p className="print-brief__note">
          {REVIEW_STATUS_LABEL.team_review_required}
        </p>
      </section>
    </div>
  );
}
