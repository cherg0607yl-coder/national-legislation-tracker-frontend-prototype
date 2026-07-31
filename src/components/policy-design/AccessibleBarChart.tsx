export interface BarDatum {
  id: string;
  label: string;
  value: number;
  /** Optional short annotation shown after the value. */
  note?: string;
}

interface AccessibleBarChartProps {
  title: string;
  description?: string;
  data: BarDatum[];
  /** Unit label for screen readers and captions, e.g. "bills". */
  unit?: string;
  maxValue?: number;
  /** Compact mode for hover previews. */
  compact?: boolean;
  emptyMessage?: string;
}

/**
 * Horizontal bar chart with visible labels/values and a text data table
 * for screen-reader users. Does not rely on color alone.
 */
export function AccessibleBarChart({
  title,
  description,
  data,
  unit = "bills",
  maxValue,
  compact = false,
  emptyMessage = "No data available for this chart.",
}: AccessibleBarChartProps) {
  const chartId = `chart-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));
  const sorted = [...data].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  if (sorted.length === 0) {
    return <p className="a11y-chart__empty">{emptyMessage}</p>;
  }

  return (
    <figure
      className={compact ? "a11y-chart a11y-chart--compact" : "a11y-chart"}
      aria-labelledby={`${chartId}-title`}
      aria-describedby={description ? `${chartId}-desc` : undefined}
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
      </figcaption>

      <ul className="a11y-chart__bars" role="list">
        {sorted.map((item, index) => {
          const widthPct = Math.max(4, Math.round((item.value / max) * 100));
          return (
            <li key={item.id} className="a11y-chart__row">
              <div className="a11y-chart__label-row">
                <span className="a11y-chart__rank" aria-hidden="true">
                  {index + 1}.
                </span>
                <span className="a11y-chart__label">{item.label}</span>
                <span className="a11y-chart__value">
                  {item.value}
                  <span className="sr-only">
                    {" "}
                    {unit}
                    {item.note ? `, ${item.note}` : ""}
                  </span>
                  {item.note && (
                    <span className="a11y-chart__note" aria-hidden="true">
                      {" "}
                      · {item.note}
                    </span>
                  )}
                </span>
              </div>
              <div
                className="a11y-chart__track"
                role="img"
                aria-label={`${item.label}: ${item.value} ${unit}`}
              >
                <div
                  className="a11y-chart__fill"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <details className="a11y-chart__table-wrap">
        <summary>View data table</summary>
        <table className="a11y-chart__table">
          <caption className="sr-only">
            {title}
            {description ? ` — ${description}` : ""}
          </caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id}>
                <th scope="row">{item.label}</th>
                <td>
                  {item.value}
                  {item.note ? ` (${item.note})` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

interface GroupedBarSeries {
  state: string;
  stateName: string;
  value: number;
}

export interface GroupedBarTopic {
  topic: string;
  series: GroupedBarSeries[];
}

interface GroupedCompareChartProps {
  title: string;
  description?: string;
  topics: GroupedBarTopic[];
  unit?: string;
}

/** Side-by-side topic comparison across selected states. */
export function GroupedCompareChart({
  title,
  description,
  topics,
  unit = "bills",
}: GroupedCompareChartProps) {
  const chartId = "grouped-topic-compare";
  const max = Math.max(
    1,
    ...topics.flatMap((t) => t.series.map((s) => s.value)),
  );
  const stateOrder = topics[0]?.series.map((s) => s.state) ?? [];

  if (topics.length === 0) {
    return (
      <p className="a11y-chart__empty">
        Select states to compare topic focus side by side.
      </p>
    );
  }

  return (
    <figure
      className="a11y-chart a11y-chart--grouped"
      aria-labelledby={`${chartId}-title`}
      aria-describedby={description ? `${chartId}-desc` : undefined}
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
      </figcaption>

      <ul className="a11y-chart__grouped-list" role="list">
        {topics.map((topic) => (
          <li key={topic.topic} className="a11y-chart__grouped-topic">
            <p className="a11y-chart__grouped-label">{topic.topic}</p>
            <ul className="a11y-chart__grouped-bars" role="list">
              {topic.series.map((series, index) => {
                const widthPct = Math.max(
                  series.value > 0 ? 6 : 0,
                  Math.round((series.value / max) * 100),
                );
                return (
                  <li
                    key={series.state}
                    className={`a11y-chart__grouped-row series-${index}`}
                  >
                    <span className="a11y-chart__grouped-state">
                      {series.state}
                    </span>
                    <div
                      className="a11y-chart__track"
                      role="img"
                      aria-label={`${series.stateName}, ${topic.topic}: ${series.value} ${unit}`}
                    >
                      <div
                        className="a11y-chart__fill"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="a11y-chart__grouped-value">
                      {series.value}
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className="a11y-chart__series-legend" aria-hidden="true">
        {stateOrder.map((code, index) => {
          const name =
            topics[0]?.series.find((s) => s.state === code)?.stateName ?? code;
          return (
            <span key={code} className={`series-${index}`}>
              <i />
              {name}
            </span>
          );
        })}
      </div>

      <details className="a11y-chart__table-wrap">
        <summary>View comparison data table</summary>
        <table className="a11y-chart__table">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr>
              <th scope="col">Topic</th>
              {topics[0]?.series.map((s) => (
                <th key={s.state} scope="col">
                  {s.stateName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.topic}>
                <th scope="row">{topic.topic}</th>
                {topic.series.map((s) => (
                  <td key={s.state}>{s.value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
