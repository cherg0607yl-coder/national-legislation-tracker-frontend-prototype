import { useMemo, useState } from "react";
import type { Bill } from "../../types/bill";
import { STATE_NAMES } from "../../lib/stats";
import {
  billCountByState,
  buildMomentumSnapshot,
  computeMomentumLevels,
  getAiBills,
} from "../../lib/policyExploration";
import { UsStatesMap } from "./UsStatesMap";
import { MomentumDimensions } from "./MomentumDimensions";
import { NationalBillTimeline } from "./NationalBillTimeline";
import { GapDimensions, GapDimensionsPrompt } from "./GapDimensions";

interface AiExplorationWorkspaceProps {
  bills: Bill[];
  onChangeCategory: () => void;
}

export function AiExplorationWorkspace({
  bills,
  onChangeCategory,
}: AiExplorationWorkspaceProps) {
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

  const preview = hoveredState ?? selectedState;
  const previewCount = preview ? (billCounts[preview] ?? 0) : null;
  const datasetLabel = selectedState
    ? (STATE_NAMES[selectedState] ?? selectedState)
    : "Nation";
  const datasetBillCount = selectedState
    ? (billCounts[selectedState] ?? 0)
    : aiBills.length;
  const isNationView = selectedState === null;

  function handleSelect(state: string) {
    setSelectedState((current) => (current === state ? null : state));
  }

  return (
    <section
      className="policy-explore-stage"
      aria-labelledby="policy-explore-map-heading"
    >
      <div className="policy-explore-stage__toolbar">
        <div className="section-heading policy-explore-stage__intro">
          <p className="policy-explore-eyebrow">Policy Exploration · Stage 2</p>
          <h1 id="policy-explore-map-heading">
            Artificial Intelligence momentum
          </h1>
          <p>
            Momentum metrics work for Nation or a selected state. The nationwide
            bill-updates timeline appears in Nation view; gap analysis opens
            when you select a state.
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

      <div className="explore-map-panel">
        <UsStatesMap
          billCounts={billCounts}
          momentumLevels={momentumLevels}
          selectedState={selectedState}
          hoveredState={hoveredState}
          onStateHover={setHoveredState}
          onStateSelect={handleSelect}
        />

        <div className="explore-map-panel__legend" aria-hidden="true">
          <span>Fewer AI bills</span>
          <span className="explore-swatch m1" />
          <span className="explore-swatch m2" />
          <span className="explore-swatch m3" />
          <span>More AI bills</span>
        </div>

        {preview && preview !== selectedState && (
          <p className="explore-map-hover" role="status">
            Hovering {STATE_NAMES[preview] ?? preview}
            {previewCount
              ? ` · ${previewCount} AI bill${previewCount === 1 ? "" : "s"}`
              : ""}
          </p>
        )}
      </div>

      <section
        className="dataset-scope"
        aria-labelledby="dataset-scope-heading"
        aria-live="polite"
      >
        <p className="dataset-scope__eyebrow">Dataset in view</p>
        <h2 id="dataset-scope-heading">{datasetLabel}</h2>
        <p>
          {isNationView
            ? "Nation scope: Momentum metrics and the important-bill timeline. Select a state for gap analysis."
            : `${datasetLabel} scope: Momentum metrics for this state, plus gap dimensions versus peers.`}
        </p>
        <div className="dataset-scope__meta">
          <span>
            {datasetBillCount} AI bill{datasetBillCount === 1 ? "" : "s"} in
            view
          </span>
          {selectedState ? (
            <button
              type="button"
              className="text-btn"
              onClick={() => setSelectedState(null)}
            >
              Back to Nation data
            </button>
          ) : (
            <span className="dataset-scope__hint">
              Click a state on the map to open gaps
            </span>
          )}
        </div>
      </section>

      {/* Momentum: scope-agnostic (Nation or state) */}
      <MomentumDimensions snapshot={snapshot} allAiBills={aiBills} />

      {/* Timeline: Nation-only */}
      {isNationView && <NationalBillTimeline />}

      {/* Gap: state-scoped only */}
      {selectedState ? (
        <GapDimensions stateCode={selectedState} />
      ) : (
        <GapDimensionsPrompt />
      )}
    </section>
  );
}
