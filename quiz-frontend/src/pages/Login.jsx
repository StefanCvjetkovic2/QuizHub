import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserFromToken } from "../models/auth";

export default function Login() {
  const [userNameOrEmail, setUserNameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!userNameOrEmail || !password) {
      setErr("Unesite korisničko ime (ili email) i lozinku.");
      return;
    }
    try {
      setBusy(true);
      await login({ userNameOrEmail, password });
      const u = getUserFromToken();
      navigate(u?.isAdmin ? "/admin" : "/");
    } catch (e) {
      setErr(e.message || "Prijava nije uspela.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Prijava</h1>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Korisničko ime ili email</label>
            <input value={userNameOrEmail} onChange={(e)=>setUserNameOrEmail(e.target.value)} autoFocus/>
          </div>
          <div className="form-group">
            <label>Lozinka</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
          </div>
          <div className="form-actions">
            <button className="btn btn--primary btn--full" disabled={busy}>
              {busy ? "Prijavljujem..." : "Prijavi se"}
            </button>
          </div>
        </form>
        {err && <div className="error">{err}</div>}
        <p style={{ marginTop: 14, textAlign: "center" }}>
          Nemaš nalog? <Link className="link" to="/register">Registruj se</Link>
        </p>
      </div>
    </div>
  );
}
