import { useMemo, useState, type ReactNode } from "react";
import type { Bill } from "../../types/bill";
import type { MomentumSnapshot } from "../../lib/policyExploration";
import {
  ACTIVITY_CHART_SESSIONS,
  NCSL_AI_TAXONOMY,
  buildSessionBreadth,
  stateIntroductionsForSession,
} from "../../lib/policyExploration";
import { LEGISLATIVE_SESSIONS } from "../../lib/stats";
import { AccessibleBarChart } from "../policy-design/AccessibleBarChart";
import { AccessibleDonutChart } from "../policy-design/AccessibleDonutChart";
import "../../styles/components/AccessibleBarChart.css";
import "../../styles/components/AccessibleDonutChart.css";

interface MomentumDimensionsProps {
  snapshot: MomentumSnapshot;
  /** Nationwide AI bills — used for the cross-state session chart. */
  allAiBills: Bill[];
}

interface DimensionShellProps {
  dim: string;
  titleId: string;
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function DimensionShell({
  dim,
  titleId,
  title,
  description,
  children,
  defaultOpen = false,
}: DimensionShellProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={`momentum-card${open ? " momentum-card--open" : ""}`}>
      <header className="momentum-card__header">
        <p className="momentum-card__dim">{dim}</p>
        <h3 id={titleId}>{title}</h3>
        <p>{description}</p>
        <button
          type="button"
          className="momentum-card__toggle"
          aria-expanded={open}
          aria-controls={`${titleId}-panel`}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Hide details" : "Show details"}
          <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
      </header>

      {open && (
        <div
          id={`${titleId}-panel`}
          className="momentum-card__body"
          role="region"
          aria-labelledby={titleId}
        >
          {children}
        </div>
      )}
    </article>
  );
}

function LegislativeActivityPanel({
  snapshot,
  allAiBills,
}: {
  snapshot: MomentumSnapshot;
  allAiBills: Bill[];
}) {
  const { activity } = snapshot;
  const [sessionId, setSessionId] = useState(
    ACTIVITY_CHART_SESSIONS[0]?.id ?? "2025-2026",
  );

  const stateBars = useMemo(
    () => stateIntroductionsForSession(allAiBills, sessionId),
    [allAiBills, sessionId],
  );

  const sessionLabel =
    ACTIVITY_CHART_SESSIONS.find((s) => s.id === sessionId)?.label ?? sessionId;

  const currentYearly = activity.yearlyWindows.find((row) => row.id === "current");
  const historyYearly = activity.yearlyWindows.filter(
    (row) => row.id !== "current",
  );

  return (
    <div className="activity-panel">
      <section
        className="activity-panel__block"
        aria-labelledby="activity-volume-heading"
      >
        <h4 id="activity-volume-heading">Volume &amp; recent introductions</h4>
        <p className="activity-panel__lead">
          How many AI bills are tracked in this dataset, and how many were
          introduced in the last 7, 30, and 90 days.
        </p>
        <div className="momentum-card__stat-row momentum-card__stat-row--four">
          <div>
            <span className="momentum-card__stat-value">
              {activity.introducedCount}
            </span>
            <span className="momentum-card__stat-label">AI bills tracked</span>
          </div>
          <div>
            <span className="momentum-card__stat-value">
              {activity.introducedLast7}
            </span>
            <span className="momentum-card__stat-label">Introduced · 7 days</span>
          </div>
          <div>
            <span className="momentum-card__stat-value">
              {activity.introducedLast30}
            </span>
            <span className="momentum-card__stat-label">
              Introduced · 30 days
            </span>
          </div>
          <div>
            <span className="momentum-card__stat-value">
              {activity.introducedLast90}
            </span>
            <span className="momentum-card__stat-label">
              Introduced · 90 days
            </span>
          </div>
        </div>
      </section>

      <section
        className="activity-panel__block"
        aria-labelledby="activity-session-heading"
      >
        <div className="activity-panel__session-head">
          <div>
            <h4 id="activity-session-heading">Introductions by state</h4>
            <p className="activity-panel__lead">
              Select a legislative session to compare AI bill introductions
              across all US states (descending).
            </p>
          </div>
          <label className="activity-panel__session-select">
            <span>Session</span>
            <select
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
            >
              {ACTIVITY_CHART_SESSIONS.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <AccessibleBarChart
          title={`AI bills introduced · ${sessionLabel}`}
          description="All US states ordered by introductions in the selected session."
          data={stateBars}
          unit="bills"
          orientation="vertical"
          emptyMessage="No AI bill introductions in this session."
        />
      </section>

      <section
        className="activity-panel__block"
        aria-labelledby="activity-yearly-heading"
      >
        <h4 id="activity-yearly-heading">Yearly increase by number</h4>
        <p className="activity-panel__lead">
          Current-session volume shown first, then historical session windows
          ordered by introductions.
        </p>

        <div className="yearly-current" role="group" aria-label="Current session">
          <span className="yearly-current__label">
            {currentYearly?.label ?? "Current session"}
          </span>
          <span className="yearly-current__value">
            {currentYearly?.count ?? 0}
          </span>
          <span className="yearly-current__unit">AI bills introduced</span>
        </div>

        <AccessibleBarChart
          title="History comparison"
          description="Prior session / year windows ordered descending by introductions."
          data={historyYearly.map((row) => ({
            id: row.id,
            label: row.label,
            value: row.count,
          }))}
          unit="bills"
          emptyMessage="No historical introductions in these windows."
        />
      </section>
    </div>
  );
}

function PolicyBreadthPanel({
  scopedAiBills,
}: {
  scopedAiBills: Bill[];
}) {
  const [sessionId, setSessionId] = useState(
    LEGISLATIVE_SESSIONS[0]?.id ?? "2025-2026",
  );

  const breadth = useMemo(
    () => buildSessionBreadth(scopedAiBills, sessionId),
    [scopedAiBills, sessionId],
  );

  return (
    <div className="breadth-panel">
      <section
        className="breadth-panel__taxonomy"
        aria-labelledby="breadth-taxonomy-heading"
      >
        <h4 id="breadth-taxonomy-heading">Domain taxonomy</h4>
        <p className="activity-panel__lead">
          Coverage uses the{" "}
          <strong>NCSL AI legislation taxonomy</strong> ({NCSL_AI_TAXONOMY.length}{" "}
          domains). Select a legislative session to see which domains appear in
          the dataset in view.
        </p>
        <ul className="breadth-taxonomy-list" role="list">
          {NCSL_AI_TAXONOMY.map((domain) => {
            const row = breadth.domains.find((d) => d.domain === domain);
            const covered = (row?.count ?? 0) > 0;
            return (
              <li
                key={domain}
                className={
                  covered
                    ? "breadth-taxonomy-list__item breadth-taxonomy-list__item--covered"
                    : "breadth-taxonomy-list__item"
                }
              >
                {domain}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="activity-panel__session-head">
        <div>
          <h4 id="breadth-session-heading">Session coverage</h4>
          <p className="activity-panel__lead">
            {breadth.domainsCovered} of {breadth.totalDomains} NCSL domains
            covered in {breadth.sessionLabel}
            {breadth.totalBills > 0
              ? ` · ${breadth.totalBills} AI bill${breadth.totalBills === 1 ? "" : "s"}`
              : ""}
            .
          </p>
        </div>
        <label className="activity-panel__session-select">
          <span>Session</span>
          <select
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            aria-labelledby="breadth-session-heading"
          >
            {LEGISLATIVE_SESSIONS.map((session) => (
              <option key={session.id} value={session.id}>
                {session.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="breadth-panel__split">
        <AccessibleDonutChart
          title="Domain share"
          description="Percentage of AI bills in each NCSL domain for the selected session."
          data={breadth.presentDomains.map((row) => ({
            id: row.domain,
            label: row.domain,
            value: row.count,
            share: row.share,
          }))}
          unit="bills"
          centerValue={`${breadth.coverageShare}%`}
          centerLabel="domains"
          emptyMessage="No AI bills in this session for the current dataset."
        />

        <aside className="breadth-insights" aria-label="Domain highlights">
          <div className="breadth-insights__card">
            <p className="breadth-insights__eyebrow">Most popular domain</p>
            {breadth.mostPopular ? (
              <>
                <h5>{breadth.mostPopular.domain}</h5>
                <p>
                  Accounts for{" "}
                  <strong>{breadth.mostPopular.share}%</strong> of AI bills in{" "}
                  {breadth.sessionLabel}, with{" "}
                  <strong>{breadth.mostPopular.count}</strong> bill
                  {breadth.mostPopular.count === 1 ? "" : "s"} tagged to this
                  NCSL domain.
                </p>
              </>
            ) : (
              <p>No domains present in this session yet.</p>
            )}
          </div>

          <div className="breadth-insights__card">
            <p className="breadth-insights__eyebrow">Most active domain</p>
            {breadth.mostActive ? (
              <>
                <h5>{breadth.mostActive.domain}</h5>
                <p>
                  Highest enactment activity among covered domains:{" "}
                  <strong>{breadth.mostActive.introduced}</strong> introduced
                  and <strong>{breadth.mostActive.enacted}</strong> enacted in{" "}
                  {breadth.sessionLabel}.
                </p>
              </>
            ) : (
              <p>No activity to highlight for this session.</p>
            )}
          </div>

          {breadth.uncoveredDomains.length > 0 && (
            <p className="breadth-insights__uncovered">
              Not yet covered this session:{" "}
              {breadth.uncoveredDomains.slice(0, 6).join(", ")}
              {breadth.uncoveredDomains.length > 6
                ? `, +${breadth.uncoveredDomains.length - 6} more`
                : ""}
              .
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

export function MomentumDimensions({
  snapshot,
  allAiBills,
}: MomentumDimensionsProps) {
  const { progression, institutionalization, innovation } = snapshot;

  const scopedAiBills = useMemo(() => {
    if (snapshot.scopeKey === "national") return allAiBills;
    return allAiBills.filter((bill) => bill.state === snapshot.scopeKey);
  }, [allAiBills, snapshot.scopeKey]);

  return (
    <div className="momentum-dimensions" aria-label="Momentum dimensions">
      <div className="section-heading momentum-dimensions__intro">
        <h2>Momentum dimensions</h2>
        <p>
          Five research lenses on AI legislative activity. Expand a card to
          inspect the full metrics for the dataset in view.
        </p>
      </div>

      <DimensionShell
        dim="Dimension 1"
        titleId="momentum-activity-heading"
        title="Legislative activity"
        description="Counts how many AI bills have been introduced in the last 7, 30, and 90 days, and how introductions have changed over the past five years."
      >
        <LegislativeActivityPanel
          snapshot={snapshot}
          allAiBills={allAiBills}
        />
      </DimensionShell>

      <DimensionShell
        dim="Dimension 2"
        titleId="momentum-breadth-heading"
        title="Policy breadth / coverage"
        description="Measured against the NCSL AI legislation domain taxonomy—how many domains are covered in a selected session, and which domains dominate."
      >
        <PolicyBreadthPanel scopedAiBills={scopedAiBills} />
      </DimensionShell>

      <DimensionShell
        dim="Dimension 3"
        titleId="momentum-progression-heading"
        title="Policy progression"
        description="Measured by the share of bills that cleared committee, a chamber, or enactment."
      >
        <div className="progression-meters" role="list">
          {(
            [
              ["Cleared committee", progression.rates.committee],
              ["Cleared chamber", progression.rates.chamber],
              ["Enacted", progression.rates.enacted],
            ] as const
          ).map(([label, rate]) => (
            <div key={label} className="progression-meters__row" role="listitem">
              <div className="progression-meters__label">
                <span>{label}</span>
                <strong>{rate}%</strong>
              </div>
              <div
                className="progression-meters__track"
                role="img"
                aria-label={`${label}: ${rate} percent`}
              >
                <div
                  className="progression-meters__fill"
                  style={{ width: `${Math.max(rate, rate > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <AccessibleBarChart
          title="Status mix"
          data={progression.statusBars.map((row) => ({
            id: row.status,
            label: row.status,
            value: row.count,
          }))}
          unit="bills"
          compact
        />
      </DimensionShell>

      <DimensionShell
        dim="Dimension 4"
        titleId="momentum-institution-heading"
        title="Institutionalization"
        description="Measured by sponsor engagement and signals that governments are executing after passage."
      >
        <div className="momentum-card__stat-row">
          <div>
            <span className="momentum-card__stat-value">
              {institutionalization.uniqueSponsors}
            </span>
            <span className="momentum-card__stat-label">Unique sponsors</span>
          </div>
          <div>
            <span className="momentum-card__stat-value">
              {institutionalization.avgSponsorsPerBill}
            </span>
            <span className="momentum-card__stat-label">Avg sponsors / bill</span>
          </div>
          <div>
            <span className="momentum-card__stat-value">
              {institutionalization.enactedCount}
            </span>
            <span className="momentum-card__stat-label">Enacted bills</span>
          </div>
        </div>

        <ul className="execution-signals">
          {institutionalization.executionSignals.map((signal) => (
            <li key={`${signal.source}-${signal.title}`}>
              <p className="execution-signals__source">{signal.source}</p>
              <p className="execution-signals__title">{signal.title}</p>
              <p className="execution-signals__note">{signal.note}</p>
              {signal.url && (
                <a
                  href={signal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  External source ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </DimensionShell>

      <DimensionShell
        dim="Dimension 5"
        titleId="momentum-innovation-heading"
        title="Innovation"
        description="Human editorial judgment on whether approaches are groundbreaking—not a machine-ranked score."
      >
        <ul className="innovation-list">
          {innovation.map((item) => (
            <li key={item.title}>
              <p className="innovation-list__eyebrow">Editorial highlight</p>
              <h4>{item.title}</h4>
              <p>{item.summary}</p>
              <p className="innovation-list__note">{item.editorialNote}</p>
              <p className="innovation-list__source">Source: {item.source}</p>
            </li>
          ))}
        </ul>
      </DimensionShell>
    </div>
  );
}
