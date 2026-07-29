import { useMemo, useState } from "react";
import type { Bill } from "../../types/bill";
import {
  buildTimeline,
  formatOptionalDate,
  type TimelineStageView,
} from "../../lib/bills";

interface BillStatusTimelineProps {
  bill: Bill;
}

const SHORT_LABELS: Record<string, string> = {
  Introduced: "Introduced",
  "Referred to Committee": "Committee",
  "Passed First Chamber": "1st chamber",
  "Passed Second Chamber": "2nd chamber",
  "Passed Legislature": "Legislature",
  "Awaiting Governor": "Governor",
  "Signed into Law": "Signed",
  Vetoed: "Vetoed",
  Failed: "Failed",
  Withdrawn: "Withdrawn",
};

function visibleStages(stages: TimelineStageView[]): TimelineStageView[] {
  return stages.filter((item) => {
    if (item.state === "terminal-inactive") return false;
    const isUnusedTerminal =
      ["Vetoed", "Failed", "Withdrawn"].includes(item.stage) &&
      item.state === "upcoming";
    return !isUnusedTerminal;
  });
}

export function BillStatusTimeline({ bill }: BillStatusTimelineProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const timeline = buildTimeline(bill);
  const stages = useMemo(
    () => visibleStages(timeline.stages),
    [timeline.stages],
  );
  const current = stages.find((item) => item.state === "current") ?? stages[0];
  const [selectedStage, setSelectedStage] = useState<string | null>(
    current?.stage ?? null,
  );
  const actions = bill.actions ?? [];
  const selected =
    stages.find((item) => item.stage === selectedStage) ?? current ?? null;

  return (
    <section className="bill-section" aria-labelledby="timeline-heading">
      <div className="bill-section__intro">
        <h2 id="timeline-heading">Legislative status</h2>
        <p>
          Progress through the legislative process
          {timeline.hasActionHistory
            ? ", based on recorded actions."
            : "."}
        </p>
      </div>

      {!timeline.hasActionHistory && (
        <p className="bill-callout" role="status">
          A complete legislative action history is not yet available for this
          bill. The current stage below reflects the bill&apos;s recorded status
          only.
        </p>
      )}

      <div className="status-timeline">
        <ol className="status-timeline__track" aria-label="Bill progress">
          {stages.map((item) => {
            const label =
              item.state === "complete"
                ? "Completed"
                : item.state === "current"
                  ? "Current"
                  : "Not yet reached";
            const selectedClass =
              selected?.stage === item.stage
                ? " status-timeline__item--selected"
                : "";

            return (
              <li
                key={item.stage}
                className={`status-timeline__item status-timeline__item--${item.state}${selectedClass}`}
              >
                <button
                  type="button"
                  className="status-timeline__trigger"
                  aria-pressed={selected?.stage === item.stage}
                  aria-label={`${item.stage}, ${label}${item.date ? `, ${formatOptionalDate(item.date)}` : ""}`}
                  title={item.stage}
                  onClick={() => setSelectedStage(item.stage)}
                >
                  <span className="status-timeline__marker" aria-hidden="true" />
                  <span className="status-timeline__stage">
                    {SHORT_LABELS[item.stage] ?? item.stage}
                  </span>
                  {item.date && (
                    <span className="status-timeline__date">
                      {formatOptionalDate(item.date)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {selected && (
          <div className="status-timeline__detail" role="status">
            <p className="status-timeline__detail-title">
              {selected.stage}
              <span>
                {selected.state === "complete"
                  ? "Completed"
                  : selected.state === "current"
                    ? "Current"
                    : "Not yet reached"}
              </span>
            </p>
            {selected.date && (
              <p className="status-timeline__detail-date">
                {formatOptionalDate(selected.date)}
              </p>
            )}
            {selected.description && <p>{selected.description}</p>}
          </div>
        )}
      </div>

      <div className="bill-history">
        <button
          type="button"
          className="btn btn--secondary"
          aria-expanded={historyOpen}
          onClick={() => setHistoryOpen((open) => !open)}
        >
          {historyOpen ? "Hide full action history" : "View full action history"}
        </button>

        {historyOpen && (
          <div className="bill-history__panel">
            {actions.length === 0 ? (
              <p className="bill-callout" role="status">
                A complete legislative action history is not yet available for
                this bill.
              </p>
            ) : (
              <table className="bill-history__table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Chamber</th>
                    <th scope="col">Action</th>
                    <th scope="col">Committee</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {[...actions]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((action, index) => (
                      <tr key={`${action.date}-${index}`}>
                        <td>{formatOptionalDate(action.date)}</td>
                        <td>{action.chamber ?? "—"}</td>
                        <td>{action.action}</td>
                        <td>{action.committee ?? "—"}</td>
                        <td>
                          {action.sourceUrl ? (
                            <a
                              href={action.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
