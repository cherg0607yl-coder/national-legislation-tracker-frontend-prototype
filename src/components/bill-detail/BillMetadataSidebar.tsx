import type { Bill } from "../../types/bill";
import {
  billSessionLabel,
  billStateLabel,
  displayStatus,
  formatOptionalDate,
  getEffectiveDateLabel,
} from "../../lib/bills";
import { OfficialSourceLinks } from "./OfficialSourceLinks";
import { SponsorList } from "./SponsorList";

interface BillMetadataSidebarProps {
  bill: Bill;
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="bill-meta-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function BillMetadataSidebar({ bill }: BillMetadataSidebarProps) {
  const committees = bill.committees?.filter(Boolean) ?? [];
  const versions = bill.documents ?? [];
  const status = displayStatus(bill);

  return (
    <aside className="bill-sidebar" aria-label="Bill metadata">
      <section className="bill-sidebar__block">
        <h2>Status</h2>
        <p className="bill-sidebar__status">{status}</p>
        <dl className="bill-meta-list">
          <MetaRow label="State" value={billStateLabel(bill)} />
          <MetaRow label="Session" value={billSessionLabel(bill)} />
          <MetaRow label="Chamber" value={bill.chamber} />
          <MetaRow
            label="Introduced"
            value={formatOptionalDate(bill.introducedDate)}
          />
          <MetaRow
            label="Latest action"
            value={formatOptionalDate(
              bill.latestActionDate ?? bill.lastUpdated,
            )}
          />
          <MetaRow label="Effective date" value={getEffectiveDateLabel(bill)} />
        </dl>
      </section>

      <section className="bill-sidebar__block">
        <h2>Sponsors</h2>
        <SponsorList sponsors={bill.sponsors} />
      </section>

      {committees.length > 0 && (
        <section className="bill-sidebar__block">
          <h2>Committees</h2>
          <ul className="bill-sidebar__list">
            {committees.map((committee) => (
              <li key={committee}>{committee}</li>
            ))}
          </ul>
        </section>
      )}

      {versions.length > 0 && (
        <section className="bill-sidebar__block">
          <h2>Bill versions</h2>
          <ul className="bill-sidebar__versions">
            {versions.map((doc) => (
              <li key={`${doc.name}-${doc.url}`}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {doc.name}
                </a>
                {(doc.date || doc.type) && (
                  <span>
                    {[doc.type, formatOptionalDate(doc.date)]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bill-sidebar__block">
        <h2>Official links</h2>
        <OfficialSourceLinks bill={bill} />
      </section>
    </aside>
  );
}
