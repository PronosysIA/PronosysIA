import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LOGO from "../logo.js";
export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur"); setLoading(false); return; }
      localStorage.setItem("token", data.access_token); localStorage.setItem("user", JSON.stringify(data.user)); navigate("/dashboard");
    } catch { setError("Erreur de connexion."); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0A0A0A" }}>
      <div className="w-full max-w-sm animate-fadeInUp">
        <div className="mb-12"><Link to="/"><img src={LOGO} alt="PronosysIA" className="h-8" /></Link></div>
        <h1 className="font-display text-3xl italic text-white mb-2">Bon retour.</h1>
        <p className="text-sm mb-10" style={{ color: "#555" }}>Connectez-vous a votre compte</p>
        {error && <div className="card px-4 py-3 mb-6 text-sm" style={{ color: "#F87171" }}>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#555" }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@email.com" className="input-dark" /></div>
          <div><label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#555" }}>Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input-dark" /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">{loading ? "Connexion..." : "Se connecter"}</button>
        </form>
        <p className="text-sm mt-8" style={{ color: "#555" }}>Pas de compte ? <Link to="/register" style={{ color: "#C6A15B" }}>Creer un compte</Link></p>
      </div>
    </div>
  );
}