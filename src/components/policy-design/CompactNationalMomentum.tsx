import { useMemo, useState } from "react";
import type { Bill } from "../../types/bill";
import {
  billCountByState,
  buildMomentumSnapshot,
  computeMomentumLevels,
  getAiBills,
} from "../../lib/policyExploration";
import { UsStatesMap } from "../policy-exploration/UsStatesMap";
import { AccessibleBarChart } from "./AccessibleBarChart";
import { AccessibleDonutChart } from "./AccessibleDonutChart";
import "../../styles/components/AccessibleBarChart.css";
import "../../styles/components/AccessibleDonutChart.css";

type MomentumLens = "volume" | "progression" | "recency" | "institutionalization";

const LENSES: {
  id: MomentumLens;
  label: string;
  definition: string;
}[] = [
  {
    id: "volume",
    label: "Legislative volume",
    definition:
      "How many AI bills are tracked in the selected scope, and how introductions compare across states.",
  },
  {
    id: "progression",
    label: "Progression",
    definition:
      "How far tracked bills advanced (committee, chamber, enactment). Rates are cumulative, not mutually exclusive.",
  },
  {
    id: "recency",
    label: "Recent activity",
    definition:
      "Introductions and updates in the last 7, 30, and 90 days relative to the prototype’s fixed “today.”",
  },
  {
    id: "institutionalization",
    label: "Institutionalization",
    definition:
      "Among enacted bills, how far substance appears to reach operational duties, enforcement, or resources (heuristic, draft).",
  },
];

interface CompactNationalMomentumProps {
  bills: Bill[];
}

export function CompactNationalMomentum({
  bills,
}: CompactNationalMomentumProps) {
  const [lens, setLens] = useState<MomentumLens>("volume");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const aiBills = useMemo(() => getAiBills(bills), [bills]);
  const billCounts = useMemo(() => billCountByState(aiBills), [aiBills]);
  const momentumLevels = useMemo(
    () => computeMomentumLevels(aiBills),
    [aiBills],
  );
  const snapshot = useMemo(
    () => buildMomentumSnapshot(bills, selectedState),
    [bills, selectedState],
  );

  const activeLens = LENSES.find((item) => item.id === lens) ?? LENSES[0];
  const { activity, progression, institutionalization } = snapshot;

  const statusDonut = useMemo(() => {
    const total = progression.statusBars.reduce((sum, row) => sum + row.count, 0);
    return progression.statusBars.map((row) => ({
      id: row.status,
      label: row.status,
      value: row.count,
      share: total === 0 ? 0 : Math.round((row.count / total) * 1000) / 10,
    }));
  }, [progression.statusBars]);

  function handleSelect(state: string) {
    setSelectedState((current) => (current === state ? null : state));
  }

  return (
    <div className="nc-momentum">
      <div className="nc-momentum__map">
        <UsStatesMap
          billCounts={billCounts}
          momentumLevels={momentumLevels}
          selectedState={selectedState}
          hoveredState={hoveredState}
          onStateHover={setHoveredState}
          onStateSelect={handleSelect}
        />
        <p className="nc-momentum__map-note" role="note">
          Map shading reflects relative AI bill volume in this mock corpus (not
          a quality score). Coverage is sparse outside a few high-density
          states. Click a state to scope the metrics below; click again to
          return to nationwide.
        </p>
      </div>

      <div className="nc-momentum__controls">
        <p className="nc-momentum__eyebrow">
          Momentum dimensions · legislative activity, not policy quality
        </p>
        <div
          className="nc-momentum__tabs"
          role="tablist"
          aria-label="Momentum dimension"
        >
          {LENSES.map((item) => {
            const selected = item.id === lens;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`momentum-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="momentum-panel"
                tabIndex={selected ? 0 : -1}
                className={
                  selected
                    ? "nc-momentum__tab is-active"
                    : "nc-momentum__tab"
                }
                onClick={() => setLens(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          id="momentum-panel"
          role="tabpanel"
          aria-labelledby={`momentum-tab-${lens}`}
          className="nc-momentum__panel"
        >
          <h3>{activeLens.label}</h3>
          <p>{activeLens.definition}</p>
          <p className="nc-momentum__scope">
            Dataset in view: <strong>{snapshot.scopeLabel}</strong>
            {selectedState ? (
              <>
                {" "}
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setSelectedState(null)}
                >
                  Back to nationwide
                </button>
              </>
            ) : null}
          </p>

          {lens === "volume" && (
            <div className="nc-momentum__stats" role="list">
              <div role="listitem">
                <span className="nc-momentum__stat-value">
                  {activity.introducedCount}
                </span>
                <span className="nc-momentum__stat-label">AI bills tracked</span>
              </div>
              <div role="listitem">
                <span className="nc-momentum__stat-value">
                  {activity.bySession.find((s) => s.sessionId === "2025-2026")
                    ?.introduced ?? 0}
                </span>
                <span className="nc-momentum__stat-label">
                  Introduced · 2025–2026 session window
                </span>
              </div>
            </div>
          )}

          {lens === "recency" && (
            <div className="nc-momentum__stats nc-momentum__stats--four" role="list">
              <div role="listitem">
                <span className="nc-momentum__stat-value">
                  {activity.introducedLast7}
                </span>
                <span className="nc-momentum__stat-label">Introduced · 7 days</span>
              </div>
              <div role="listitem">
                <span className="nc-momentum__stat-value">
                  {activity.introducedLast30}
                </span>
                <span className="nc-momentum__stat-label">
                  Introduced · 30 days
                </span>
              </div>
              <div role="listitem">
                <span className="nc-momentum__stat-value">
                  {activity.introducedLast90}
                </span>
                <span className="nc-momentum__stat-label">
                  Introduced · 90 days
                </span>
              </div>
              <div role="listitem">
                <span className="nc-momentum__stat-value">
                  {activity.updatedLast30}
                </span>
                <span className="nc-momentum__stat-label">Updated · 30 days</span>
              </div>
            </div>
          )}

          {lens === "progression" && (
            <div className="nc-momentum__split">
              <AccessibleDonutChart
                title="Status mix"
                description="Mutually exclusive bill statuses for the dataset in view."
                data={statusDonut}
                unit="bills"
                centerValue={String(progression.total)}
                centerLabel="bills"
              />
              <ul className="nc-momentum__rates">
                <li>
                  Cleared committee: <strong>{progression.rates.committee}%</strong>
                </li>
                <li>
                  Cleared chamber: <strong>{progression.rates.chamber}%</strong>
                </li>
                <li>
                  Enacted: <strong>{progression.rates.enacted}%</strong>
                </li>
              </ul>
            </div>
          )}

          {lens === "institutionalization" && (
            <>
              <div className="nc-momentum__stats" role="list">
                <div role="listitem">
                  <span className="nc-momentum__stat-value">
                    {institutionalization.enactedCount}
                  </span>
                  <span className="nc-momentum__stat-label">Enacted bills</span>
                </div>
                <div role="listitem">
                  <span className="nc-momentum__stat-value">
                    {institutionalization.enactedNotImplementedShare}%
                  </span>
                  <span className="nc-momentum__stat-label">
                    Share still below operational Level 3 (draft heuristic)
                  </span>
                </div>
              </div>
              <AccessibleBarChart
                title="Implementation levels among enacted bills"
                description="Highest evidenced level per enacted bill. Prototype heuristic — pending team review."
                data={institutionalization.levels.map((row) => ({
                  id: `L${row.level}`,
                  label: `L${row.level} ${row.title}`,
                  value: row.count,
                  note: `${row.shareOfEnacted}% of enacted`,
                }))}
                unit="bills"
                preserveOrder
              />
              <p className="nc-momentum__draft-note" role="note">
                Draft analysis — pending team review. Institutionalization levels
                are inferred from bill text cues in the prototype and are not
                legal conclusions.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
