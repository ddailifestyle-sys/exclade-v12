import { useEffect, useRef, useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { initialsOf, type Person } from "@/data/crew";

type Props = { person: Person; onClose: () => void };

export function PersonnelModal({ person, onClose }: Props) {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [stage, setStage] = useState<"accessing" | "granted">(reduced ? "granted" : "accessing");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (stage === "granted") return;
    const t = window.setTimeout(() => setStage("granted"), 700);
    return () => window.clearTimeout(t);
  }, [stage]);

  return (
    <div className="file-overlay" onClick={onClose}>
      <div
        className="file-modal personnel-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Personnel file ${person.id} — ${person.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="file-scan" aria-hidden="true" />
        <div className="file-topline">
          <span className="dossier-brand"><FlaskConical aria-hidden="true" size={25} /><span>EXCLADE<small>2K26</small></span></span>
          <span className="file-case">PERSONNEL DATABASE<small>SECURE // CONFIDENTIAL // EXCLADE 2K26</small></span>
          <span className="file-code">FILE {person.id}</span>
          <span className="dossier-access">ACCESS<br />RESTRICTED<br />PERSONNEL ONLY</span>
          <button ref={closeRef} type="button" className="file-x" onClick={onClose} aria-label="Close personnel file">
            <X aria-hidden="true" size={16} />
          </button>
        </div>

        {stage === "accessing" ? (
          <p className="file-accessing" aria-live="polite">ACCESSING FILE…</p>
        ) : (
          <div className="file-body">
            <div className="dossier-grid">
              <aside className="dossier-portrait-panel">
                <span className="dossier-frame-label">PERSONNEL PORTRAIT // A02</span>
                <span className={person.photo ? "file-icon personnel-file-photo" : "file-icon personnel-avatar-lg"} aria-hidden="true">
                  {person.photo ? <img src={person.photo} alt="" /> : initialsOf(person.name)}
                </span>
                <span className="dossier-id">PERSONNEL ID <strong>EXC-{person.id}</strong></span>
              </aside>
              <section className="dossier-details">
                <p className="file-granted">● ACCESS GRANTED</p>
                <h3>{person.name}</h3>
                <p className="dossier-role">{person.group} {person.role ?? person.assignment}</p>
                <dl className="file-facts">
                  {person.role && <div><dt>ROLE</dt><dd>{person.role}</dd></div>}
                  {person.assignment && <div><dt>ASSIGNMENT</dt><dd>{person.assignment}</dd></div>}
                  {person.dept && <div><dt>YEAR / DEPT.</dt><dd>{person.dept}</dd></div>}
                  <div><dt>DIVISION</dt><dd>{person.group}</dd></div>
                  {person.note && <div><dt>CATEGORY</dt><dd>{person.note}</dd></div>}
                  <div><dt>STATUS</dt><dd className="dossier-authorized">● AUTHORIZED</dd></div>
                </dl>
              </section>
              <aside className="dossier-side-panel" aria-hidden="true">
                <div className="dossier-barcode" />
                <div className="dossier-emblem"><FlaskConical size={62} /></div>
                <p>"PEOPLE<br />BUILD<br />POSSIBILITIES."</p>
                <div className="dossier-wave" />
              </aside>
            </div>
            <div className="dossier-footer">
              <p className="file-note">EXCLADE PERSONNEL DATABASE.<br />KSR COLLEGE OF ENGINEERING</p>
              <button type="button" className="secondary-cta file-close" onClick={onClose}>[ CLOSE FILE ]</button>
              <p className="file-note dossier-footer-right">DEPARTMENT OF CSE (IoT)<br />THE OPERATION CONTINUES.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
