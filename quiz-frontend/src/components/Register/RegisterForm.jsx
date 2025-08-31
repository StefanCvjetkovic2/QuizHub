import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/userService";

export default function RegisterForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "", image: undefined });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (p) => setForm((f) => ({ ...f, ...p }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk(""); setLoading(true);

    if (form.password !== form.confirmPassword) {
      setErr("Lozinke se ne poklapaju.");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser(form);
      if (res?.success) {
        setOk("Uspešna registracija. Sada se možete prijaviti.");
        setTimeout(() => nav("/login", { replace: true }), 700);
      } else {
        setErr(res?.message || "Registracija nije uspela.");
      }
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Greška pri registraciji.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">Registracija</h2>

      <label className="block mb-2 font-medium text-gray-700">Username</label>
      <input className="w-full px-4 py-2 border rounded-md" value={form.username}
             onChange={(e) => set({ username: e.target.value })} required />

      <label className="block mt-4 mb-2 font-medium text-gray-700">Email</label>
      <input type="email" className="w-full px-4 py-2 border rounded-md" value={form.email}
             onChange={(e) => set({ email: e.target.value })} required />

      <label className="block mt-4 mb-2 font-medium text-gray-700">Password</label>
      <input type="password" className="w-full px-4 py-2 border rounded-md" value={form.password}
             onChange={(e) => set({ password: e.target.value })} required />

      <label className="block mt-4 mb-2 font-medium text-gray-700">Confirm Password</label>
      <input type="password" className="w-full px-4 py-2 border rounded-md" value={form.confirmPassword}
             onChange={(e) => set({ confirmPassword: e.target.value })} required />

      <label className="block mt-4 mb-2 font-medium text-gray-700">Profile image (optional)</label>
      <input type="file" accept="image/*" onChange={(e) => set({ image: e.target.files?.[0] })} />

      {err && <div className="text-red-600 mt-4">{err}</div>}
      {ok && <div className="text-green-600 mt-4">{ok}</div>}

      <button type="submit" disabled={loading}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
        {loading ? "Kreiranje..." : "Kreiraj nalog"}
      </button>

      <p className="mt-4 text-center text-gray-600">
        Već imate nalog?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">Prijavite se</Link>
      </p>
    </form>
  );
}
