import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginInput from "./LoginInput";
import LoginError from "./LoginError";
import { loginUser, fetchMe } from "@/services/userService";
import { setRoles, getRolesFromToken, isAdmin } from "@/services/tokenService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validate = () => {
    const errs = {};
    const id = identifier.trim();

    if (!id) {
      errs.Identifier = "Unesite korisničko ime ili email.";
    } else if (id.includes("@")) {
      if (!EMAIL_RE.test(id)) errs.Identifier = "Unesite ispravan email format.";
    } else if (id.length < 3) {
      errs.Identifier = "Korisničko ime mora imati najmanje 3 znaka.";
    }

    if (!password) {
      errs.Password = "Unesite lozinku.";
    } else if (password.length < 6) {
      errs.Password = "Lozinka mora imati najmanje 6 karaktera.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (!validate()) return; // ⬅️ ne šalji na BE ako polja nisu OK

    setLoading(true);
    try {
      const data = await loginUser({ identifier: identifier.trim(), password });
      if (data?.success) {
        localStorage.setItem("access_token", data.token);
        const tokenRoles = getRolesFromToken();
        setRoles(tokenRoles);
        try { await fetchMe(); } catch {}
        nav(isAdmin() ? "/admin" : "/", { replace: true });
      } else {
        setFieldErrors({ general: data?.message || "Neuspješna prijava." });
      }
    } catch (error) {
      const status = error?.response?.status;
      const apiMsg = error?.response?.data?.message;

      if (status === 400 || status === 401) {
        setFieldErrors({ general: apiMsg || "Pogrešno korisničko ime/email ili lozinka." });
      } else {
        setFieldErrors({ general: apiMsg || "Neočekivana greška." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Prijava</h2>
        <div style={{ marginTop: 6, opacity: .85 }}>
          Nemate nalog?{" "}
          <Link to="/register" style={{ color: "#60a5fa" }}>Registruj se</Link>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <LoginInput
          id="identifier"
          label="Username ili Email"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onBlur={validate}
          error={fieldErrors.Identifier}
        />
        <LoginInput
          id="password"
          label="Lozinka"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={validate}
          error={fieldErrors.Password}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-blue"
        style={{ width: "100%", marginTop: 14 }}
      >
        {loading ? "Prijavljivanje…" : "Prijavi se"}
      </button>

      <div style={{ marginTop: 10 }}>
        <LoginError message={fieldErrors.general} />
      </div>
    </form>
  );
}
