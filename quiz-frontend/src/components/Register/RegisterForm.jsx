import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "@/services/userService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

// ⬇️ Pomocna: izvući prijateljsku poruku iz 400/409 odgovora (duplikati / validacija)
function friendlyRegisterError(resp) {
  const data = resp?.data || {};
  const raw = (data.message || "").toString();

  // ModelState stil: { errors: { Username: [...], Email: [...] } }
  if (data.errors) {
    const e = data.errors;
    if (Array.isArray(e.Username) && e.Username.length) return e.Username[0];
    if (Array.isArray(e.Email) && e.Email.length) return e.Email[0];
    // fallback: spoji sve
    const all = Object.values(e).flat().filter(Boolean);
    if (all.length) return all.join(" ");
  }

  // Generičke poruke iz BE, prevedi ih ako se spominje username/email
  const low = raw.toLowerCase();
  if (low.includes("username") && (low.includes("exists") || low.includes("already") || low.includes("zauzet")))
    return "Korisničko ime je zauzeto.";
  if (low.includes("email") && (low.includes("exists") || low.includes("already") || low.includes("zauzet")))
    return "Email je već u upotrebi.";

  // Ako ništa posebno — vrati originalnu poruku, ili generičku
  return raw || "Registracija nije uspela.";
}

export default function RegisterForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: undefined,
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (p) => setForm((f) => ({ ...f, ...p }));

  const validate = () => {
    const u = form.username.trim();
    const e = form.email.trim();

    if (!u) { setErr("Unesite korisničko ime."); return false; }
    if (u.length < 3) { setErr("Korisničko ime mora imati najmanje 3 znaka."); return false; }

    if (!e) { setErr("Unesite email adresu."); return false; }
    if (!EMAIL_RE.test(e)) { setErr("Unesite ispravan email format."); return false; }

    if (!form.password) { setErr("Unesite lozinku."); return false; }
    if (form.password.length < 6) { setErr("Lozinka mora imati najmanje 6 karaktera."); return false; }

    if (form.password !== form.confirmPassword) {
      setErr("Lozinke se ne poklapaju.");
      return false;
    }

    if (form.image) {
      const f = form.image;
      if (!f.type.startsWith("image/")) { setErr("Profilna slika mora biti slikovna datoteka."); return false; }
      if (f.size > MAX_IMAGE_BYTES) { setErr("Profilna slika je prevelika (maks. 4MB)."); return false; }
    }

    setErr("");
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
      };

      const res = await registerUser(payload);

      if (res?.success) {
        setOk("Uspešna registracija. Preusmjeravam na prijavu…");
        setTimeout(() => nav("/login", { replace: true }), 800);
      } else {
        // Ako BE vrati success:false sa porukom
        setErr(res?.message || "Registracija nije uspela.");
      }
    } catch (e2) {
      // ⬇️ Ovde hvatamo 400 zbog duplikata username/email i pretvaramo u čitljivu poruku
      const status = e2?.response?.status;
      if (status === 400 || status === 409) {
        setErr(friendlyRegisterError(e2.response));
      } else {
        const apiMsg = e2?.response?.data?.message || e2?.message;
        setErr(apiMsg || "Greška pri registraciji.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.15)",
    background: "rgba(255,255,255,.06)",
    color: "#e5e7eb",
    outline: "none",
  };

  return (
    <form onSubmit={submit}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Registracija</h2>
        <div style={{ marginTop: 6, opacity: .85 }}>
          Već imaš nalog?{" "}
          <Link to="/login" style={{ color: "#60a5fa" }}>Prijavi se</Link>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label className="block" style={{ marginBottom: 6, fontWeight: 700 }}>Username</label>
          <input
            style={inputStyle}
            value={form.username}
            onChange={(e) => set({ username: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ marginBottom: 6, fontWeight: 700 }}>Email</label>
          <input
            type="email"
            style={inputStyle}
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ marginBottom: 6, fontWeight: 700 }}>Lozinka</label>
            <input
              type="password"
              style={inputStyle}
              value={form.password}
              onChange={(e) => set({ password: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ marginBottom: 6, fontWeight: 700 }}>Potvrda lozinke</label>
            <input
              type="password"
              style={inputStyle}
              value={form.confirmPassword}
              onChange={(e) => set({ confirmPassword: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ marginBottom: 6, fontWeight: 700 }}>Profilna slika (opcionalno)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => set({ image: e.target.files?.[0] })}
            style={{ color: "#cbd5e1" }}
          />
        </div>
      </div>

      {err && (
        <div
          style={{
            marginTop: 10,
            border: "1px solid rgba(248,113,113,.35)",
            background: "rgba(248,113,113,.12)",
            color: "#fecaca",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 14,
          }}
        >
          {err}
        </div>
      )}
      {ok && (
        <div
          style={{
            marginTop: 10,
            border: "1px solid rgba(16,185,129,.35)",
            background: "rgba(16,185,129,.12)",
            color: "#a7f3d0",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 14,
          }}
        >
          {ok}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-blue"
        style={{ width: "100%", marginTop: 14 }}
      >
        {loading ? "Kreiranje…" : "Kreiraj nalog"}
      </button>
    </form>
  );
}
