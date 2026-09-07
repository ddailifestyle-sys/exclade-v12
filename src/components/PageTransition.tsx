import { useEffect, useState } from "react";

type PageTransitionProps = {
  active: boolean;
  pathname: string;
};

export function PageTransition({ active, pathname }: PageTransitionProps) {
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), 80);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!visible) return null;

  return (
    <div className={active ? "page-transition is-active" : "page-transition"} aria-hidden="true">
      <div className="page-transition-panel page-transition-panel-top" />
      <div className="page-transition-panel page-transition-panel-bottom" />
      <div className="page-transition-scan" />
      <div className="page-transition-copy">
        <span>EXCLADE 2K26</span>
        <b>{pathname === "/" ? "HOME" : pathname.slice(1).replaceAll("/", " · ").toUpperCase()}</b>
      </div>
    </div>
  );
}