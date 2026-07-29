import type { Bill } from "../../types/bill";
import {
  billSessionLabel,
  billStateLabel,
  displayStatus,
  formatOptionalDate,
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

  return (
    <aside className="bill-sidebar" aria-label="Bill information">
      <section className="bill-sidebar__block">
        <h2>Bill information</h2>
        <dl className="bill-meta-list">
          <MetaRow label="State" value={billStateLabel(bill)} />
          <MetaRow label="Bill number" value={bill.billNumber} />
          <MetaRow label="Legislative session" value={billSessionLabel(bill)} />
          <MetaRow label="Chamber" value={bill.chamber} />
          <MetaRow label="Bill type" value={bill.billType} />
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
          <MetaRow label="Current status" value={displayStatus(bill)} />
          <MetaRow label="Policy category" value={bill.category} />
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

      <section className="bill-sidebar__block">
        <h2>Official source</h2>
        <OfficialSourceLinks bill={bill} />
      </section>
    </aside>
  );
}
