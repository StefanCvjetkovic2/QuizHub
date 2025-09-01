import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children, title = "QuizApp", subtitle }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #172131 40%, #0b1220 100%)",
        color: "#e5e7eb",
      }}
    >
      {/* top bar */}
      <header
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              boxShadow: "0 10px 24px rgba(59,130,246,.25)",
            }}
          />
          <span style={{ fontSize: 22, fontWeight: 900 }}>{title}</span>
        </Link>

       
      </header>

      {/* body */}
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "0 16px 40px" }}>
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "1.15fr 1fr",
          }}
        >
          {/* lijevo – hero */}
          <div style={{ paddingTop: 16 }}>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 900,
                lineHeight: 1.1,
                color: "#e2e8f0",
                marginBottom: 12,
              }}
            >
              {subtitle || "Dobrodošao nazad "} <span style={{ fontSize: 42 }}>👋</span>
            </h1>
            <p style={{ opacity: 0.85, marginBottom: 18 }}>
              Brzo prijavljivanje, pregled ličnih rezultata i rang lista.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div
                style={{
                  border: "1px solid rgba(255,255,255,.08)",
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800 }}>⏱️</div>
                <div style={{ opacity: 0.85, fontSize: 14, marginTop: 6 }}>
                  Mjeri se vrijeme rješavanja i bodovi.
                </div>
              </div>
              <div
                style={{
                  border: "1px solid rgba(255,255,255,.08)",
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800 }}>🏆</div>
                <div style={{ opacity: 0.85, fontSize: 14, marginTop: 6 }}>
                  Uporedi se sa drugima na rang listi.
                </div>
              </div>
            </div>
          </div>

          {/* desno – kartica sa formom */}
          <div
            className="card"
            style={{
              border: "1px solid rgba(255,255,255,.1)",
              background: "rgba(2,6,23,.35)",
              borderRadius: 16,
              padding: 20,
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
