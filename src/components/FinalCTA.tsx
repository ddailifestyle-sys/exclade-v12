import { Link } from "@tanstack/react-router";
export function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta-smoke" aria-hidden="true" />
      <div className="final-cta-inner reveal-on-scroll">
        <p className="eyebrow">FINAL TRANSMISSION</p>
        <h2 id="final-cta-title">
          THE LAB IS READY.
          <em>ARE YOU?</em>
        </h2>
        <div className="hero-actions">
          <Link className="primary-cta" to="/register">REGISTER FOR EXCLADE 2K26 <span aria-hidden="true">→</span></Link>
          <Link className="secondary-cta" to="/events">EXPLORE EVENTS</Link>
        </div>
      </div>
    </section>
  );
}
