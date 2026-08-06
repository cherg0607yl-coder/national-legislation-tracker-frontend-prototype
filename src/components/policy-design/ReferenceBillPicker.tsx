import { useMemo, useState } from "react";
import type { Bill } from "../../types/bill";
import {
  NC_DISTINCTIVENESS_FINDINGS,
  NC_GAP_FINDINGS,
  NC_LANDSCAPE_SUMMARY,
  NC_SUPPORTING_COMPARISON_BILL_IDS,
} from "../../data/ncPolicyDesign";
import { formatBillIdLine } from "../../lib/bills";
import { DisclosureSection } from "./DisclosureSection";

export interface BillPickerGroup {
  id: string;
  label: string;
  billIds: string[];
}

interface ReferenceBillPickerProps {
  billsById: Map<string, Bill>;
  selectedBillIds: string[];
  onAddSelected: (billIds: string[]) => void;
  defaultOpen?: boolean;
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function buildReferenceBillGroups(): BillPickerGroup[] {
  const findingIds = NC_DISTINCTIVENESS_FINDINGS.flatMap((finding) => [
    ...finding.supportingNcBillIds,
    ...(finding.supportingPeerBillIds ?? []),
  ]);
  const gapIds = NC_GAP_FINDINGS.flatMap((gap) => [
    ...gap.supportingPeerBillIds,
    ...(gap.relatedNcBillIds ?? []),
  ]);

  return [
    {
      id: "nc-featured",
      label: "North Carolina featured bills",
      billIds: uniqueIds(NC_LANDSCAPE_SUMMARY.featuredBillIds),
    },
    {
      id: "comparison",
      label: "Comparison-state bills",
      billIds: uniqueIds(NC_SUPPORTING_COMPARISON_BILL_IDS),
    },
    {
      id: "distinctiveness",
      label: "Cited in distinctiveness findings",
      billIds: uniqueIds(findingIds),
    },
    {
      id: "gaps",
      label: "Cited in gap findings",
      billIds: uniqueIds(gapIds),
    },
  ];
}

export function ReferenceBillPicker({
  billsById,
  selectedBillIds,
  onAddSelected,
  defaultOpen = false,
}: ReferenceBillPickerProps) {
  const groups = useMemo(() => buildReferenceBillGroups(), []);
  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const selectedSet = useMemo(
    () => new Set(selectedBillIds),
    [selectedBillIds],
  );

  function toggleDraft(id: string) {
    setDraft((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function selectAllInGroup(group: BillPickerGroup) {
    setDraft((current) => uniqueIds([...current, ...group.billIds]));
  }

  function clearDraft() {
    setDraft([]);
    setStatus("Selection cleared.");
  }

  function addSelected() {
    if (draft.length === 0) {
      setStatus("Select at least one bill to add.");
      return;
    }
    onAddSelected(draft);
    setStatus(
      `Added ${draft.length} bill${draft.length === 1 ? "" : "s"} to the brief.`,
    );
    setDraft([]);
  }

  const inBriefCount = selectedBillIds.length;
  const draftCount = draft.length;

  return (
    <DisclosureSection
      title="Choose reference bills"
      summary="Select bills from grouped lists, then add them to the policy brief."
      open={open}
      onToggle={() => setOpen((value) => !value)}
      badge={`${inBriefCount} in brief`}
      headingLevel={3}
      className="bill-picker"
    >
      <div className="bill-picker__toolbar btn-row">
        <button type="button" className="btn btn--primary" onClick={addSelected}>
          Add selected ({draftCount})
        </button>
        <button type="button" className="btn btn--secondary" onClick={clearDraft}>
          Clear selection
        </button>
      </div>

      {status ? (
        <p className="bill-picker__status" role="status">
          {status}
        </p>
      ) : null}

      <div className="bill-picker__groups">
        {groups.map((group) => {
          const bills = group.billIds
            .map((id) => billsById.get(id))
            .filter((bill): bill is Bill => Boolean(bill));

          return (
            <fieldset key={group.id} className="bill-picker__group">
              <legend className="bill-picker__legend">
                <span>
                  {group.label}{" "}
                  <span className="bill-picker__count">({bills.length})</span>
                </span>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => selectAllInGroup(group)}
                >
                  Select all in group
                </button>
              </legend>

              <ul className="bill-picker__list" role="list">
                {bills.map((bill) => {
                  const checked = draft.includes(bill.id);
                  const alreadyInBrief = selectedSet.has(bill.id);
                  const inputId = `pick-${group.id}-${bill.id}`;
                  return (
                    <li key={`${group.id}-${bill.id}`} className="bill-picker__row">
                      <label htmlFor={inputId} className="bill-picker__label">
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDraft(bill.id)}
                        />
                        <span className="bill-picker__id">
                          {formatBillIdLine(bill)}
                        </span>
                        <span className="bill-picker__title">{bill.title}</span>
                        <span
                          className={`status-badge status-badge--${bill.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {bill.status}
                        </span>
                        {alreadyInBrief ? (
                          <span className="bill-picker__in-brief">In brief</span>
                        ) : null}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          );
        })}
      </div>
    </DisclosureSection>
  );
}
