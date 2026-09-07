/**
 * Ambient cinematic layers: film grain, drifting vapour, rising bubbles and
 * a slow crystal shimmer. Purely decorative.
 */
export function LabAmbience() {
  return (
    <div className="lab-ambience" aria-hidden="true">
      <div className="ambience-grain" />
      <div className="ambience-vapour vapour-one" />
      <div className="ambience-vapour vapour-two" />
      <div className="ambience-scanline" />
      <div className="ambience-bubbles">
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            style={{
              left: `${(index * 7 + 4) % 100}%`,
              animationDelay: `${(index % 7) * 1.4}s`,
              animationDuration: `${11 + (index % 5) * 3}s`,
              width: `${5 + (index % 4) * 3}px`,
              height: `${5 + (index % 4) * 3}px`,
            }}
          />
        ))}
      </div>
      <div className="ambience-crystals">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} style={{ animationDelay: `${index * 1.9}s`, left: `${index * 17 + 6}%` }} />
        ))}
      </div>
    </div>
  );
}
