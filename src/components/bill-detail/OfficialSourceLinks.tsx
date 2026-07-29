import type { Bill } from "../../types/bill";
import { getOfficialUrl } from "../../lib/bills";

interface OfficialSourceLinksProps {
  bill: Bill;
}

const LINK_LABELS: { key: keyof NonNullable<Bill["additionalLinks"]>; label: string }[] = [
  { key: "fullText", label: "Full bill text" },
  { key: "latestVersion", label: "Latest version" },
  { key: "fiscalNote", label: "Fiscal note" },
  { key: "amendments", label: "Amendments" },
  { key: "votingHistory", label: "Voting history" },
];

export function OfficialSourceLinks({ bill }: OfficialSourceLinksProps) {
  const officialUrl = getOfficialUrl(bill);
  const links = bill.additionalLinks;
  const available = LINK_LABELS.filter(({ key }) => links?.[key]);

  return (
    <div className="official-links">
      <a
        className="btn btn--primary official-links__primary"
        href={officialUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Official Legislature Website
        <span aria-hidden="true">↗</span>
      </a>

      {available.length > 0 && (
        <ul className="official-links__extra">
          {available.map(({ key, label }) => (
            <li key={key}>
              <a
                href={links?.[key]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
