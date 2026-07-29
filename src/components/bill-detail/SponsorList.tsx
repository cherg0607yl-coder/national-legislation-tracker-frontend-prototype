import { useState } from "react";
import type { BillSponsor } from "../../types/bill";
import { cosponsors, primarySponsors, sponsorInitials } from "../../lib/bills";

interface SponsorListProps {
  sponsors: BillSponsor[];
  initiallyVisible?: number;
}

function SponsorRow({ sponsor }: { sponsor: BillSponsor }) {
  const meta = [sponsor.party, sponsor.district].filter(Boolean).join(" · ");

  return (
    <li className="sponsor-list__item">
      <span className="sponsor-list__avatar" aria-hidden="true">
        {sponsorInitials(sponsor.name)}
      </span>
      <div>
        <p className="sponsor-list__name">{sponsor.name}</p>
        <p className="sponsor-list__meta">
          {sponsor.role === "primary" ? "Primary sponsor" : "Co-sponsor"}
          {meta ? ` · ${meta}` : ""}
        </p>
      </div>
    </li>
  );
}

export function SponsorList({
  sponsors,
  initiallyVisible = 3,
}: SponsorListProps) {
  const [expanded, setExpanded] = useState(false);
  const primary = primarySponsors(sponsors);
  const co = cosponsors(sponsors);
  const hiddenCount = Math.max(0, co.length - initiallyVisible);
  const visibleCo = expanded ? co : co.slice(0, initiallyVisible);

  if (sponsors.length === 0) {
    return (
      <p className="bill-side__empty">Sponsor information is not available.</p>
    );
  }

  return (
    <div className="sponsor-list">
      <ul>
        {primary.map((sponsor) => (
          <SponsorRow key={`p-${sponsor.name}`} sponsor={sponsor} />
        ))}
        {visibleCo.map((sponsor) => (
          <SponsorRow key={`c-${sponsor.name}`} sponsor={sponsor} />
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          className="text-btn"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
        >
          {expanded ? "Show fewer sponsors" : "View all sponsors"}
        </button>
      )}
    </div>
  );
}
