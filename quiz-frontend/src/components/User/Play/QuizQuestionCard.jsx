import React from "react";
import { normalizeType } from "@/models/quizModels";

export default function QuizQuestionCard({
  question,
  index,               // 1-based
  total,               // ukupan broj pitanja (za naslov)
  answerState,         // { selectedIds: Set<string>, text: string }
  setRadio,
  toggleCheckbox,
  setText,
  setTrueFalseText,
}) {
  const q = question;
  const type = normalizeType(q.type);

  return (
    <div
      className="card"
      style={{
        marginTop: 16,
        padding: 18,
        border: "1px solid rgba(148,163,184,.25)",
        borderRadius: 14,
        background: "rgba(30,41,59,.30)",
      }}
    >
      <div className="muted" style={{ marginBottom: 4 }}>
        Pitanje {index} / {total}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{q.text}</div>

      {type === "single" && (
        <div style={{ display: "grid", gap: 8 }}>
          {q.answers.map((a) => {
            const checked = answerState?.selectedIds?.has(String(a.id));
            return (
              <label key={a.id} className="option" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={!!checked}
                  onChange={() => setRadio(q.id, a.id)}
                />
                <span>{a.text}</span>
              </label>
            );
          })}
        </div>
      )}

      {type === "multiple" && (
        <div style={{ display: "grid", gap: 8 }}>
          {q.answers.map((a) => {
            const checked = answerState?.selectedIds?.has(String(a.id));
            return (
              <label key={a.id} className="option" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!checked}
                  onChange={() => toggleCheckbox(q.id, a.id)}
                />
                <span>{a.text}</span>
              </label>
            );
          })}
        </div>
      )}

      {type === "boolean" && (
        <div style={{ display: "grid", gap: 8 }}>
          {(q.answers?.length === 2
            ? q.answers
            : [
                { id: "tf-true", text: "Tačno", flag: "true" },
                { id: "tf-false", text: "Netačno", flag: "false" },
              ]
          ).map((o) => {
            const hasIds = q.answers?.length === 2;
            const checked = hasIds
              ? !!answerState?.selectedIds?.has(String(o.id))
              : answerState?.text === o.flag;
            const onChange = () => {
              if (hasIds) setRadio(q.id, o.id);
              else setTrueFalseText(q.id, o.flag);
            };
            return (
              <label key={o.id} className="option" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="radio" name={`q-tf-${q.id}`} checked={checked} onChange={onChange} />
                <span>{o.text}</span>
              </label>
            );
          })}
        </div>
      )}

      {type === "text" && (
        <div style={{ display: "grid", gap: 6 }}>
          <input
            placeholder="Unesite odgovor…"
            value={answerState?.text ?? ""}
            onChange={(e) => setText(q.id, e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
