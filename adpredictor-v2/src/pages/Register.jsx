import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LOGO from "../logo.js";
export default function Register() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault(); if (password.length < 6) { setError("6 caracteres minimum."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur"); setLoading(false); return; }
      localStorage.setItem("token", data.access_token); localStorage.setItem("user", JSON.stringify(data.user)); navigate("/dashboard");
    } catch { setError("Erreur."); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0A0A0A" }}>
      <div className="w-full max-w-sm animate-fadeInUp">
        <div className="mb-12"><Link to="/"><img src={LOGO} alt="PronosysIA" className="h-8" /></Link></div>
        <h1 className="font-display text-3xl italic text-white mb-2">Creer un compte.</h1>
        <p className="text-sm mb-10" style={{ color: "#555" }}>3 analyses gratuites — Sans CB</p>
        {error && <div className="card px-4 py-3 mb-6 text-sm" style={{ color: "#F87171" }}>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#555" }}>Prenom</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Noah" className="input-dark" /></div>
          <div><label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#555" }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@email.com" className="input-dark" /></div>
          <div><label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#555" }}>Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="6 caracteres minimum" className="input-dark" /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">{loading ? "Creation..." : "Creer mon compte"}</button>
        </form>
        <p className="text-sm mt-8" style={{ color: "#555" }}>Deja inscrit ? <Link to="/login" style={{ color: "#C6A15B" }}>Se connecter</Link></p>
      </div>
    </div>
  );
}