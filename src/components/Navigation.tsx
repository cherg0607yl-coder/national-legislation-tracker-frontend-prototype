import { NavLink } from "react-router-dom";
import "../styles/components/Navigation.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/search", label: "Search Bills", end: false },
  { to: "/about", label: "About", end: false },
] as const;

export function Navigation() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink to="/" className="site-logo">
          National Legislation Tracker
        </NavLink>
        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "site-nav__link is-active" : "site-nav__link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
