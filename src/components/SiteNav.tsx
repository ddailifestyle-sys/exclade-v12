import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { IntroMusic } from "@/components/IntroMusic";

const navItems = [
  ["HOME", "/"],
  ["ABOUT", "/about"],
  ["EVENTS", "/events"],
  ["CREW", "/crew"],
  ["REGISTER", "/register"],
  ["CONTACT", "/contact"],
] as const;

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className={scrolled ? "site-nav site-nav-solid" : "site-nav"}>
      <div className="nav-shell">
        <Link className="brand-lockup" to="/" aria-label="EXCLADE 2K26 home" onClick={() => setIsOpen(false)}>
          <span className="brand-symbol">E</span>
          <span className="brand-name">EXCLADE <b>2K26</b></span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map(([label, to]) => (
            <Link
              className={label === "REGISTER" ? "nav-link nav-link-cta" : "nav-link"}
              activeProps={{ className: label === "REGISTER" ? "nav-link nav-link-cta is-active" : "nav-link is-active" }}
              activeOptions={{ exact: to === "/" }}
              to={to}
              key={label}
            >
              {label}
            </Link>
          ))}
        </nav>

        <IntroMusic />

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
        </button>
      </div>

      {isOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map(([label, to]) => (
            <Link className="mobile-nav-link" to={to} key={label} onClick={() => setIsOpen(false)}>
              <span>{label}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
