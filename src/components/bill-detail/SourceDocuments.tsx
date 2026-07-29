import type { Bill } from "../../types/bill";
import { formatOptionalDate } from "../../lib/bills";

interface SourceDocumentsProps {
  bill: Bill;
}

export function SourceDocuments({ bill }: SourceDocumentsProps) {
  const documents = [...(bill.documents ?? [])].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );

  return (
    <section className="bill-section" aria-labelledby="documents-heading">
      <div className="bill-section__intro">
        <h2 id="documents-heading">Source Documents</h2>
        <p>Official materials associated with this bill, newest first.</p>
      </div>

      {documents.length === 0 ? (
        <p className="bill-callout" role="status">
          Source documents are not linked for this bill yet.
        </p>
      ) : (
        <ul className="source-docs">
          {documents.map((doc) => (
            <li key={`${doc.name}-${doc.url}`}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-docs__link"
              >
                <span className="source-docs__name">{doc.name}</span>
                <span className="source-docs__meta">
                  {[doc.type, formatOptionalDate(doc.date)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                <span className="source-docs__cta" aria-hidden="true">
                  Open ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
