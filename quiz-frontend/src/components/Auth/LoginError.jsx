import React from "react";

export default function LoginError({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        border: "1px solid rgba(248,113,113,.35)",
        background: "rgba(248,113,113,.12)",
        color: "#fecaca",
        borderRadius: 10,
        padding: "8px 10px",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}
