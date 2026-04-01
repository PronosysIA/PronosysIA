import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";

// Section header with gold accent
function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
      <div style={{ width: "18px", height: "1px", background: "#C6A15B", flexShrink: 0 }} />
      <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333" }}>
        {children}
      </span>
    </div>
  );
}

// Stat card
function StatCard({ label, value, gold, delay }) {
  return (
    <div
      className={`animate-fadeInUp`}
      style={{
        animationDelay: delay,
        background: "#0C0C0C",
        border: "1px solid #161616",
        borderRadius: "12px",
        padding: "20px 18px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "50px", height: "50px",
        background: "linear-gradient(225deg, rgba(198,161,91,0.07) 0%, transparent 65%)",
      }} />
      <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2A2A2A", marginBottom: "10px" }}>
        {label}
      </p>
      <p style={{ fontSize: "28px", fontWeight: 800, color: gold ? "#C6A15B" : "white", lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </p>
      {/* Bottom gold line */}
      <div style={{ marginTop: "14px", height: "1px", background: "#161616" }} />
      <div style={{ height: "1px", background: gold ? "linear-gradient(90deg, #C6A15B, transparent)" : "linear-gradient(90deg, #222, transparent)" }} />
    </div>
  );
}

// Analysis card with unique design
function AnalysisCard({ title, desc, href, available, lockMsg, delay }) {
  return (
    <div
      className="animate-fadeInUp"
      style={{
        animationDelay: delay,
        background: "#0C0C0C",
        border: "1px solid #161616",
        borderRadius: "14px",
        padding: "28px 24px",
        cursor: available ? "pointer" : "default",
        opacity: available ? 1 : 0.45,
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => available && (window.location.href = href)}
      onMouseEnter={e => {
        if (!available) return;
        e.currentTarget.style.borderColor = "rgba(198,161,91,0.2)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#161616";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top gold line on hover */}
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%",
        height: "1px",
        background: "linear-gradient(90deg, transparent, #C6A15B, transparent)",
        opacity: available ? 0.4 : 0,
      }} />

      {/* Corner triangle accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "70px", height: "70px",
        background: "linear-gradient(225deg, rgba(198,161,91,0.06) 0%, transparent 65%)",
      }} />

      <h3 style={{ fontSize: "20px", fontWeight: 700, color: "white", marginBottom: "10px", letterSpacing: "-0.02em" }}>
        {title}
      </h3>
      <p style={{ fontSize: "13px", color: "#333", lineHeight: 1.6, marginBottom: "20px" }}>{desc}</p>

      {available ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#C6A15B", fontSize: "13px", fontWeight: 600 }}>
          <span>Lancer une analyse</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F87171", fontSize: "12px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          {lockMsg}
        </div>
      )}
    </div>
  );
}

// Tool card
function ToolCard({ label, desc, href, icon, unlocked, comboOnly, delay }) {
  return (
    <div
      className="animate-fadeInUp"
      style={{
        animationDelay: delay,
        background: "#0C0C0C",
        border: "1px solid #161616",
        borderRadius: "12px",
        padding: "22px 20px",
        cursor: unlocked ? "pointer" : "default",
        opacity: unlocked ? 1 : 0.4,
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => unlocked && (window.location.href = href)}
      onMouseEnter={e => {
        if (!unlocked) return;
        e.currentTarget.style.borderColor = "rgba(198,161,91,0.18)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#161616";
        e.currentTarget.style.transform = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <span style={{ fontSize: "22px", lineHeight: 1 }}>{icon}</span>
        {unlocked
          ? <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C6A15B", boxShadow: "0 0 6px rgba(198,161,91,0.4)" }} />
          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        }
      </div>
      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "6px", letterSpacing: "-0.01em" }}>{label}</h3>
      <p style={{ fontSize: "12px", color: "#2E2E2E", lineHeight: 1.6, marginBottom: unlocked ? "0" : "10px" }}>{desc}</p>
      {!unlocked && (
        <p style={{ fontSize: "11px", color: "#C6A15B", fontWeight: 600 }}>
          {comboOnly ? "Combo Elite requis" : "Premium requis"}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isGuest = !user;
  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState({ total_analyses: 0, remaining: "...", avg_score: null, plan: "..." });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("payment") === "success") setMessage("Paiement reussi !");
    const h = {};
    if (token) h["Authorization"] = `Bearer ${token}`;
    fetch("/api/dashboard-stats", { headers: h })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const plan = user?.plan || "free";
  const canPubs = user?.is_admin || ["free", "premium_pubs", "premium_combo"].includes(plan);
  const canReseaux = user?.is_admin || ["free", "premium_reseaux", "premium_combo"].includes(plan);
  const isPremium = user?.is_admin || ["premium_pubs", "premium_reseaux", "premium_combo"].includes(plan);
  const isCombo = user?.is_admin || plan === "premium_combo";

  return (
    <DashboardLayout>
      {/* Payment success */}
      {message && (
        <div className="animate-fadeIn" style={{
          background: "rgba(74,222,128,0.06)",
          border: "1px solid rgba(74,222,128,0.15)",
          borderRadius: "10px",
          padding: "14px 18px",
          marginBottom: "32px",
          fontSize: "13px",
          color: "#4ADE80",
        }}>
          {message}
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div className="animate-fadeInUp" style={{ marginBottom: "40px" }}>
        {/* Gold accent bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "32px", height: "2px", background: "linear-gradient(90deg, #C6A15B, rgba(198,161,91,0.3))", borderRadius: "1px" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#C6A15B", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            PronosysIA
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(32px, 5vw, 48px)",
          color: "white",
          fontStyle: "italic",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}>
          {user ? `Bonjour, ${user.name}.` : "Bienvenue."}
        </h1>
        <p style={{ marginTop: "10px", fontSize: "13px", color: "#333", lineHeight: 1.5 }}>
          {isGuest ? "Mode gratuit — 3 analyses disponibles." : "Analysez vos contenus et predisez leur potentiel viral."}
        </p>
      </div>

      {/* ─── STATS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "40px" }}
        className="sm:grid-cols-4">
        <StatCard label="Analyses" value={loading ? "—" : stats.total_analyses} delay="0ms" />
        <StatCard label="Restantes" value={loading ? "—" : stats.remaining === "illimite" ? "∞" : stats.remaining} delay="60ms" />
        <StatCard label="Score moyen" value={loading ? "—" : stats.avg_score ? `${stats.avg_score}` : "—"} delay="120ms" />
        <StatCard label="Plan" value={loading ? "—" : stats.plan} gold={stats.plan !== "Gratuit"} delay="180ms" />
      </div>

      {/* ─── UPGRADE BANNER ─── */}
      {!loading && stats.plan === "Gratuit" && (
        <div className="animate-fadeInUp delay-200" style={{
          background: "rgba(198,161,91,0.04)",
          border: "1px solid rgba(198,161,91,0.12)",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative corner */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "100px", height: "100px",
            background: "radial-gradient(circle at top right, rgba(198,161,91,0.08), transparent 70%)",
          }} />
          <div>
            <div style={{ fontSize: "10px", color: "#C6A15B", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
              Passer a Premium
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "white", marginBottom: "6px" }}>
              Debloquez tout PronosysIA
            </h3>
            <p style={{ fontSize: "13px", color: "#444" }}>
              Analyses illimitees, Generateur IA, Chatbot Video — a partir de 9,99€/mois.
            </p>
          </div>
          <Link to="/dashboard/subscription" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#C6A15B", color: "white",
            padding: "10px 20px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 700,
            textDecoration: "none",
            alignSelf: "flex-start",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#A8864A"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#C6A15B"; e.currentTarget.style.transform = "none"; }}
          >
            Voir les offres
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      )}

      {/* ─── ANALYSES ─── */}
      <div style={{ marginBottom: "40px" }}>
        <SectionLabel>Nouvelle analyse</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "10px" }} className="md:grid-cols-2">
          <AnalysisCard
            title="Pubs Classiques"
            desc="Meta Ads, Google Ads, YouTube Ads et autres regies publicitaires."
            href="/dashboard/pubs"
            available={canPubs}
            lockMsg="Plan Power ou Combo requis"
            delay="0ms"
          />
          <AnalysisCard
            title="Videos Reseaux"
            desc="TikTok, Instagram Reels, YouTube Shorts, Snapchat et autres."
            href="/dashboard/reseaux"
            available={canReseaux}
            lockMsg="Plan Creator ou Combo requis"
            delay="80ms"
          />
        </div>
      </div>

      {/* ─── OUTILS IA ─── */}
      <div>
        <SectionLabel>Outils IA</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "10px" }} className="sm:grid-cols-3">
          <ToolCard
            label="Generateur"
            desc="Script video ameliore seconde par seconde, hooks viraux, musiques."
            href="/dashboard/generator"
            icon="✨"
            unlocked={isPremium}
            delay="0ms"
          />
          <ToolCard
            label="Boosteur"
            desc="Horaires optimaux, hashtags, captions et strategie cross-posting."
            href="/dashboard/booster"
            icon="🚀"
            unlocked={isPremium}
            delay="60ms"
          />
          <ToolCard
            label="Chatbot Video"
            desc="Discutez avec l'IA pour creer et generer la video parfaite."
            href="/dashboard/chatbot"
            icon="🤖"
            unlocked={isCombo}
            comboOnly
            delay="120ms"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
