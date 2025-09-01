import React, { useState } from "react";

export default function LoginInput({ id, label, type, value, onChange, error }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          required
          value={value}
          onChange={onChange}
          placeholder={`Unesite ${label.toLowerCase()}`}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.06)",
            color: "#e5e7eb",
            outline: "none",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#cbd5e1",
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
            title={show ? "Sakrij lozinku" : "Prikaži lozinku"}
          >
            {show ? "Sakrij" : "Prikaži"}
          </button>
        )}
      </div>
      {error && <div style={{ color: "#f87171", fontSize: 13, marginTop: 4 }}>{error}</div>}
    </div>
  );
}
