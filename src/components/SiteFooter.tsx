import { Link } from "@tanstack/react-router";

const footerLinks = [
  ["HOME", "/"],
  ["ABOUT", "/about"],
  ["EVENTS", "/events"],
  ["SCHEDULE", "/schedule"],
  ["CREW", "/crew"],
  ["HOW TO REGISTER", "/registration"],
  ["REGISTER", "/register"],
  ["CONTACT", "/contact"],
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-grid-bg" aria-hidden="true" />
      <div className="footer-smoke" aria-hidden="true" />
      <div className="footer-dust" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => (
          <span key={index} style={{ left: `${index * 10 + 3}%`, animationDelay: `${index * 0.7}s` }} />
        ))}
      </div>

      <div className="footer-inner">
        <div className="footer-brand reveal-on-scroll">
          <h2>EXCLADE <em>2K26</em></h2>
          <p>KSR COLLEGE OF ENGINEERING</p>
          <p>DEPARTMENT OF CSE (IoT)</p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
            {footerLinks.map(([label, to]) => (
              <Link key={label} to={to}>{label}</Link>
          ))}
        </nav>

        <div className="footer-ending reveal-on-scroll">
          <Link className="primary-cta" to="/register">REGISTER NOW <span aria-hidden="true">→</span></Link>
          <div className="footer-status">
            <span>OPERATION STATUS</span>
            <b>REGISTRATIONS OPEN</b>
          </div>
          <p className="footer-sign">UNTIL THE NEXT OPERATION.</p>
        </div>
      </div>

      <div className="footer-baseline">
        <span>EXCLADE 2K26</span>
        <span>THE OPERATION ENDS. THE EXPERIENCE DOESN'T.</span>
        <span>PRODUCTION READY</span>
      </div>
    </footer>
  );
}
