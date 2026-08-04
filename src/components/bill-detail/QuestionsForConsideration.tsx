import type { Bill } from "../../types/bill";
import { getConsiderationQuestions } from "../../lib/bills";

interface QuestionsForConsiderationProps {
  bill: Bill;
}

export function QuestionsForConsideration({
  bill,
}: QuestionsForConsiderationProps) {
  const questions = getConsiderationQuestions(bill);

  if (questions.length === 0) {
    return null;
  }

  return (
    <section
      className="bill-section"
      aria-labelledby="questions-heading"
    >
      <details className="questions-block">
        <summary>
          <span id="questions-heading">Questions for Consideration</span>
          <span className="questions-block__hint">
            {questions.length} item{questions.length === 1 ? "" : "s"} · collapsed
            by default
          </span>
        </summary>
        <ul className="questions-block__list">
          {questions.map((item) => (
            <li key={item.topic}>
              <strong>{item.topic}</strong>
              <p>{item.detail}</p>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
