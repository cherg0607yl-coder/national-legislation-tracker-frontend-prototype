import { Link } from "react-router-dom";
import "../styles/pages/PlaceholderPage.css";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="placeholder section">
      <div className="container placeholder__inner">
        <p className="placeholder__eyebrow">Coming soon</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link to="/" className="btn btn--primary">
          Back to homepage
        </Link>
      </div>
    </section>
  );
}
