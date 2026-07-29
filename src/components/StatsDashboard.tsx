import type { Bill } from "../types/bill";
import {
  CATEGORY_SHORT,
  LEGISLATIVE_SESSIONS,
  POLICY_CATEGORIES,
  STATE_NAMES,
  computeOverviewStats,
  countByCategory,
  filterByCategory,
  filterBySession,
  formatDisplayDate,
  getTopicsByCategory,
  getTrendingTopics,
  type CategoryFilter,
} from "../lib/stats";
import "../styles/components/StatsDashboard.css";

interface StatsDashboardProps {
  bills: Bill[];
  sessionId: string;
  category: CategoryFilter;
  selectedState: string | null;
  onSessionChange: (sessionId: string) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onClearState: () => void;
}

export function StatsDashboard({
  bills,
  sessionId,
  category,
  selectedState,
  onSessionChange,
  onCategoryChange,
  onClearState,
}: StatsDashboardProps) {
  const sessionBills = filterBySession(bills, sessionId);
  const scopeBills = selectedState
    ? sessionBills.filter((b) => b.state === selectedState)
    : sessionBills;
  const filteredBills = filterByCategory(scopeBills, category);

  const overview = computeOverviewStats(filteredBills, bills);
  const categoryCounts = countByCategory(scopeBills);
  const topicsByCategory = getTopicsByCategory(scopeBills);
  const focusedTopics =
    category === "all"
      ? null
      : getTrendingTopics(
          filteredBills.filter((b) => b.category === category),
          6,
        );

  const sessionLabel =
    LEGISLATIVE_SESSIONS.find((s) => s.id === sessionId)?.label ?? sessionId;
  const scopeLabel = selectedState
    ? (STATE_NAMES[selectedState] ?? selectedState)
    : "Nationwide";
  const scopeNote = selectedState
    ? `${scopeLabel} · ${sessionLabel}`
    : `United States · ${sessionLabel}`;

  const basicStats = [
    {
      label: "Total tracked bills",
      value: overview.totalTracked,
      note:
        category === "all"
          ? scopeNote
          : `${scopeNote} · ${CATEGORY_SHORT[category]}`,
    },
    {
      label: "Active bills",
      value: overview.active,
      note: "Introduced, in committee, or passed",
    },
    {
      label: "Introduced this session",
      value: overview.introducedThisSession,
      note: selectedState
        ? `Filed in ${scopeLabel} this session`
        : "Filed during the selected session",
    },
    {
      label: "Updated in last 7 days",
      value: overview.updatedLast7,
      note: "Recent activity window",
    },
    {
      label: "Updated in last 30 days",
      value: overview.updatedLast30,
      note: "Month-to-date updates",
    },
    {
      label: "Enacted / became law",
      value: overview.enacted,
      note: "Final enactment status",
    },
  ];

  const categoryIntro =
    category === "all"
      ? selectedState
        ? `Popular topics in ${scopeLabel} across each research theme.`
        : "Trending topics nationwide across each research theme for the selected session."
      : selectedState
        ? `Trending topics within ${category} for ${scopeLabel}.`
        : `Trending topics within ${category} nationwide.`;

  return (
    <section
      id="stats-dashboard"
      className="section section--surface stats-dashboard"
      aria-labelledby="stats-heading"
    >
      <div className="container">
        <div className="stats-heading-row">
          <div className="section-heading">
            <h2 id="stats-heading">Overview Statistics</h2>
            <p>
              Nationwide figures load by default. Choose a state on the map
              above to switch this dashboard to state-level detail.
            </p>
          </div>

          <div
            className="scope-badge"
            role="status"
            aria-live="polite"
          >
            <span className="scope-badge__label">Current view</span>
            <span className="scope-badge__value">
              {selectedState ? (
                <>
                  {scopeLabel}{" "}
                  <span className="scope-badge__abbr">({selectedState})</span>
                </>
              ) : (
                "Nationwide"
              )}
            </span>
            {selectedState ? (
              <button
                type="button"
                className="btn btn--secondary scope-badge__action"
                onClick={onClearState}
              >
                Back to nationwide
              </button>
            ) : (
              <span className="scope-badge__hint">
                Click any state tile to focus
              </span>
            )}
          </div>
        </div>

        <div
          className="dashboard-controls"
          role="group"
          aria-label="Dashboard filters"
        >
          <div className="control-group">
            <span className="control-group__label" id="session-label">
              Session
            </span>
            <div
              className="chip-row"
              role="radiogroup"
              aria-labelledby="session-label"
            >
              {LEGISLATIVE_SESSIONS.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  role="radio"
                  aria-checked={sessionId === session.id}
                  className={
                    sessionId === session.id
                      ? "filter-chip is-selected"
                      : "filter-chip"
                  }
                  onClick={() => onSessionChange(session.id)}
                >
                  {session.label}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-group__label" id="category-label">
              Category
            </span>
            <div
              className="chip-row"
              role="radiogroup"
              aria-labelledby="category-label"
            >
              <button
                type="button"
                role="radio"
                aria-checked={category === "all"}
                className={
                  category === "all" ? "filter-chip is-selected" : "filter-chip"
                }
                onClick={() => onCategoryChange("all")}
              >
                All
              </button>
              {POLICY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={category === cat}
                  className={
                    category === cat ? "filter-chip is-selected" : "filter-chip"
                  }
                  onClick={() => onCategoryChange(cat)}
                  title={cat}
                >
                  {CATEGORY_SHORT[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="basic-stats" aria-label={`${scopeLabel} basic statistics`}>
          {basicStats.map((stat) => (
            <article className="stat-panel" key={stat.label}>
              <p className="stat-panel__label">{stat.label}</p>
              <p className="stat-panel__value">{stat.value}</p>
              <p className="stat-panel__note">{stat.note}</p>
            </article>
          ))}
          <article className="stat-panel stat-panel--wide">
            <p className="stat-panel__label">Last database update</p>
            <p className="stat-panel__value stat-panel__value--date">
              {overview.lastDatabaseUpdate
                ? formatDisplayDate(overview.lastDatabaseUpdate)
                : "—"}
            </p>
            <p className="stat-panel__note">
              Latest bill update timestamp in the prototype corpus
            </p>
          </article>
        </div>

        {selectedState && overview.totalTracked === 0 && (
          <p className="empty-scope" role="status">
            No bills match {scopeLabel} for the current session
            {category === "all" ? "" : ` and ${category}`} filters. Try another
            session, category, or{" "}
            <button type="button" className="text-btn" onClick={onClearState}>
              return to nationwide
            </button>
            .
          </p>
        )}

        <div className="category-stats">
          <div className="category-stats__intro">
            <h3 className="panel-title">
              Category-related statistics · {scopeLabel}
            </h3>
            <p>{categoryIntro}</p>
          </div>

          {category === "all" ? (
            <div className="category-topic-grid">
              {POLICY_CATEGORIES.map((cat) => (
                <article className="topic-card" key={cat}>
                  <button
                    type="button"
                    className="topic-card__header"
                    onClick={() => onCategoryChange(cat)}
                  >
                    <span className="topic-card__short">
                      {CATEGORY_SHORT[cat]}
                    </span>
                    <h4>{cat}</h4>
                    <p>
                      {categoryCounts[cat]} bills ·{" "}
                      {scopeBills.length
                        ? Math.round(
                            (categoryCounts[cat] / scopeBills.length) * 100,
                          )
                        : 0}
                      % of {selectedState ? "state" : "session"}
                    </p>
                  </button>
                  <ul className="topic-card__list">
                    {topicsByCategory[cat].length === 0 ? (
                      <li className="is-empty">
                        No topics in this {selectedState ? "state" : "session"}
                      </li>
                    ) : (
                      topicsByCategory[cat].map((topic) => (
                        <li key={topic.topic}>
                          <span>{topic.topic}</span>
                          <span>{topic.count}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <div className="focused-topics">
              <div className="focused-topics__summary">
                <p className="stat-panel__label">{CATEGORY_SHORT[category]}</p>
                <h4>{category}</h4>
                <p>
                  {filteredBills.length} bills · {scopeLabel} · {sessionLabel}
                </p>
              </div>
              <ul className="focused-topics__list">
                {(focusedTopics ?? []).length === 0 ? (
                  <li className="focused-topics__empty">
                    No topic activity for this selection.
                  </li>
                ) : (
                  (focusedTopics ?? []).map((topic, index) => (
                    <li key={topic.topic}>
                      <span className="focused-topics__rank">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="focused-topics__name">{topic.topic}</span>
                      <span className="focused-topics__meta">
                        {topic.count} bills · {topic.share}% of category
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
