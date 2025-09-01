import React from "react";

export default function QuizNavButtons({ onPrev, onNext }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button className="btn btn-amber" onClick={onPrev}>Prethodno</button>
      <button className="btn btn-blue" onClick={onNext}>Sljedeće</button>
    </div>
  );
}
