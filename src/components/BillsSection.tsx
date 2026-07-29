import type { Bill } from "../types/bill";
import { BillCard } from "./BillCard";
import { Link } from "react-router-dom";
import "../styles/components/BillsSection.css";

interface BillsSectionProps {
  recentBills: Bill[];
  trendingBills: Bill[];
  scopeLabel?: string;
}

export function BillsSection({
  recentBills,
  trendingBills,
  scopeLabel = "Nationwide",
}: BillsSectionProps) {
  const isEmpty = recentBills.length === 0 && trendingBills.length === 0;

  return (
    <section className="section section--surface" aria-labelledby="bills-heading">
      <div className="container">
        <div className="section-heading bills-heading-row">
          <div>
            <h2 id="bills-heading">Recent & Trending Bills</h2>
            <p>
              Showing {scopeLabel.toLowerCase()} results from the current
              session and category filters.
            </p>
          </div>
          <Link to="/search" className="btn btn--secondary">
            View all bills
          </Link>
        </div>

        {isEmpty ? (
          <p className="bills-empty">
            No recent or trending bills match this selection.
          </p>
        ) : (
          <div className="bills-columns">
            <div className="bills-column">
              <h3 className="bills-column__title">Recently updated</h3>
              <div className="bills-list">
                {recentBills.length === 0 ? (
                  <p className="bills-empty">No recent updates.</p>
                ) : (
                  recentBills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} />
                  ))
                )}
              </div>
            </div>

            <div className="bills-column">
              <h3 className="bills-column__title">Trending now</h3>
              <div className="bills-list">
                {trendingBills.length === 0 ? (
                  <p className="bills-empty">No trending bills.</p>
                ) : (
                  trendingBills.map((bill) => (
                    <BillCard key={`trend-${bill.id}`} bill={bill} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
