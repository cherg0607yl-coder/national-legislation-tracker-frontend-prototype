import { useState } from "react";
import mockData from "../../data/mock-bills.json";
import type { MockBillsData, PolicyCategory } from "../types/bill";
import {
  AiExplorationWorkspace,
  CategoryFocusPicker,
} from "../components/policy-exploration";
import "../styles/pages/PolicyExplorationPage.css";

const data = mockData as MockBillsData;

export function PolicyExplorationPage() {
  const [category, setCategory] = useState<PolicyCategory | null>(null);

  return (
    <div className="policy-explore section">
      <div className="container">
        {!category ? (
          <CategoryFocusPicker onSelect={setCategory} />
        ) : category === "Artificial Intelligence" ? (
          <AiExplorationWorkspace
            bills={data.bills}
            onChangeCategory={() => setCategory(null)}
          />
        ) : (
          <section className="policy-explore-stage" role="status">
            <h1>Category not available</h1>
            <p>
              This policy focus is not enabled in the current prototype stage.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setCategory(null)}
            >
              Back to category selection
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

/** @deprecated Prefer PolicyExplorationPage */
export const PolicyDesignPage = PolicyExplorationPage;
