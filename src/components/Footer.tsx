import { Link } from "react-router-dom";
import "../styles/components/Footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <p className="site-footer__brand">National Legislation Tracker</p>
          <p className="site-footer__disclaimer">
            Prototype interface · Fictional bill data for design only
          </p>
        </div>
        <nav className="site-footer__links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/search">Search Bills</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
    </footer>
  );
}
