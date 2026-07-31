import { Link } from "react-router-dom";
import type { StateAiProfile } from "../../lib/policyDesign";
import { statusBreakdown } from "../../lib/policyDesign";
import { AccessibleBarChart } from "./AccessibleBarChart";

interface StateComparePanelProps {
  profile: StateAiProfile;
  onRemove: () => void;
}

const BILL_PREVIEW_LIMIT = 5;

export function StateComparePanel({
  profile,
  onRemove,
}: StateComparePanelProps) {
  const topicBars = profile.trendingTopics.map((topic) => ({
    id: topic.topic,
    label: topic.topic,
    value: topic.count,
    note: `${topic.share}%`,
  }));

  const statusBars = statusBreakdown(profile.bills).map((row) => ({
    id: row.status,
    label: row.status,
    value: row.count,
  }));

  const previewBills = profile.bills.slice(0, BILL_PREVIEW_LIMIT);
  const hiddenBillCount = Math.max(0, profile.bills.length - previewBills.length);

  return (
    <article
      className="state-compare-panel"
      aria-labelledby={`compare-${profile.state}-title`}
    >
      <header className="state-compare-panel__header">
        <div>
          <p className="state-compare-panel__code">{profile.state}</p>
          <h3 id={`compare-${profile.state}-title`}>{profile.stateName}</h3>
        </div>
        <button
          type="button"
          className="text-btn"
          onClick={onRemove}
          aria-label={`Remove ${profile.stateName} from comparison`}
        >
          Remove
        </button>
      </header>

      <div className="state-compare-panel__stats" aria-label="AI momentum stats">
        <div>
          <span className="state-compare-panel__stat-value">
            {profile.billCount}
          </span>
          <span className="state-compare-panel__stat-label">AI bills</span>
        </div>
        <div>
          <span className="state-compare-panel__stat-value">
            {profile.activeCount}
          </span>
          <span className="state-compare-panel__stat-label">Active</span>
        </div>
        <div>
          <span className="state-compare-panel__stat-value">
            {profile.enactedCount}
          </span>
          <span className="state-compare-panel__stat-label">Enacted</span>
        </div>
      </div>

      <p className="state-compare-panel__summary">{profile.summary}</p>

      <section
        className="state-compare-panel__block"
        aria-labelledby={`compare-${profile.state}-focus-chart`}
      >
        <h4 id={`compare-${profile.state}-focus-chart`} className="sr-only">
          Topic focus chart for {profile.stateName}
        </h4>
        <AccessibleBarChart
          title="Current topic focus"
          description={`Top AI topics in ${profile.stateName}, ranked by bill count. Bar length and numeric values both encode volume.`}
          data={topicBars}
          unit="bills"
          emptyMessage="No AI topic focus to chart for this state."
        />
      </section>

      <section
        className="state-compare-panel__block"
        aria-labelledby={`compare-${profile.state}-status-chart`}
      >
        <h4 id={`compare-${profile.state}-status-chart`} className="sr-only">
          Legislative status chart for {profile.stateName}
        </h4>
        <AccessibleBarChart
          title="Legislative status mix"
          description="Where this state’s AI bills currently sit in the process."
          data={statusBars}
          unit="bills"
          emptyMessage="No status data available."
        />
      </section>

      <section
        className="state-compare-panel__block"
        aria-labelledby={`compare-${profile.state}-emphasis`}
      >
        <h4 id={`compare-${profile.state}-emphasis`}>
          What {profile.stateName} emphasizes
        </h4>
        {profile.distinctive.length === 0 ? (
          <p className="state-compare-panel__empty">
            No distinctive AI topic focus yet in the prototype dataset.
          </p>
        ) : (
          <ul className="state-compare-panel__list">
            {profile.distinctive.slice(0, 3).map((item) => (
              <li key={item.topic}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <span className="state-compare-panel__note">
                  {item.rarityNote}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="state-compare-panel__block"
        aria-labelledby={`compare-${profile.state}-gaps`}
      >
        <h4 id={`compare-${profile.state}-gaps`}>
          Policy gaps in {profile.stateName}
        </h4>
        {profile.gaps.length === 0 ? (
          <p className="state-compare-panel__empty">
            No clear topic gaps identified against the current AI corpus.
          </p>
        ) : (
          <ul className="state-compare-panel__gaps">
            {profile.gaps.map((gap) => (
              <li key={gap.topic}>
                <strong>{gap.topic}</strong>
                <p>{gap.description}</p>
                {gap.exampleBills.length > 0 && (
                  <div className="state-compare-panel__examples">
                    <p className="state-compare-panel__examples-label">
                      Bills from other states that could fill this gap
                    </p>
                    <ul>
                      {gap.exampleBills.map((bill) => (
                        <li key={bill.id}>
                          <Link to={`/bills/${bill.id}`}>
                            {bill.stateName} {bill.billNumber}: {bill.title}
                          </Link>
                          <span>{bill.summary}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {profile.bills.length > 0 && (
        <section
          className="state-compare-panel__block"
          aria-labelledby={`compare-${profile.state}-bills`}
        >
          <h4 id={`compare-${profile.state}-bills`}>Tracked AI bills</h4>
          <ul className="state-compare-panel__bills">
            {previewBills.map((bill) => (
              <li key={bill.id}>
                <Link to={`/bills/${bill.id}`}>
                  {bill.billNumber} · {bill.title}
                </Link>
                <span className="tag tag--topic">{bill.subcategory}</span>
              </li>
            ))}
          </ul>
          {hiddenBillCount > 0 && (
            <p className="state-compare-panel__more">
              <Link
                to={`/search?category=${encodeURIComponent("Artificial Intelligence")}&state=${profile.state}`}
              >
                View all {profile.billCount} AI bills for {profile.stateName}
              </Link>
            </p>
          )}
        </section>
      )}
    </article>
  );
}
