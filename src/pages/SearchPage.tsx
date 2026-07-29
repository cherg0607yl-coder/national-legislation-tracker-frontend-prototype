import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import mockData from "../../data/mock-bills.json";
import type { BillStatus, MockBillsData, PolicyCategory } from "../types/bill";
import { STATE_NAMES } from "../lib/stats";
import {
  ALL_STATES,
  BILL_STATUSES,
  POLICY_CATEGORIES,
  SEARCH_YEARS,
  createDefaultFilters,
  filterBills,
  type SearchFilters,
} from "../lib/search";
import { CheckboxPanel } from "../components/CheckboxPanel";
import { CategoryTreePanel } from "../components/CategoryTreePanel";
import { SearchResultCard } from "../components/SearchResultCard";
import "../styles/pages/SearchPage.css";

const data = mockData as MockBillsData;

function parseInitialFilters(params: URLSearchParams): Partial<SearchFilters> {
  const category = params.get("category");
  const state = params.get("state");
  const initial: Partial<SearchFilters> = {};

  if (category && POLICY_CATEGORIES.includes(category as PolicyCategory)) {
    initial.categories = [category as PolicyCategory];
  }
  if (state && STATE_NAMES[state]) {
    initial.states = [state];
  }
  return initial;
}

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const initial = parseInitialFilters(searchParams);
  const [draft, setDraft] = useState<SearchFilters>(() =>
    createDefaultFilters(initial),
  );
  const [applied, setApplied] = useState<SearchFilters>(() =>
    createDefaultFilters(initial),
  );

  const results = useMemo(() => filterBills(data.bills, applied), [applied]);

  function updateDraft<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSearch(event?: FormEvent) {
    event?.preventDefault();
    setApplied({ ...draft });
  }

  function handleReset() {
    const reset = createDefaultFilters();
    setDraft(reset);
    setApplied(reset);
  }

  return (
    <section className="search-page section" aria-labelledby="search-heading">
      <div className="container">
        <div className="section-heading search-page__intro">
          <h1 id="search-heading">Search Bills</h1>
          <p>
            Use the category tree to filter policy areas. Artificial
            Intelligence expands to show nested AI topics.
          </p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-panels search-panels--two">
            <CategoryTreePanel
              categories={draft.categories}
              topics={draft.topics}
              onChange={({ categories, topics }) =>
                setDraft((current) => ({ ...current, categories, topics }))
              }
              maxHeight={420}
            />

            <CheckboxPanel
              title="States"
              options={ALL_STATES.map((code) => ({
                value: code,
                label: `${STATE_NAMES[code]} (${code})`,
              }))}
              selected={draft.states}
              onChange={(next) => updateDraft("states", next)}
              maxHeight={360}
              searchable
              searchPlaceholder="Search states (e.g. California or CA)"
            />
          </div>

          <div className="search-fields">
            <label className="search-field">
              <span>Keyword</span>
              <input
                type="search"
                value={draft.keyword}
                onChange={(event) => updateDraft("keyword", event.target.value)}
                placeholder="Title, summary, sponsor…"
              />
            </label>

            <label className="search-field">
              <span>Status</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  updateDraft(
                    "status",
                    event.target.value as BillStatus | "All",
                  )
                }
              >
                <option value="All">All</option>
                {BILL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="search-field">
              <span>Bill number</span>
              <input
                type="text"
                value={draft.billNumber}
                onChange={(event) =>
                  updateDraft("billNumber", event.target.value)
                }
                placeholder="HB 1234"
              />
            </label>

            <label className="search-field">
              <span>Year</span>
              <select
                value={draft.year}
                onChange={(event) =>
                  updateDraft(
                    "year",
                    event.target.value as SearchFilters["year"],
                  )
                }
              >
                <option value="All">All</option>
                {SEARCH_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="search-field">
              <span>Author</span>
              <input
                type="text"
                value={draft.author}
                onChange={(event) => updateDraft("author", event.target.value)}
                placeholder="Sponsor name"
              />
            </label>
          </div>

          <div className="search-actions">
            <button type="submit" className="btn btn--primary">
              Search
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleReset}
            >
              Reset all
            </button>
          </div>
        </form>

        <div className="search-results" aria-live="polite">
          <div className="search-results__header">
            <h2>Results</h2>
            <p>
              {results.length} bill{results.length === 1 ? "" : "s"} match the
              current filters
            </p>
          </div>

          {results.length === 0 ? (
            <p className="search-results__empty">
              No bills matched. Try clearing a filter or broadening your
              keyword.
            </p>
          ) : (
            <div className="search-results__grid">
              {results.map((bill) => (
                <SearchResultCard key={bill.id} bill={bill} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
