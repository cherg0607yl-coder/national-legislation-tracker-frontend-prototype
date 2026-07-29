import { useState } from "react";
import type { Bill } from "../../types/bill";

interface KeyProvisionsProps {
  bill: Bill;
}

export function KeyProvisions({ bill }: KeyProvisionsProps) {
  const provisions = bill.keyProvisions ?? [];
  const [openId, setOpenId] = useState<string | null>(
    provisions[0]?.title ?? null,
  );

  if (provisions.length === 0) {
    return (
      <section className="bill-section" aria-labelledby="provisions-heading">
        <div className="bill-section__intro">
          <h2 id="provisions-heading">Key Provisions</h2>
        </div>
        <p className="bill-callout" role="status">
          Key provision summaries are not yet available for this bill.
        </p>
      </section>
    );
  }

  return (
    <section className="bill-section" aria-labelledby="provisions-heading">
      <div className="bill-section__intro">
        <h2 id="provisions-heading">Key Provisions</h2>
        <p>Major statutory requirements highlighted for quick briefing.</p>
      </div>

      <div className="key-provisions">
        {provisions.map((provision) => {
          const open = openId === provision.title;
          return (
            <article key={provision.title} className="key-provision">
              <h3>
                <button
                  type="button"
                  className="key-provision__trigger"
                  aria-expanded={open}
                  onClick={() =>
                    setOpenId((current) =>
                      current === provision.title ? null : provision.title,
                    )
                  }
                >
                  <span>{provision.title}</span>
                  <span aria-hidden="true">{open ? "−" : "+"}</span>
                </button>
              </h3>
              {open && (
                <div className="key-provision__body">
                  <p>{provision.description}</p>
                  {(provision.sectionReference || provision.sourceUrl) && (
                    <p className="key-provision__meta">
                      {provision.sectionReference && (
                        <span>{provision.sectionReference}</span>
                      )}
                      {provision.sourceUrl && (
                        <a
                          href={provision.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View in bill text ↗
                        </a>
                      )}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
