import { STATE_NAMES } from "../lib/stats";
import "../styles/components/StateTileMap.css";

/** Approximate US tile-grid cartogram — not geographically exact. */
const MAP_ROWS: (string | null)[][] = [
  [null, null, null, null, null, null, null, null, null, null, null, "ME"],
  [null, null, null, null, null, null, null, null, null, "VT", "NH", null],
  ["WA", "ID", "MT", "ND", "MN", "WI", "MI", null, "NY", "MA", null, null],
  ["OR", "NV", "WY", "SD", "IA", "IL", "IN", "OH", "PA", "NJ", "CT", "RI"],
  ["CA", "UT", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "DE", null, null],
  [null, "AZ", "NM", "KS", "AR", "TN", "NC", "SC", null, null, null, null],
  [null, null, null, "OK", "LA", "MS", "AL", "GA", null, null, null, null],
  [null, null, null, "TX", null, null, null, "FL", null, null, null, null],
  ["AK", null, null, null, null, null, null, null, null, null, "HI", null],
];

interface StateTileMapProps {
  statesWithData?: Set<string>;
  selectedState?: string | null;
  /** Multi-select highlight (Policy Design). Takes precedence when provided. */
  selectedStates?: string[];
  hoveredState?: string | null;
  billCounts?: Record<string, number>;
  momentumLevels?: Record<string, 0 | 1 | 2 | 3>;
  caption?: string;
  ariaLabel?: string;
  onStateHover?: (state: string | null) => void;
  onStateSelect?: (state: string) => void;
}

export function StateTileMap({
  statesWithData,
  selectedState,
  selectedStates,
  hoveredState,
  billCounts,
  momentumLevels,
  caption = "Nationwide by default · click a state to focus statistics",
  ariaLabel = "Interactive United States map. Hover or click a state for statistics.",
  onStateHover,
  onStateSelect,
}: StateTileMapProps) {
  function isSelected(abbr: string): boolean {
    if (selectedStates) return selectedStates.includes(abbr);
    return selectedState === abbr;
  }

  return (
    <div className="state-map animate-map" role="group" aria-label={ariaLabel}>
      <div className="state-map__grid">
        {MAP_ROWS.map((row, rowIndex) => (
          <div className="state-map__row" key={rowIndex}>
            {row.map((abbr, colIndex) =>
              abbr ? (
                <button
                  type="button"
                  key={abbr}
                  className={[
                    "state-tile",
                    statesWithData?.has(abbr) ? "has-data" : "",
                    momentumLevels?.[abbr]
                      ? `momentum-${momentumLevels[abbr]}`
                      : "",
                    isSelected(abbr) ? "is-selected" : "",
                    hoveredState === abbr ? "is-hovered" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    animationDelay: `${(rowIndex * 12 + colIndex) * 8}ms`,
                  }}
                  aria-pressed={isSelected(abbr)}
                  aria-label={`${STATE_NAMES[abbr] ?? abbr}${
                    billCounts?.[abbr]
                      ? `, ${billCounts[abbr]} tracked bills`
                      : ", no bills in current filters"
                  }`}
                  title={`${STATE_NAMES[abbr] ?? abbr}${
                    billCounts?.[abbr] ? ` · ${billCounts[abbr]} bills` : ""
                  }`}
                  onMouseEnter={() => onStateHover?.(abbr)}
                  onMouseLeave={() => onStateHover?.(null)}
                  onFocus={() => onStateHover?.(abbr)}
                  onBlur={() => onStateHover?.(null)}
                  onClick={() => onStateSelect?.(abbr)}
                >
                  <span>{abbr}</span>
                </button>
              ) : (
                <span
                  className="state-tile state-tile--spacer"
                  key={`s-${rowIndex}-${colIndex}`}
                  aria-hidden="true"
                />
              ),
            )}
          </div>
        ))}
      </div>
      <p className="state-map__caption">{caption}</p>
    </div>
  );
}
