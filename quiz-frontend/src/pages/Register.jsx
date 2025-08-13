import { useState } from "react";
import { registerUser } from "../services/auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState("");
  const [err, setErr]           = useState("");
  const [ok, setOk]             = useState("");
  const [busy, setBusy]         = useState(false);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setOk("");
    if (!username || username.length < 3) return setErr("Username mora imati bar 3 karaktera.");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return setErr("Unesi ispravan email.");
    if (!password || password.length < 6) return setErr("Lozinka mora imati bar 6 karaktera.");
    if (password !== confirm) return setErr("Lozinke se ne poklapaju.");

    const fd = new FormData();
    fd.append("Username", username);
    fd.append("Email", email);
    fd.append("Password", password);
    if (fullName) fd.append("FullName", fullName);
    if (file) fd.append("ProfilePicture", file);

    try {
      setBusy(true);
      const res = await registerUser(fd);
      if (res?.success) {
        setOk("Uspešna registracija! Sada se možete prijaviti.");
        setUsername(""); setFullName(""); setEmail(""); setPassword(""); setConfirm("");
        setFile(null); setPreview("");
      } else setErr(res?.message || "Registracija nije uspela.");
    } catch (e) {
      setErr(e.message || "Registracija nije uspela.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Registracija</h1>
        <form onSubmit={onSubmit}>
          <div className="form-group"><label>Korisničko ime</label><input value={username} onChange={e=>setUsername(e.target.value)} /></div>
          <div className="form-group"><label>Puno ime (opciono)</label><input value={fullName} onChange={e=>setFullName(e.target.value)} /></div>
          <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div className="form-group"><label>Lozinka</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <div className="form-group"><label>Potvrdi lozinku</label><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} /></div>
          <div className="form-group">
            <label>Profilna slika (opciono)</label>
            <input type="file" accept="image/*" onChange={onPickFile} />
            {preview && <div className="preview"><img src={preview} alt="preview" width="36" height="36" style={{borderRadius:8,objectFit:"cover"}}/><span>{file?.name}</span></div>}
          </div>
           <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={busy}
            >
              {busy ? "Registrujem..." : "Registruj se"}
            </button>
          </div>
        </form>
        {err && <div className="error">{err}</div>}
        {ok && <div className="success">{ok}</div>}
        <a className="link" href="/">Nazad na početnu</a>
      </div>
    </div>
  );
}
