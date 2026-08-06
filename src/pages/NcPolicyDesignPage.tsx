import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import mockData from "../../data/mock-bills.json";
import type { Bill, MockBillsData } from "../types/bill";
import type { PolicyBriefState } from "../types/policyDesign";
import {
  NC_BILL_SUBSTANCE,
  NC_DISTINCTIVENESS_FINDINGS,
  NC_GAP_FINDINGS,
  NC_LANDSCAPE_SUMMARY,
  NC_POLICY_DESIGN_META,
  NC_SUPPORTING_COMPARISON_BILL_IDS,
} from "../data/ncPolicyDesign";
import {
  getAiBills,
  buildMomentumSnapshot,
} from "../lib/policyExploration";
import {
  loadPolicyBrief,
  toggleBill,
  toggleFinding,
  toggleGap,
  toggleSubstance,
} from "../lib/policyBrief";
import { AnalysisTrustBadges } from "../components/policy-design/AnalysisTrustBadges";
import { CompactNationalMomentum } from "../components/policy-design/CompactNationalMomentum";
import { BillSubstanceCard } from "../components/policy-design/BillSubstanceCard";
import { DistinctivenessCard } from "../components/policy-design/DistinctivenessCard";
import { GapFindingCard } from "../components/policy-design/GapFindingCard";
import { ReferenceBillCard } from "../components/policy-design/ReferenceBillCard";
import { PolicyBriefTray } from "../components/policy-design/PolicyBriefTray";
import { AccessibleDonutChart } from "../components/policy-design/AccessibleDonutChart";
import { AccessibleBarChart } from "../components/policy-design/AccessibleBarChart";
import "../styles/components/AccessibleBarChart.css";
import "../styles/components/AccessibleDonutChart.css";
import "../styles/pages/NcPolicyDesignPage.css";

const data = mockData as MockBillsData;

export function NcPolicyDesignPage() {
  const [brief, setBrief] = useState<PolicyBriefState>(() => loadPolicyBrief());

  const billsById = useMemo(() => {
    const map = new Map<string, Bill>();
    for (const bill of data.bills) map.set(bill.id, bill);
    return map;
  }, []);

  const ncAiBills = useMemo(
    () => getAiBills(data.bills).filter((bill) => bill.state === "NC"),
    [],
  );

  const ncSnapshot = useMemo(
    () => buildMomentumSnapshot(data.bills, "NC"),
    [],
  );

  const statusDonut = useMemo(() => {
    const counts = new Map<string, number>();
    for (const bill of ncAiBills) {
      counts.set(bill.status, (counts.get(bill.status) ?? 0) + 1);
    }
    const total = ncAiBills.length || 1;
    return [...counts.entries()].map(([status, count]) => ({
      id: status,
      label: status,
      value: count,
      share: Math.round((count / total) * 1000) / 10,
    }));
  }, [ncAiBills]);

  const topDomains = useMemo(() => {
    const counts = new Map<string, number>();
    for (const bill of ncAiBills) {
      counts.set(bill.subcategory, (counts.get(bill.subcategory) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([domain, count]) => ({
        id: domain,
        label: domain,
        value: count,
      }));
  }, [ncAiBills]);

  const featuredNcBills = NC_LANDSCAPE_SUMMARY.featuredBillIds
    .map((id) => billsById.get(id))
    .filter((bill): bill is Bill => Boolean(bill));

  const comparisonBills = NC_SUPPORTING_COMPARISON_BILL_IDS.map((id) =>
    billsById.get(id),
  ).filter((bill): bill is Bill => Boolean(bill));

  useEffect(() => {
    document.title = `${NC_POLICY_DESIGN_META.pageTitle} · National Legislation Tracker`;
    return () => {
      document.title = "National Legislation Tracker";
    };
  }, []);

  return (
    <div className="nc-design">
      <header className="nc-design__intro section">
        <div className="container">
          <p className="nc-design__eyebrow">Policy Design · North Carolina</p>
          <h1>{NC_POLICY_DESIGN_META.pageTitle}</h1>
          <p className="nc-design__lede">
            A legislator-facing briefing workspace that connects national AI
            legislative activity, North Carolina’s tracked landscape, curated
            emphasis areas, corpus-relative policy gaps, supporting bills, and
            a lightweight local brief tray.
          </p>

          <aside className="nc-design__disclaimer" role="note">
            <p>
              <strong>Prototype disclaimer.</strong>{" "}
              {NC_POLICY_DESIGN_META.disclaimer}
            </p>
            <p>
              <strong>Draft analysis — pending team review.</strong> Provenance
              labels, bill-substance summaries, distinctiveness findings, gap
              definitions, and supporting-bill mappings are provisional fixtures
              editable in{" "}
              <code>src/data/ncPolicyDesign.ts</code>.
            </p>
          </aside>

          <div className="btn-row">
            <Link to="/policy-exploration" className="btn btn--secondary">
              Open Policy Exploration
            </Link>
            <Link
              to="/search?category=Artificial%20Intelligence&state=NC"
              className="btn btn--secondary"
            >
              Search NC AI bills
            </Link>
            <a href="#policy-brief" className="btn btn--primary">
              Jump to policy brief
            </a>
          </div>
        </div>
      </header>

      <div className="nc-design__layout container">
        <div className="nc-design__main">
          <section
            className="nc-design__section"
            aria-labelledby="national-activity-heading"
          >
            <div className="section-heading">
              <h2 id="national-activity-heading">
                National AI legislative activity
              </h2>
              <p>
                Momentum is shown as separate dimensions — volume, progression,
                recent activity, and institutionalization. These measure
                legislative activity in the mock corpus, not policy quality.
              </p>
            </div>
            <CompactNationalMomentum bills={data.bills} />
          </section>

          <section
            className="nc-design__section"
            aria-labelledby="nc-landscape-heading"
          >
            <div className="section-heading">
              <h2 id="nc-landscape-heading">North Carolina AI landscape</h2>
              <p>
                Scoped to North Carolina AI bills in the prototype dataset (
                {ncAiBills.length} bills).
              </p>
            </div>

            <article className="nc-landscape-summary">
              <h3>{NC_LANDSCAPE_SUMMARY.headline}</h3>
              <AnalysisTrustBadges
                provenance={NC_LANDSCAPE_SUMMARY.provenance}
                reviewStatus={NC_LANDSCAPE_SUMMARY.reviewStatus}
              />
              <p>{NC_LANDSCAPE_SUMMARY.summary}</p>
              <p className="nc-landscape-summary__label" role="note">
                Draft project analysis — pending team review
              </p>
            </article>

            <div className="nc-landscape-metrics">
              <div className="nc-momentum__stats" role="list">
                <div role="listitem">
                  <span className="nc-momentum__stat-value">
                    {ncAiBills.length}
                  </span>
                  <span className="nc-momentum__stat-label">
                    NC AI bills tracked
                  </span>
                </div>
                <div role="listitem">
                  <span className="nc-momentum__stat-value">
                    {ncSnapshot.activity.introducedLast30}
                  </span>
                  <span className="nc-momentum__stat-label">
                    Introduced · last 30 days
                  </span>
                </div>
                <div role="listitem">
                  <span className="nc-momentum__stat-value">
                    {ncSnapshot.progression.enacted}
                  </span>
                  <span className="nc-momentum__stat-label">Enacted</span>
                </div>
              </div>

              <div className="nc-landscape-charts">
                <AccessibleDonutChart
                  title="NC status distribution"
                  description="Mutually exclusive statuses for North Carolina AI bills."
                  data={statusDonut}
                  unit="bills"
                  centerValue={String(ncAiBills.length)}
                  centerLabel="bills"
                />
                <AccessibleBarChart
                  title="Top AI domains in NC corpus"
                  description="Most frequent NCSL-style domain tags among North Carolina AI bills."
                  data={topDomains}
                  unit="bills"
                />
              </div>
            </div>

            <div className="nc-featured-bills">
              <h3>Selected North Carolina bills</h3>
              <div className="nc-featured-bills__grid">
                {featuredNcBills.map((bill) => (
                  <ReferenceBillCard
                    key={bill.id}
                    bill={bill}
                    inBrief={brief.billIds.includes(bill.id)}
                    onToggleBrief={() => setBrief(toggleBill(brief, bill.id))}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            className="nc-design__section"
            aria-labelledby="substance-heading"
          >
            <div className="section-heading">
              <h2 id="substance-heading">Structured bill substance</h2>
              <p>
                Six-field substance model for selected NC bills. Core fields are
                expected; conditional fields appear only when identified in the
                available bill text.
              </p>
            </div>
            <div className="substance-grid">
              {NC_BILL_SUBSTANCE.map((substance) => {
                const bill = billsById.get(substance.billId);
                if (!bill) return null;
                return (
                  <BillSubstanceCard
                    key={substance.billId}
                    bill={bill}
                    substance={substance}
                    inBrief={brief.substanceBillIds.includes(substance.billId)}
                    onToggleBrief={() =>
                      setBrief(toggleSubstance(brief, substance.billId))
                    }
                  />
                );
              })}
            </div>
          </section>

          <section
            className="nc-design__section"
            aria-labelledby="emphasizes-heading"
          >
            <div className="section-heading">
              <h2 id="emphasizes-heading">What North Carolina emphasizes</h2>
              <p>
                Curated distinctiveness findings from typed fixtures — not
                inferred automatically.
              </p>
            </div>
            <div className="finding-grid">
              {NC_DISTINCTIVENESS_FINDINGS.map((finding) => (
                <DistinctivenessCard
                  key={finding.id}
                  finding={finding}
                  billsById={billsById}
                  inBrief={brief.findingIds.includes(finding.id)}
                  onToggleBrief={() =>
                    setBrief(toggleFinding(brief, finding.id))
                  }
                />
              ))}
            </div>
          </section>

          <section
            className="nc-design__section"
            aria-labelledby="gaps-heading"
          >
            <div className="section-heading">
              <h2 id="gaps-heading">Potential policy gaps</h2>
              <p>
                Gaps mean a policy component or domain found in comparison
                legislation was{" "}
                <strong>not identified in the current corpus</strong> for North
                Carolina — not that North Carolina definitively has no policy.
              </p>
            </div>
            <div className="gap-grid">
              {NC_GAP_FINDINGS.map((gap) => (
                <GapFindingCard
                  key={gap.id}
                  gap={gap}
                  billsById={billsById}
                  inBrief={brief.gapIds.includes(gap.id)}
                  onToggleBrief={() => setBrief(toggleGap(brief, gap.id))}
                />
              ))}
            </div>
          </section>

          <section
            className="nc-design__section"
            aria-labelledby="supporting-heading"
          >
            <div className="section-heading">
              <h2 id="supporting-heading">Supporting comparison bills</h2>
              <p>
                Peer-state bills cited by gap and distinctiveness fixtures.
                Official source links are fictional prototype URLs.
              </p>
            </div>
            <div className="nc-featured-bills__grid">
              {comparisonBills.map((bill) => (
                <ReferenceBillCard
                  key={bill.id}
                  bill={bill}
                  inBrief={brief.billIds.includes(bill.id)}
                  onToggleBrief={() => setBrief(toggleBill(brief, bill.id))}
                />
              ))}
            </div>
          </section>
        </div>

        <PolicyBriefTray
          brief={brief}
          onChange={setBrief}
          billsById={billsById}
        />
      </div>
    </div>
  );
}
