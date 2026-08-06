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
} from "../data/ncPolicyDesign";
import {
  getAiBills,
  buildMomentumSnapshot,
} from "../lib/policyExploration";
import {
  loadPolicyBrief,
  toggleFinding,
  toggleGap,
  toggleSubstance,
} from "../lib/policyBrief";
import { AnalysisTrustBadges } from "../components/policy-design/AnalysisTrustBadges";
import { CompactNationalMomentum } from "../components/policy-design/CompactNationalMomentum";
import {
  BillSubstanceCard,
  BillSubstanceCompareTable,
} from "../components/policy-design/BillSubstanceCard";
import { DistinctivenessCard } from "../components/policy-design/DistinctivenessCard";
import { GapFindingCard } from "../components/policy-design/GapFindingCard";
import { ReferenceBillPicker } from "../components/policy-design/ReferenceBillPicker";
import { PolicyBriefTray } from "../components/policy-design/PolicyBriefTray";
import { PrintablePolicyBrief } from "../components/policy-design/PrintablePolicyBrief";
import {
  DisclosureSection,
  ExpandCollapseControls,
} from "../components/policy-design/DisclosureSection";
import { AccessibleDonutChart } from "../components/policy-design/AccessibleDonutChart";
import { AccessibleBarChart } from "../components/policy-design/AccessibleBarChart";
import "../styles/components/AccessibleBarChart.css";
import "../styles/components/AccessibleDonutChart.css";
import "../styles/pages/NcPolicyDesignPage.css";

const data = mockData as MockBillsData;

type SectionKey =
  | "national"
  | "landscape"
  | "emphasizes"
  | "gaps"
  | "evidence";

const DEFAULT_OPEN: Record<SectionKey, boolean> = {
  national: false,
  landscape: true,
  emphasizes: true,
  gaps: true,
  evidence: false,
};

export function NcPolicyDesignPage() {
  const [brief, setBrief] = useState<PolicyBriefState>(() => loadPolicyBrief());
  const [sectionOpen, setSectionOpen] =
    useState<Record<SectionKey, boolean>>(DEFAULT_OPEN);
  const [substanceOpen, setSubstanceOpen] = useState<Record<string, boolean>>(
    {},
  );
  const [compareMode, setCompareMode] = useState(false);
  const [briefDetailsOpen, setBriefDetailsOpen] = useState(false);

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

  const compareRows = useMemo(() => {
    const source =
      brief.substanceBillIds.length > 0
        ? NC_BILL_SUBSTANCE.filter((substance) =>
            brief.substanceBillIds.includes(substance.billId),
          )
        : NC_BILL_SUBSTANCE;
    return source
      .map((substance) => {
        const bill = billsById.get(substance.billId);
        return bill ? { bill, substance } : null;
      })
      .filter(
        (
          row,
        ): row is {
          bill: Bill;
          substance: (typeof NC_BILL_SUBSTANCE)[number];
        } => Boolean(row),
      );
  }, [brief.substanceBillIds, billsById]);

  useEffect(() => {
    document.title = `${NC_POLICY_DESIGN_META.pageTitle} · National Legislation Tracker`;
    return () => {
      document.title = "National Legislation Tracker";
    };
  }, []);

  function setSection(key: SectionKey, open: boolean) {
    setSectionOpen((current) => ({ ...current, [key]: open }));
  }

  function expandAllSections() {
    setSectionOpen({
      national: true,
      landscape: true,
      emphasizes: true,
      gaps: true,
      evidence: true,
    });
    setBriefDetailsOpen(true);
  }

  function collapseAllSections() {
    setSectionOpen({
      national: false,
      landscape: false,
      emphasizes: false,
      gaps: false,
      evidence: false,
    });
    setBriefDetailsOpen(false);
    setSubstanceOpen({});
  }

  function expandAllSubstance() {
    const next: Record<string, boolean> = {};
    for (const substance of NC_BILL_SUBSTANCE) {
      next[substance.billId] = true;
    }
    setSubstanceOpen(next);
  }

  function collapseAllSubstance() {
    setSubstanceOpen({});
  }

  function addBillsToBrief(billIds: string[]) {
    setBrief((current) => ({
      ...current,
      billIds: [...new Set([...current.billIds, ...billIds])],
    }));
  }

  return (
    <div className="nc-design">
      <div className="nc-design__screen">
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
                <strong>Draft analysis — pending team review.</strong>{" "}
                Provenance labels, bill-substance summaries, distinctiveness
                findings, gap definitions, and supporting-bill mappings are
                provisional fixtures editable in{" "}
                <code>src/data/ncPolicyDesign.ts</code>.
              </p>
            </aside>

            <div className="nc-design__intro-controls">
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
              <ExpandCollapseControls
                onExpandAll={expandAllSections}
                onCollapseAll={collapseAllSections}
                label="Page section visibility"
              />
            </div>
          </div>
        </header>

        <div className="nc-design__layout container">
          <div className="nc-design__main">
            <DisclosureSection
              title="National AI legislative activity"
              summary="Momentum dimensions measure legislative activity in the mock corpus, not policy quality."
              open={sectionOpen.national}
              onToggle={() => setSection("national", !sectionOpen.national)}
              badge="Collapsed by default"
            >
              <CompactNationalMomentum bills={data.bills} />
            </DisclosureSection>

            <DisclosureSection
              title="North Carolina AI landscape"
              summary={`Scoped to ${ncAiBills.length} North Carolina AI bills in the prototype dataset.`}
              open={sectionOpen.landscape}
              onToggle={() => setSection("landscape", !sectionOpen.landscape)}
              badge="Expanded by default"
            >
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
            </DisclosureSection>

            <DisclosureSection
              title="What North Carolina emphasizes"
              summary="Curated distinctiveness findings — expand each card for supporting evidence."
              open={sectionOpen.emphasizes}
              onToggle={() =>
                setSection("emphasizes", !sectionOpen.emphasizes)
              }
              badge={`${NC_DISTINCTIVENESS_FINDINGS.length} findings`}
            >
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
            </DisclosureSection>

            <DisclosureSection
              title="Potential policy gaps"
              summary="Gaps mean a component was not identified in the current corpus — not that North Carolina has no policy."
              open={sectionOpen.gaps}
              onToggle={() => setSection("gaps", !sectionOpen.gaps)}
              badge={`${NC_GAP_FINDINGS.length} gaps`}
            >
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
            </DisclosureSection>

            <DisclosureSection
              title="Supporting evidence and bills"
              summary="Choose reference bills, review bill substance (collapsed by default), and optionally compare fields."
              open={sectionOpen.evidence}
              onToggle={() => setSection("evidence", !sectionOpen.evidence)}
              badge="Collapsed by default"
            >
              <ReferenceBillPicker
                billsById={billsById}
                selectedBillIds={brief.billIds}
                onAddSelected={addBillsToBrief}
                defaultOpen={false}
              />

              <div className="substance-panel">
                <div className="substance-panel__head">
                  <div>
                    <h3>Structured bill substance</h3>
                    <p>
                      Six-field model for selected NC bills. Headers show
                      field-completeness; expand a bill to read the fields.
                    </p>
                  </div>
                  <ExpandCollapseControls
                    onExpandAll={expandAllSubstance}
                    onCollapseAll={collapseAllSubstance}
                    label="Bill substance visibility"
                  />
                </div>

                <div className="substance-panel__mode" role="group" aria-label="Substance view mode">
                  <button
                    type="button"
                    className={
                      !compareMode
                        ? "nc-momentum__tab is-active"
                        : "nc-momentum__tab"
                    }
                    aria-pressed={!compareMode}
                    onClick={() => setCompareMode(false)}
                  >
                    Accordion list
                  </button>
                  <button
                    type="button"
                    className={
                      compareMode
                        ? "nc-momentum__tab is-active"
                        : "nc-momentum__tab"
                    }
                    aria-pressed={compareMode}
                    onClick={() => setCompareMode(true)}
                  >
                    Comparison table
                  </button>
                </div>

                {compareMode ? (
                  <BillSubstanceCompareTable rows={compareRows} />
                ) : (
                  <div className="substance-grid">
                    {NC_BILL_SUBSTANCE.map((substance) => {
                      const bill = billsById.get(substance.billId);
                      if (!bill) return null;
                      return (
                        <BillSubstanceCard
                          key={substance.billId}
                          bill={bill}
                          substance={substance}
                          inBrief={brief.substanceBillIds.includes(
                            substance.billId,
                          )}
                          onToggleBrief={() =>
                            setBrief(toggleSubstance(brief, substance.billId))
                          }
                          open={Boolean(substanceOpen[substance.billId])}
                          onOpenChange={(next) =>
                            setSubstanceOpen((current) => ({
                              ...current,
                              [substance.billId]: next,
                            }))
                          }
                        />
                      );
                    })}
                  </div>
                )}
                {compareMode ? (
                  <p className="substance-compare__hint" role="note">
                    {brief.substanceBillIds.length > 0
                      ? "Showing substance notes currently in the brief."
                      : "No substance notes in the brief yet — showing all curated NC substance records for comparison."}
                  </p>
                ) : null}
              </div>
            </DisclosureSection>

            <section
              className="disclosure-section brief-section is-open"
              aria-labelledby="policy-brief-workspace-heading"
            >
              <header className="disclosure-section__header">
                <div className="disclosure-section__titles">
                  <h2
                    id="policy-brief-workspace-heading"
                    className="disclosure-section__title"
                  >
                    Policy brief workspace
                  </h2>
                  <p className="disclosure-section__summary">
                    Compact count summary stays visible. Expand details to edit.
                    Print outputs a dedicated brief document, not this page.
                  </p>
                </div>
              </header>
              <div className="disclosure-section__panel">
                <PolicyBriefTray
                  brief={brief}
                  onChange={setBrief}
                  billsById={billsById}
                  detailsOpen={briefDetailsOpen}
                  onDetailsOpenChange={setBriefDetailsOpen}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      <PrintablePolicyBrief brief={brief} billsById={billsById} />
    </div>
  );
}
