import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useLang.jsx";

const LogoMark = () => (
  <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, rgba(198,161,91,0.15) 0%, rgba(198,161,91,0.05) 100%)", border: "1px solid rgba(198,161,91,0.25)", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  </div>
);

export default function Register() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const parseJsonSafely = async (response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(t("auth_password_min"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await parseJsonSafely(res);
      if (!res.ok) {
        setError(res.status >= 500 ? t("auth_connection_error") : data.detail || t("common_error"));
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError(t("auth_generic_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#090909", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(198,161,91,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(198,161,91,0.018) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(198,161,91,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "380px", margin: "auto", padding: "40px 24px", position: "relative", zIndex: 1 }} className="animate-fadeInUp">
        <div style={{ marginBottom: "44px" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <LogoMark />
            <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em", color: "white" }}>Pronosys<span style={{ color: "#C6A15B" }}>IA</span></div>
          </Link>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "20px", height: "1px", background: "#C6A15B" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>{t("register_badge")}</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontStyle: "italic", color: "white", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{t("register_heading")}</h1>
          <p style={{ marginTop: "8px", fontSize: "13px", color: "#333" }}>{t("register_subtitle")}</p>
        </div>

        {error && <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#F87171" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2A2A2A", marginBottom: "8px" }}>{t("register_name")}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t("register_name_placeholder")} className="input-dark" />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2A2A2A", marginBottom: "8px" }}>{t("register_email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t("auth_email_placeholder")} className="input-dark" />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2A2A2A", marginBottom: "8px" }}>{t("register_password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t("auth_password_placeholder")} className="input-dark" />
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "#1A1A1A" : "white", color: "#090909", fontWeight: 700, fontSize: "14px", borderRadius: "9px", border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s ease", letterSpacing: "-0.01em" }}>
            {loading ? t("common_loading") : t("register_btn")}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "13px", color: "#2A2A2A", textAlign: "center" }}>
          {t("register_has_account")} {" "}
          <Link to="/login" style={{ color: "#C6A15B", fontWeight: 600, textDecoration: "none" }}>{t("register_login")}</Link>
        </p>
      </div>
    </div>
  );
}
