import { Link } from "react-router-dom";
import { StateTileMap } from "./StateTileMap";
import { STATE_NAMES } from "../lib/stats";
import "../styles/components/Hero.css";

interface HeroProps {
  statesWithData: Set<string>;
  billCounts: Record<string, number>;
  selectedState: string | null;
  hoveredState: string | null;
  onStateHover: (state: string | null) => void;
  onStateSelect: (state: string) => void;
  onClearState: () => void;
}

export function Hero({
  statesWithData,
  billCounts,
  selectedState,
  hoveredState,
  onStateHover,
  onStateSelect,
  onClearState,
}: HeroProps) {
  const preview = hoveredState ?? selectedState;
  const previewCount = preview ? (billCounts[preview] ?? 0) : null;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__content animate-fade-up">
          <h1 id="hero-title">National Legislation Tracker</h1>
          <p className="hero__subtitle">
            Explore and compare state legislation across the United States
            through a centralized, searchable policy database.
          </p>
          <div className="btn-row">
            <a href="#stats-dashboard" className="btn btn--primary">
              View Statistics
            </a>
            <Link to="/search" className="btn btn--secondary">
              Explore Bills
            </Link>
            <Link to="/about" className="btn btn--secondary">
              Learn About the Project
            </Link>
          </div>
          {selectedState ? (
            <p className="hero__scope" role="status">
              Viewing{" "}
              <strong>
                {STATE_NAMES[selectedState] ?? selectedState}
              </strong>
              .{" "}
              <button type="button" className="text-btn" onClick={onClearState}>
                Show nationwide
              </button>
            </p>
          ) : (
            <p className="hero__scope hero__scope--hint">
              Click a state on the map to focus statistics. Nationwide view is
              shown by default.
            </p>
          )}
        </div>

        <div className="hero__map animate-fade-up-delay">
          <StateTileMap
            statesWithData={statesWithData}
            selectedState={selectedState}
            hoveredState={hoveredState}
            billCounts={billCounts}
            onStateHover={onStateHover}
            onStateSelect={onStateSelect}
          />
          <p
            className={
              preview
                ? "hero__map-preview"
                : "hero__map-preview hero__map-preview--idle"
            }
            aria-live="polite"
          >
            {preview ? (
              <>
                <span className="hero__map-preview-state">
                  {STATE_NAMES[preview] ?? preview}
                </span>
                <span>
                  {previewCount === 0
                    ? "No bills in current filters"
                    : `${previewCount} bill${previewCount === 1 ? "" : "s"} in current filters`}
                  {hoveredState && !selectedState
                    ? " · click to focus"
                    : selectedState === preview
                      ? " · selected"
                      : ""}
                </span>
              </>
            ) : (
              <span>Hover a state for a quick preview</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
