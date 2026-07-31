import { useState } from "react";
import mockData from "../../data/mock-bills.json";
import type { MockBillsData, PolicyCategory } from "../types/bill";
import {
  AiMomentumWorkspace,
  CategoryFocusPicker,
} from "../components/policy-design";
import "../styles/pages/PolicyDesignPage.css";

const data = mockData as MockBillsData;

export function PolicyDesignPage() {
  const [category, setCategory] = useState<PolicyCategory | null>(null);

  return (
    <div className="policy-design section">
      <div className="container">
        {!category ? (
          <CategoryFocusPicker onSelect={setCategory} />
        ) : category === "Artificial Intelligence" ? (
          <AiMomentumWorkspace
            bills={data.bills}
            onChangeCategory={() => setCategory(null)}
          />
        ) : (
          <section className="policy-design-stage" role="status">
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
