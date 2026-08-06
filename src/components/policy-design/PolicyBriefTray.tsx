import { useEffect, useId, useState } from "react";
import type { Bill } from "../../types/bill";
import type { PolicyBriefState } from "../../types/policyDesign";
import {
  DEFAULT_POLICY_BRIEF,
  getFindingById,
  getGapById,
  getSubstanceByBillId,
  NC_LANDSCAPE_SUMMARY,
  NC_POLICY_DESIGN_META,
} from "../../data/ncPolicyDesign";
import {
  buildBriefCopyText,
  clearPolicyBriefStorage,
  savePolicyBrief,
  toggleBill,
  toggleFinding,
  toggleGap,
  toggleSubstance,
} from "../../lib/policyBrief";
import { formatBillIdLine } from "../../lib/bills";
import { REVIEW_STATUS_LABEL } from "../../types/policyDesign";

interface PolicyBriefTrayProps {
  brief: PolicyBriefState;
  onChange: (next: PolicyBriefState) => void;
  billsById: Map<string, Bill>;
}

export function PolicyBriefTray({
  brief,
  onChange,
  billsById,
}: PolicyBriefTrayProps) {
  const titleId = useId();
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    savePolicyBrief(brief);
  }, [brief]);

  const itemCount =
    brief.findingIds.length +
    brief.gapIds.length +
    brief.billIds.length +
    brief.substanceBillIds.length;

  async function handleCopy() {
    const text = buildBriefCopyText(brief, billsById);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Brief copied to clipboard.");
    } catch {
      setCopyStatus("Copy failed. You can select and copy the printed brief instead.");
    }
  }

  function handleClear() {
    clearPolicyBriefStorage();
    onChange({ ...DEFAULT_POLICY_BRIEF });
    setCopyStatus("Brief cleared.");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <aside
      className="brief-tray"
      aria-labelledby={titleId}
      id="policy-brief"
    >
      <header className="brief-tray__header">
        <p className="brief-tray__eyebrow">Local briefing workspace</p>
        <h2 id={titleId}>Policy brief</h2>
        <p>
          Collect findings, gaps, bills, and substance notes on this device
          only. Does not draft legislation or save to a server.
        </p>
        <p className="brief-tray__meta" aria-live="polite">
          {itemCount} item{itemCount === 1 ? "" : "s"} in brief ·{" "}
          {REVIEW_STATUS_LABEL.team_review_required}
        </p>
      </header>

      <section className="brief-tray__section" aria-labelledby="brief-objective">
        <h3 id="brief-objective">Policy objective</h3>
        <label className="sr-only" htmlFor="brief-objective-input">
          Policy objective
        </label>
        <textarea
          id="brief-objective-input"
          className="brief-tray__textarea"
          rows={3}
          value={brief.objective}
          onChange={(event) =>
            onChange({ ...brief, objective: event.target.value })
          }
        />
      </section>

      <section className="brief-tray__section" aria-labelledby="brief-landscape">
        <h3 id="brief-landscape">North Carolina landscape</h3>
        <p className="brief-tray__fixed">
          <strong>{NC_LANDSCAPE_SUMMARY.headline}</strong>
        </p>
        <p className="brief-tray__fixed">{NC_LANDSCAPE_SUMMARY.summary}</p>
        <p className="brief-tray__note" role="note">
          Draft project analysis — pending team review
        </p>
      </section>

      <section className="brief-tray__section" aria-labelledby="brief-findings">
        <h3 id="brief-findings">Distinctive NC approaches</h3>
        {brief.findingIds.length === 0 ? (
          <p className="brief-tray__empty">No findings added yet.</p>
        ) : (
          <ul className="brief-tray__list">
            {brief.findingIds.map((id) => {
              const finding = getFindingById(id);
              if (!finding) return null;
              return (
                <li key={id}>
                  <span>{finding.title}</span>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => onChange(toggleFinding(brief, id))}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="brief-tray__section" aria-labelledby="brief-gaps">
        <h3 id="brief-gaps">Potential policy gaps</h3>
        {brief.gapIds.length === 0 ? (
          <p className="brief-tray__empty">No gaps added yet.</p>
        ) : (
          <ul className="brief-tray__list">
            {brief.gapIds.map((id) => {
              const gap = getGapById(id);
              if (!gap) return null;
              return (
                <li key={id}>
                  <span>{gap.title}</span>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => onChange(toggleGap(brief, id))}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="brief-tray__section" aria-labelledby="brief-bills">
        <h3 id="brief-bills">Reference bills</h3>
        {brief.billIds.length === 0 ? (
          <p className="brief-tray__empty">No bills added yet.</p>
        ) : (
          <ul className="brief-tray__list">
            {brief.billIds.map((id) => {
              const bill = billsById.get(id);
              return (
                <li key={id}>
                  <span>
                    {bill ? formatBillIdLine(bill) : id}
                    {bill ? ` — ${bill.title}` : ""}
                  </span>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => onChange(toggleBill(brief, id))}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="brief-tray__section" aria-labelledby="brief-substance">
        <h3 id="brief-substance">Bill-substance notes</h3>
        {brief.substanceBillIds.length === 0 ? (
          <p className="brief-tray__empty">No substance notes added yet.</p>
        ) : (
          <ul className="brief-tray__list">
            {brief.substanceBillIds.map((id) => {
              const substance = getSubstanceByBillId(id);
              const bill = billsById.get(id);
              return (
                <li key={id}>
                  <span>
                    {bill ? formatBillIdLine(bill) : id}
                    {substance
                      ? ` — ${substance.coreMechanism.slice(0, 80)}…`
                      : ""}
                  </span>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => onChange(toggleSubstance(brief, id))}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="brief-tray__section" aria-labelledby="brief-sources">
        <h3 id="brief-sources">External sources</h3>
        <p className="brief-tray__fixed">
          Use official legislature links on each bill detail page. Prototype
          URLs are fictional ({NC_POLICY_DESIGN_META.stateName} design page).
        </p>
      </section>

      <section className="brief-tray__section" aria-labelledby="brief-notes">
        <h3 id="brief-notes">User notes</h3>
        <label className="sr-only" htmlFor="brief-notes-input">
          User notes
        </label>
        <textarea
          id="brief-notes-input"
          className="brief-tray__textarea"
          rows={4}
          value={brief.notes}
          onChange={(event) => onChange({ ...brief, notes: event.target.value })}
          placeholder="Add private notes for this briefing session…"
        />
      </section>

      <section className="brief-tray__section" aria-labelledby="brief-questions">
        <h3 id="brief-questions">Open drafting questions</h3>
        <ul className="brief-tray__questions">
          {brief.draftingQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
        <p className="brief-tray__note" role="note">
          Questions are prompts for human discussion — not AI-generated bill
          language.
        </p>
      </section>

      <div className="brief-tray__actions btn-row">
        <button type="button" className="btn btn--primary" onClick={handleCopy}>
          Copy brief text
        </button>
        <button type="button" className="btn btn--secondary" onClick={handlePrint}>
          Print brief
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleClear}>
          Clear brief
        </button>
      </div>

      {copyStatus && (
        <p className="brief-tray__status" role="status">
          {copyStatus}
        </p>
      )}
    </aside>
  );
}
