import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LogoMark = () => (
  <div style={{
    width: "40px", height: "40px",
    background: "linear-gradient(135deg, rgba(198,161,91,0.15) 0%, rgba(198,161,91,0.05) 100%)",
    border: "1px solid rgba(198,161,91,0.25)",
    borderRadius: "11px",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  </div>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur"); setLoading(false); return; }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch { setError("Erreur de connexion."); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#090909", position: "relative", overflow: "hidden" }}>
      {/* Background gold grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(198,161,91,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(198,161,91,0.018) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(198,161,91,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%", maxWidth: "380px",
        margin: "auto",
        padding: "40px 24px",
        position: "relative",
        zIndex: 1,
      }} className="animate-fadeInUp">
        {/* Brand */}
        <div style={{ marginBottom: "44px" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <LogoMark />
            <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em", color: "white" }}>
              Pronosys<span style={{ color: "#C6A15B" }}>IA</span>
            </div>
          </Link>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "20px", height: "1px", background: "#C6A15B" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>Connexion</span>
          </div>
          <h1 style={{ fontFamily: "'Palatino Linotype', 'Palatino', Georgia, serif", fontSize: "32px", fontStyle: "italic", color: "white", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Bon retour.
          </h1>
          <p style={{ marginTop: "8px", fontSize: "13px", color: "#333" }}>Connectez-vous a votre compte</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.15)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "#F87171",
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2A2A2A", marginBottom: "8px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className="input-dark"
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2A2A2A", marginBottom: "8px" }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input-dark"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: loading ? "#1A1A1A" : "white",
              color: "#090909",
              fontWeight: 700,
              fontSize: "14px",
              borderRadius: "9px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "13px", color: "#2A2A2A", textAlign: "center" }}>
          Pas de compte ?{" "}
          <Link to="/register" style={{ color: "#C6A15B", fontWeight: 600, textDecoration: "none" }}>
            Creer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
