import { useMemo, useState } from "react";
import { LEGISLATIVE_SESSIONS } from "../../lib/stats";
import { timelineEventsForSession } from "../../data/nationalBillTimeline";
import { formatDisplayDate } from "../../lib/stats";

export function NationalBillTimeline() {
  const [sessionId, setSessionId] = useState(
    LEGISLATIVE_SESSIONS[0]?.id ?? "2025-2026",
  );

  const events = useMemo(
    () => timelineEventsForSession(sessionId),
    [sessionId],
  );

  const sessionLabel =
    LEGISLATIVE_SESSIONS.find((s) => s.id === sessionId)?.label ?? sessionId;

  return (
    <section
      className="nation-timeline"
      aria-labelledby="nation-timeline-heading"
    >
      <div className="nation-timeline__head">
        <div>
          <p className="nation-timeline__eyebrow">Nationwide only</p>
          <h2 id="nation-timeline-heading">Important bill updates</h2>
          <p className="activity-panel__lead">
            A session-filtered timeline of notable U.S. AI legislation milestones
            and follow-on guidance. Prototype mock feed for Nation view.
          </p>
        </div>
        <label className="activity-panel__session-select">
          <span>Session</span>
          <select
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
          >
            {LEGISLATIVE_SESSIONS.map((session) => (
              <option key={session.id} value={session.id}>
                {session.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {events.length === 0 ? (
        <p className="nation-timeline__empty">
          No milestone updates recorded for {sessionLabel} yet.
        </p>
      ) : (
        <ol className="nation-timeline__list">
          {events.map((event) => (
            <li key={event.id} className="nation-timeline__item">
              <div className="nation-timeline__rail" aria-hidden="true">
                <span className="nation-timeline__dot" />
              </div>
              <article className="nation-timeline__card">
                <header className="nation-timeline__meta">
                  <time dateTime={event.date}>
                    {formatDisplayDate(event.date)}
                  </time>
                  <span
                    className={`nation-timeline__type nation-timeline__type--${event.updateType
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {event.updateType}
                  </span>
                  <span className="nation-timeline__place">
                    {event.state}
                    {event.billNumber !== "—" ? ` · ${event.billNumber}` : ""}
                  </span>
                </header>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
