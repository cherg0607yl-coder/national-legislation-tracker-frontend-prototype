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
  const { progression, institutionalization } = snapshot;

  const scopedAiBills = useMemo(() => {
    if (snapshot.scopeKey === "national") return allAiBills;
    return allAiBills.filter((bill) => bill.state === snapshot.scopeKey);
  }, [allAiBills, snapshot.scopeKey]);

  return (
    <div className="momentum-dimensions" aria-label="Momentum dimensions">
      <div className="section-heading momentum-dimensions__intro">
        <h2>Momentum dimensions</h2>
        <p>
          Four research lenses on AI legislative activity. Expand a card to
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
        <div className="progression-panel">
          <div>
            <h4 className="progression-panel__heading">Advancement funnel</h4>
            <p className="activity-panel__lead">
              Cumulative stages — a bill that is enacted has also cleared
              committee and a chamber. Rates are not mutually exclusive.
            </p>
            <div className="progression-meters" role="list">
              {(
                [
                  ["Cleared committee", progression.rates.committee],
                  ["Cleared chamber", progression.rates.chamber],
                  ["Enacted", progression.rates.enacted],
                ] as const
              ).map(([label, rate]) => (
                <div
                  key={label}
                  className="progression-meters__row"
                  role="listitem"
                >
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
                      style={{
                        width: `${Math.max(rate, rate > 0 ? 4 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AccessibleDonutChart
            title="Status mix"
            description="Current mutually exclusive bill statuses for the dataset in view. Click a slice to highlight its legend entry."
            data={(() => {
              const total = progression.statusBars.reduce(
                (sum, row) => sum + row.count,
                0,
              );
              return progression.statusBars.map((row) => ({
                id: row.status,
                label: row.status,
                value: row.count,
                share:
                  total === 0
                    ? 0
                    : Math.round((row.count / total) * 1000) / 10,
              }));
            })()}
            unit="bills"
            centerValue={String(progression.total)}
            centerLabel="bills"
            emptyMessage="No status data for this dataset."
          />
        </div>
      </DimensionShell>

      <DimensionShell
        dim="Dimension 4"
        titleId="momentum-institution-heading"
        title="Institutionalization"
        description="After enactment, how far does AI policy travel into government responsibility, operations, enforcement, and resources."
      >
        <div className="institution-panel">
          <section
            className="institution-gap"
            aria-labelledby="institution-gap-heading"
          >
            <div className="institution-gap__stats">
              <div>
                <span className="momentum-card__stat-value">
                  {institutionalization.enactedCount}
                </span>
                <span className="momentum-card__stat-label">Enacted bills</span>
              </div>
              <div>
                <span className="momentum-card__stat-value">
                  {institutionalization.enactedNotImplementedCount}
                </span>
                <span className="momentum-card__stat-label">
                  Enacted, not yet at execution
                </span>
              </div>
              <div>
                <span className="momentum-card__stat-value">
                  {institutionalization.enactedNotImplementedShare}%
                </span>
                <span className="momentum-card__stat-label">
                  Share below Level 3
                </span>
              </div>
            </div>
            <div className="institution-gap__copy">
              <h4 id="institution-gap-heading">
                Enacted but not implemented at the execution level
              </h4>
              <p>
                Counts enacted AI bills whose substance still sits at Level 1–2
                (authority or planning) and has not yet reached Level 3
                operational requirements—where AI policy becomes part of
                government workflow.
              </p>
              <p className="institution-gap__note" role="note">
                <strong>Note:</strong> {institutionalization.mechanismNote}
              </p>
            </div>
          </section>

          <section
            className="impl-ladder"
            aria-labelledby="impl-ladder-heading"
          >
            <h4 id="impl-ladder-heading">Implementation levels</h4>
            <p className="activity-panel__lead">
              Each enacted bill is placed at its highest evidenced level. Bars
              show share of enacted bills; text labels carry the meaning so the
              chart does not rely on color alone.
            </p>

            <ol className="impl-ladder__list">
              {institutionalization.levels.map((row) => {
                const width =
                  institutionalization.enactedCount === 0
                    ? 0
                    : Math.max(
                        row.count > 0 ? 8 : 0,
                        Math.round(
                          (row.count /
                            Math.max(institutionalization.enactedCount, 1)) *
                            100,
                        ),
                      );
                return (
                  <li
                    key={row.level}
                    className={
                      row.level === 5
                        ? "impl-ladder__item impl-ladder__item--resource"
                        : "impl-ladder__item"
                    }
                  >
                    <div className="impl-ladder__badge" aria-hidden="true">
                      L{row.level}
                    </div>
                    <div className="impl-ladder__body">
                      <div className="impl-ladder__title-row">
                        <h5>
                          <span className="sr-only">Level {row.level}: </span>
                          {row.title}
                        </h5>
                        <p className="impl-ladder__count">
                          <strong>{row.count}</strong>
                          <span>
                            {" "}
                            bill{row.count === 1 ? "" : "s"} ·{" "}
                            {row.shareOfEnacted}% of enacted
                          </span>
                        </p>
                      </div>
                      <p className="impl-ladder__desc">{row.description}</p>
                      {row.note && (
                        <p className="impl-ladder__callout" role="note">
                          {row.note}
                        </p>
                      )}
                      <div
                        className="impl-ladder__track"
                        role="img"
                        aria-label={`Level ${row.level} ${row.title}: ${row.count} enacted bills, ${row.shareOfEnacted} percent of enacted`}
                      >
                        <div
                          className="impl-ladder__fill"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </DimensionShell>
    </div>
  );
}
