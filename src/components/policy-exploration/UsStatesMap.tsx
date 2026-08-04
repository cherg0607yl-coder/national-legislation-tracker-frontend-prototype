import mapData from "../../data/us-state-paths.json";
import { STATE_NAMES } from "../../lib/stats";
import "../../styles/components/UsStatesMap.css";

interface StatePath {
  id: string;
  d: string;
  cx: number;
  cy: number;
}

interface UsStatesMapProps {
  billCounts?: Record<string, number>;
  momentumLevels?: Record<string, 0 | 1 | 2 | 3>;
  selectedState?: string | null;
  hoveredState?: string | null;
  onStateHover?: (state: string | null) => void;
  onStateSelect?: (state: string) => void;
}

/** Small northeastern states benefit from label offsets. */
const LABEL_OFFSET: Record<string, { dx: number; dy: number }> = {
  RI: { dx: 22, dy: 6 },
  DE: { dx: 18, dy: 2 },
  CT: { dx: 14, dy: 10 },
  NJ: { dx: 16, dy: 2 },
  MD: { dx: 18, dy: 8 },
  MA: { dx: 16, dy: -2 },
  VT: { dx: -2, dy: -6 },
  NH: { dx: 10, dy: -4 },
  HI: { dx: 0, dy: 4 },
  DC: { dx: 18, dy: 8 },
};

export function UsStatesMap({
  billCounts,
  momentumLevels,
  selectedState,
  hoveredState,
  onStateHover,
  onStateSelect,
}: UsStatesMapProps) {
  const states = mapData.states as StatePath[];

  return (
    <div className="us-map" role="group" aria-label="United States map">
      <svg
        className="us-map__svg"
        viewBox={`0 0 ${mapData.width} ${mapData.height}`}
        role="img"
        aria-label="Interactive map of U.S. states. Select a state to view its AI policy stats, or keep nationwide selected."
      >
        <title>United States AI legislation map</title>
        {states.map((state) => {
          const level = momentumLevels?.[state.id] ?? 0;
          const count = billCounts?.[state.id] ?? 0;
          const isSelected = selectedState === state.id;
          const isHovered = hoveredState === state.id;
          const name = STATE_NAMES[state.id] ?? state.id;
          const offset = LABEL_OFFSET[state.id] ?? { dx: 0, dy: 0 };

          return (
            <g key={state.id} className="us-map__state-group">
              <path
                d={state.d}
                className={[
                  "us-map__state",
                  level ? `us-map__state--m${level}` : "",
                  isSelected ? "is-selected" : "",
                  isHovered ? "is-hovered" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${name}${count ? `, ${count} AI bills` : ", no AI bills tracked"}`}
                onMouseEnter={() => onStateHover?.(state.id)}
                onMouseLeave={() => onStateHover?.(null)}
                onFocus={() => onStateHover?.(state.id)}
                onBlur={() => onStateHover?.(null)}
                onClick={() => onStateSelect?.(state.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onStateSelect?.(state.id);
                  }
                }}
              />
              <text
                className="us-map__label"
                x={state.cx + offset.dx}
                y={state.cy + offset.dy}
                dy="0.35em"
                aria-hidden="true"
              >
                {state.id}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="us-map__caption">
        Nationwide stats by default · click a state to focus · click again to
        return nationwide
      </p>
    </div>
  );
}
