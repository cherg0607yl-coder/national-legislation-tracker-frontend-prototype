import { useMemo, useState } from "react";
import type { Bill } from "../../types/bill";
import { StateTileMap } from "../StateTileMap";
import { STATE_NAMES, billCountByState, statesWithBills } from "../../lib/stats";
import {
  MAX_COMPARE_STATES,
  buildMomentumLevels,
  buildStateAiProfile,
  buildTopicCompareRows,
  getAiBills,
  toggleCompareState,
  topMomentumStates,
} from "../../lib/policyDesign";
import {
  AccessibleBarChart,
  GroupedCompareChart,
} from "./AccessibleBarChart";
import { StateComparePanel } from "./StateComparePanel";
import "../../styles/components/AccessibleBarChart.css";

interface AiMomentumWorkspaceProps {
  bills: Bill[];
  onChangeCategory: () => void;
}

export function AiMomentumWorkspace({
  bills,
  onChangeCategory,
}: AiMomentumWorkspaceProps) {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const aiBills = useMemo(() => getAiBills(bills), [bills]);
  const billCounts = useMemo(() => billCountByState(aiBills), [aiBills]);
  const withData = useMemo(() => statesWithBills(aiBills), [aiBills]);
  const momentumLevels = useMemo(
    () => buildMomentumLevels(aiBills),
    [aiBills],
  );
  const leaderboard = useMemo(() => topMomentumStates(aiBills, 10), [aiBills]);

  const profiles = useMemo(
    () => selectedStates.map((state) => buildStateAiProfile(state, bills)),
    [selectedStates, bills],
  );

  const compareTopics = useMemo(
    () => buildTopicCompareRows(profiles, 6),
    [profiles],
  );

  const previewState = hoveredState;
  const previewProfile = useMemo(
    () =>
      previewState ? buildStateAiProfile(previewState, bills) : null,
    [previewState, bills],
  );

  function handleSelect(state: string) {
    setSelectedStates((current) => toggleCompareState(current, state));
  }

  function removeState(state: string) {
    setSelectedStates((current) => current.filter((s) => s !== state));
  }

  return (
    <section
      className="policy-design-stage"
      aria-labelledby="policy-design-map-heading"
    >
      <div className="policy-design-stage__toolbar">
        <div className="section-heading policy-design-stage__intro">
          <p className="policy-design-eyebrow">Policy Design · Stage 2</p>
          <h1 id="policy-design-map-heading">
            Artificial Intelligence momentum
          </h1>
          <p>
            Explore AI legislative activity with a map and accessible bar
            charts. Hover for topic focus; select up to {MAX_COMPARE_STATES}{" "}
            states to compare approaches and policy gaps.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onChangeCategory}
        >
          Change category
        </button>
      </div>

      <div className="ai-momentum-layout">
        <div className="ai-momentum-charts">
          <div className="ai-momentum-map-panel">
            <StateTileMap
              statesWithData={withData}
              selectedStates={selectedStates}
              hoveredState={hoveredState}
              billCounts={billCounts}
              momentumLevels={momentumLevels}
              caption={`Select up to ${MAX_COMPARE_STATES} states · darker tiles = higher AI momentum`}
              ariaLabel="United States map showing Artificial Intelligence legislative momentum. Click to select states for comparison."
              onStateHover={setHoveredState}
              onStateSelect={handleSelect}
            />

            <div className="ai-momentum-legend" aria-hidden="true">
              <span>Lower momentum</span>
              <span className="ai-momentum-legend__swatch momentum-1" />
              <span className="ai-momentum-legend__swatch momentum-2" />
              <span className="ai-momentum-legend__swatch momentum-3" />
              <span>Higher momentum</span>
            </div>

            <div
              className={
                previewState
                  ? "ai-momentum-hover"
                  : "ai-momentum-hover ai-momentum-hover--idle"
              }
              aria-live="polite"
            >
              {previewState && previewProfile ? (
                <>
                  <p className="ai-momentum-hover__state">
                    {STATE_NAMES[previewState] ?? previewState}
                    <span>
                      {billCounts[previewState]
                        ? ` · ${billCounts[previewState]} AI bill${billCounts[previewState] === 1 ? "" : "s"}`
                        : " · no AI bills tracked"}
                    </span>
                  </p>
                  <AccessibleBarChart
                    title="Trending topics"
                    data={previewProfile.trendingTopics.slice(0, 5).map((t) => ({
                      id: t.topic,
                      label: t.topic,
                      value: t.count,
                    }))}
                    unit="bills"
                    compact
                    emptyMessage="No trending AI topics for this state in the prototype corpus."
                  />
                  <p className="ai-momentum-hover__hint">
                    {selectedStates.includes(previewState)
                      ? "Selected for comparison · click again to remove"
                      : selectedStates.length >= MAX_COMPARE_STATES
                        ? `Click to replace the oldest selection (max ${MAX_COMPARE_STATES})`
                        : "Click to add to comparison"}
                  </p>
                </>
              ) : (
                <p>Hover a state to preview trending AI topics as a bar chart</p>
              )}
            </div>

            <div className="ai-momentum-selection" role="status">
              <p>
                Comparing{" "}
                <strong>
                  {selectedStates.length}/{MAX_COMPARE_STATES}
                </strong>{" "}
                state{selectedStates.length === 1 ? "" : "s"}
                {selectedStates.length > 0
                  ? `: ${selectedStates
                      .map((s) => STATE_NAMES[s] ?? s)
                      .join(" · ")}`
                  : ""}
              </p>
              {selectedStates.length > 0 && (
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setSelectedStates([])}
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>

          <aside className="ai-momentum-chart-card" aria-label="Momentum charts">
            <AccessibleBarChart
              title="AI momentum leaderboard"
              description="Top states by weighted legislative momentum (status progress × bill volume). Values are also listed for screen readers and in the data table."
              data={leaderboard.map((row) => ({
                id: row.state,
                label: `${row.stateName} (${row.state})`,
                value: row.billCount,
                note: `score ${row.score.toFixed(0)}`,
              }))}
              unit="AI bills"
            />
          </aside>
        </div>
      </div>

      {profiles.length >= 2 && (
        <GroupedCompareChart
          title="Topic focus comparison"
          description="Shared top AI topics across the selected states. Each topic shows a labeled bar per state so differences are readable without relying on color alone."
          topics={compareTopics}
          unit="bills"
        />
      )}

      {profiles.length > 0 ? (
        <div
          className={`state-compare-grid state-compare-grid--${profiles.length}`}
          aria-label="State comparison panels"
        >
          {profiles.map((profile) => (
            <StateComparePanel
              key={profile.state}
              profile={profile}
              onRemove={() => removeState(profile.state)}
            />
          ))}
        </div>
      ) : (
        <p className="policy-design-empty" role="status">
          Select a state on the map to open its AI policy profile and charts.
          You can juxtapose up to three states side by side.
        </p>
      )}
    </section>
  );
}
