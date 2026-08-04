import { useEffect, useId, useRef, useState } from "react";

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  /** Share of the whole, 0–100. */
  share: number;
}

interface AccessibleDonutChartProps {
  title: string;
  description?: string;
  data: DonutSlice[];
  unit?: string;
  centerLabel?: string;
  centerValue?: string;
  emptyMessage?: string;
}

/** High-contrast categorical palette (distinct hues, not teal-only). */
const DONUT_PALETTE = [
  "#0d7377",
  "#c45c26",
  "#1b4f72",
  "#b8860b",
  "#6c3483",
  "#117a65",
  "#922b21",
  "#1a5276",
  "#9a7d0a",
  "#5d6d7e",
  "#196f3d",
  "#a04000",
  "#154360",
  "#7d3c98",
  "#0e6655",
  "#943126",
  "#2874a6",
  "#9c640c",
  "#4a235a",
  "#1e8449",
  "#cb4335",
  "#21618c",
  "#b7950b",
  "#566573",
  "#145a32",
];

const HIGHLIGHT_MS = 2800;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function donutSegmentPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= 0.01) return "";
  const clampedEnd = sweep >= 359.99 ? startAngle + 359.99 : endAngle;
  const large = clampedEnd - startAngle > 180 ? 1 : 0;
  const o1 = polar(cx, cy, outerR, startAngle);
  const o2 = polar(cx, cy, outerR, clampedEnd);
  const i1 = polar(cx, cy, innerR, clampedEnd);
  const i2 = polar(cx, cy, innerR, startAngle);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

/**
 * Percentage donut chart with an accessible legend.
 * Color + pattern + labels; clicking a slice highlights its legend row.
 */
export function AccessibleDonutChart({
  title,
  description,
  data,
  unit = "bills",
  centerLabel,
  centerValue,
  emptyMessage = "No domain data for this session.",
}: AccessibleDonutChartProps) {
  const reactId = useId();
  const chartId = `donut-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const patternPrefix = `donut-pat-${reactId.replace(/:/g, "")}`;
  const slices = data.filter((d) => d.value > 0);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const legendRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  function highlightDomain(id: string, label: string, value: number, share: number) {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedId(id);
    setAnnounce(`${label}: ${value} ${unit}, ${share} percent. Legend highlighted.`);
    const row = legendRefs.current.get(id);
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    highlightTimer.current = setTimeout(() => {
      setHighlightedId(null);
      setAnnounce("");
    }, HIGHLIGHT_MS);
  }

  if (slices.length === 0) {
    return <p className="a11y-chart__empty">{emptyMessage}</p>;
  }

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 96;
  const innerR = 58;

  let angle = 0;
  const totalValue = slices.reduce((sum, s) => sum + s.value, 0);
  const paths = slices.map((slice, index) => {
    const sweep = (slice.value / totalValue) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return {
      slice,
      path: donutSegmentPath(cx, cy, outerR, innerR, start, end),
      color: DONUT_PALETTE[index % DONUT_PALETTE.length],
      patternIndex: index % 5,
    };
  });

  return (
    <figure
      className="a11y-donut"
      aria-labelledby={`${chartId}-title`}
      aria-describedby={
        description ? `${chartId}-desc ${chartId}-hint` : `${chartId}-hint`
      }
    >
      <figcaption>
        <span id={`${chartId}-title`} className="a11y-chart__title">
          {title}
        </span>
        {description && (
          <span id={`${chartId}-desc`} className="a11y-chart__desc">
            {description}
          </span>
        )}
        <span id={`${chartId}-hint`} className="a11y-donut__hint">
          Click a domain slice to highlight its legend entry. Colors and
          patterns differ by domain; each legend row also lists count and share.
        </span>
      </figcaption>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </div>

      <div className="a11y-donut__visual">
        <svg
          className="a11y-donut__svg"
          viewBox={`0 0 ${size} ${size}`}
          role="group"
          aria-label={`${title}. Select a domain slice to highlight its legend row.`}
        >
          <defs>
            {paths.map(({ color, patternIndex }, index) => {
              const id = `${patternPrefix}-${index}`;
              if (patternIndex === 0) {
                return (
                  <pattern
                    key={id}
                    id={id}
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="6" height="6" fill={color} />
                    <path
                      d="M0 6 L6 0"
                      stroke="#fff"
                      strokeWidth="1.2"
                      strokeOpacity="0.45"
                    />
                  </pattern>
                );
              }
              if (patternIndex === 1) {
                return (
                  <pattern
                    key={id}
                    id={id}
                    width="5"
                    height="5"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="5" height="5" fill={color} />
                    <circle cx="1.5" cy="1.5" r="1" fill="#fff" fillOpacity="0.4" />
                  </pattern>
                );
              }
              if (patternIndex === 2) {
                return (
                  <pattern
                    key={id}
                    id={id}
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(90)"
                  >
                    <rect width="6" height="6" fill={color} />
                    <path
                      d="M0 6 L6 0"
                      stroke="#fff"
                      strokeWidth="1.2"
                      strokeOpacity="0.4"
                    />
                  </pattern>
                );
              }
              if (patternIndex === 3) {
                return (
                  <pattern
                    key={id}
                    id={id}
                    width="7"
                    height="7"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="7" height="7" fill={color} />
                    <path
                      d="M0 3.5 H7 M3.5 0 V7"
                      stroke="#fff"
                      strokeWidth="1"
                      strokeOpacity="0.35"
                    />
                  </pattern>
                );
              }
              return (
                <pattern
                  key={id}
                  id={id}
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="6" height="6" fill={color} />
                  <path
                    d="M0 0 L6 6 M6 0 L0 6"
                    stroke="#fff"
                    strokeWidth="0.9"
                    strokeOpacity="0.35"
                  />
                </pattern>
              );
            })}
          </defs>

          {paths.map(({ slice, path }, index) => {
            const isActive = highlightedId === slice.id;
            const isDimmed = highlightedId !== null && !isActive;
            return (
              <path
                key={slice.id}
                d={path}
                fill={`url(#${patternPrefix}-${index})`}
                stroke={isActive ? "var(--color-text-brand)" : "var(--color-bg-surface)"}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={
                  isActive
                    ? "a11y-donut__slice a11y-donut__slice--active"
                    : isDimmed
                      ? "a11y-donut__slice a11y-donut__slice--dimmed"
                      : "a11y-donut__slice"
                }
                tabIndex={0}
                role="button"
                aria-label={`${slice.label}: ${slice.value} ${unit}, ${slice.share}%. Activate to highlight legend.`}
                aria-pressed={isActive}
                onClick={() =>
                  highlightDomain(
                    slice.id,
                    slice.label,
                    slice.value,
                    slice.share,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    highlightDomain(
                      slice.id,
                      slice.label,
                      slice.value,
                      slice.share,
                    );
                  }
                }}
              >
                <title>
                  {slice.label}: {slice.value} {unit} ({slice.share}%)
                </title>
              </path>
            );
          })}
          {(centerValue || centerLabel) && (
            <>
              {centerValue && (
                <text
                  x={cx}
                  y={centerLabel ? cy - 6 : cy + 4}
                  textAnchor="middle"
                  className="a11y-donut__center-value"
                >
                  {centerValue}
                </text>
              )}
              {centerLabel && (
                <text
                  x={cx}
                  y={centerValue ? cy + 14 : cy + 4}
                  textAnchor="middle"
                  className="a11y-donut__center-label"
                >
                  {centerLabel}
                </text>
              )}
            </>
          )}
        </svg>

        <ul className="a11y-donut__legend" role="list">
          {paths.map(({ slice, color, patternIndex }) => {
            const isActive = highlightedId === slice.id;
            return (
              <li
                key={slice.id}
                ref={(node) => {
                  if (node) legendRefs.current.set(slice.id, node);
                  else legendRefs.current.delete(slice.id);
                }}
                className={
                  isActive
                    ? "a11y-donut__legend-item a11y-donut__legend-item--active"
                    : "a11y-donut__legend-item"
                }
              >
                <button
                  type="button"
                  className="a11y-donut__legend-btn"
                  aria-pressed={isActive}
                  onClick={() =>
                    highlightDomain(
                      slice.id,
                      slice.label,
                      slice.value,
                      slice.share,
                    )
                  }
                >
                  <span
                    className={`a11y-donut__swatch a11y-donut__swatch--p${patternIndex}`}
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="a11y-donut__legend-label">{slice.label}</span>
                  <span className="a11y-donut__legend-meta">
                    {slice.value} · {slice.share}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}
