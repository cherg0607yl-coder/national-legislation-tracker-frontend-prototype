import { useMemo, useState } from "react";
import type { Bill } from "../../types/bill";
import {
  ACTIVITY_CHART_SESSIONS,
  buildGapCoverageSnapshot,
  getAiBills,
} from "../../lib/policyExploration";
import { STATE_NAMES } from "../../lib/stats";
import { AccessibleBarChart } from "../policy-design/AccessibleBarChart";
import "../../styles/components/AccessibleBarChart.css";

interface GapShellProps {
  dim: string;
  titleId: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

function GapShell({
  dim,
  titleId,
  title,
  description,
  children,
}: GapShellProps) {
  const [open, setOpen] = useState(false);

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
          {children ?? (
            <p className="gap-dimensions__placeholder">
              Gap analysis for this dimension will appear here.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function CoverageGapPanel({
  bills,
  stateCode,
}: {
  bills: Bill[];
  stateCode: string;
}) {
  const [sessionId, setSessionId] = useState(
    ACTIVITY_CHART_SESSIONS[0]?.id ?? "2025-2026",
  );
  const aiBills = useMemo(() => getAiBills(bills), [bills]);
  const snapshot = useMemo(
    () => buildGapCoverageSnapshot(aiBills, stateCode, sessionId),
    [aiBills, stateCode, sessionId],
  );

  const introducedData = snapshot.introducedGaps.map((row) => ({
    id: `introduced-${row.domain}`,
    label: row.domain,
    value: row.coverageShare,
    note: `${row.coveredStates}/50 states`,
  }));
  const enactedData = snapshot.enactedGaps.map((row) => ({
    id: `enacted-${row.domain}`,
    label: row.domain,
    value: row.coverageShare,
    note: `${row.coveredStates}/50 states`,
  }));

  return (
    <div className="gap-coverage-panel">
      <div className="activity-panel__session-head">
        <div>
          <h4>Coverage gaps by NCSL domain</h4>
          <p className="activity-panel__lead">
            Missing domains in the selected state, ordered from lowest to highest
            share of peer-state coverage in {snapshot.sessionLabel}.
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

      <section className="gap-coverage-panel__block">
        <h4>1. Introduced bills</h4>
        <p className="activity-panel__lead">
          Domains where this state has no introduced bill, annotated with the
          percentage of states that do have coverage.
        </p>
        <AccessibleBarChart
          title="Missing introduced-bill domains"
          description="Ascending by percentage of states covering the domain."
          data={introducedData}
          unit="% of states"
          preserveOrder
          emptyMessage="This state has introduced-bill coverage across all 25 NCSL domains in this session."
        />
      </section>

      <section className="gap-coverage-panel__block">
        <h4>2. Enacted bills</h4>
        <p className="activity-panel__lead">
          Domains where this state lacks enacted coverage, annotated with the
          percentage of states that have enacted a bill in that domain.
        </p>
        <AccessibleBarChart
          title="Missing enacted-bill domains"
          description="Ascending by percentage of states with enacted-domain coverage."
          data={enactedData}
          unit="% of states"
          preserveOrder
          emptyMessage="This state has enacted-domain coverage across all 25 NCSL domains in this session."
        />
      </section>
    </div>
  );
}

const GAP_DIMENSIONS = [
  {
    dim: "Dimension 1",
    titleId: "gap-coverage-heading",
    title: "Coverage gap",
    description:
      "Peer states have bills or laws in a topic, while this state has none—or very little.",
  },
  {
    dim: "Dimension 2",
    titleId: "gap-strength-heading",
    title: "Strength gap",
    description:
      "Weaker mechanism relative to peers (for example, study versus mandate). Needs to be extracted from bill substance.",
  },
  {
    dim: "Dimension 3",
    titleId: "gap-implementation-heading",
    title: "Implementation gap",
    description:
      "A law exists, but there is little rulemaking, funding, or agency capacity behind it.",
  },
  {
    dim: "Dimension 4",
    titleId: "gap-agenda-heading",
    title: "Agenda gap",
    description:
      "Human editorial judgment: the issue is salient locally (agency risk, news, AG opinion) but no bill has been introduced yet.",
  },
] as const;

interface GapDimensionsProps {
  stateCode: string;
  bills: Bill[];
}

/** State-scoped only — compare this jurisdiction against peers. */
export function GapDimensions({ stateCode, bills }: GapDimensionsProps) {
  const stateName = STATE_NAMES[stateCode] ?? stateCode;

  return (
    <div className="gap-dimensions" aria-label="Gap dimensions">
      <div className="section-heading gap-dimensions__intro">
        <p className="policy-explore-eyebrow">State-scoped · Define “gap”</p>
        <h2>Gap dimensions · {stateName}</h2>
        <p>
          Gaps for {stateName} versus peer states and national patterns—where
          this jurisdiction lags on coverage, mechanism strength, implementation
          follow-through, or agenda attention.
        </p>
        <p>
          <b>Notes: for each gap dimension, consider including the state's situation & other states' approaches.</b>
        </p>
      </div>

      {GAP_DIMENSIONS.map((item) => (
        <GapShell key={item.titleId} {...item}>
          {item.titleId === "gap-coverage-heading" ? (
            <CoverageGapPanel bills={bills} stateCode={stateCode} />
          ) : undefined}
        </GapShell>
      ))}
    </div>
  );
}

/** Nation-view prompt when gap analysis is unavailable. */
export function GapDimensionsPrompt() {
  return (
    <aside
      className="gap-dimensions-prompt"
      aria-labelledby="gap-prompt-heading"
    >
      <p className="policy-explore-eyebrow">State-scoped</p>
      <h2 id="gap-prompt-heading">Gap dimensions</h2>
      <p>
        Gap analysis compares a focal state to peers. Select a state on the map
        to open coverage, strength, implementation, and agenda gaps for that
        jurisdiction.
      </p>
    </aside>
  );
}
