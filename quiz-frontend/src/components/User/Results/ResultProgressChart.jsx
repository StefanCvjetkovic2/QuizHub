import React, { useMemo } from "react";

/**
 * attempts: [{ dateTaken: string|Date, percentage: number }]
 */
export default function ResultProgressChart({ attempts = [] }) {
  const { points, minY, maxY } = useMemo(() => {
    if (!attempts.length) return { points: "", minY: 0, maxY: 100 };
    const ys = attempts.map(a => Math.max(0, Math.min(100, Number(a.percentage) || 0)));
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys, 100);
    const W = 600, H = 120, P = 10;
    const dx = attempts.length > 1 ? (W - 2*P) / (attempts.length - 1) : 0;

    const pts = attempts.map((a, i) => {
      const yNorm = (ys[i] - minY) / (maxY - minY || 1);
      const x = P + i * dx;
      const y = H - P - yNorm * (H - 2*P);
      return `${x},${y}`;
    }).join(" ");

    return { points: pts, minY, maxY };
  }, [attempts]);

  if (attempts.length <= 1) return null;

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Napredak (poslednjih {attempts.length} pokušaja)</div>
      <svg viewBox="0 0 600 140" width="100%" height="140" role="img" aria-label="Grafikon napretka">
        {/* grid linije */}
        <line x1="10" y1="30" x2="590" y2="30" stroke="rgba(148,163,184,.35)" strokeDasharray="4 4" />
        <line x1="10" y1="70" x2="590" y2="70" stroke="rgba(148,163,184,.35)" strokeDasharray="4 4" />
        <line x1="10" y1="110" x2="590" y2="110" stroke="rgba(148,163,184,.35)" strokeDasharray="4 4" />
        {/* polyline */}
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
        {/* tačkice */}
        {points.split(" ").map((p, i) => {
          if (!p) return null;
          const [x, y] = p.split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r="3" fill="currentColor" />;
        })}
      </svg>
    </div>
  );
}
