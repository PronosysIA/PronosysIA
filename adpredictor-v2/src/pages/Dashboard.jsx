import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";

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
    const h = {}; if (token) h["Authorization"] = `Bearer ${token}`;
    fetch("/api/dashboard-stats", { headers: h }).then(r => r.json()).then(d => setStats(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      {message && <div className="card-gold px-5 py-4 mb-10 animate-fadeIn"><p className="text-sm" style={{ color: "#4ADE80" }}>{message}</p></div>}

      {/* Header - lots of space */}
      <div className="mb-16 animate-fadeInUp">
        <h1 className="font-display text-4xl md:text-5xl text-white italic leading-tight">
          {user ? `Bonjour, ${user.name}.` : "Bienvenue."}
        </h1>
        <p className="mt-4 text-base" style={{ color: "#555" }}>
          {isGuest ? "Mode gratuit — 3 analyses disponibles." : "Analysez vos videos et predisez leur potentiel viral."}
        </p>
      </div>

      {/* Stats - more padding, more gap */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16 stagger-children">
        {[
          { label: "Analyses", value: loading ? "—" : stats.total_analyses },
          { label: "Restantes", value: loading ? "—" : stats.remaining === "illimite" ? "∞" : stats.remaining },
          { label: "Score moyen", value: loading ? "—" : stats.avg_score ? `${stats.avg_score}` : "—" },
          { label: "Plan", value: loading ? "—" : stats.plan, gold: stats.plan !== "Gratuit" },
        ].map((s, i) => (
          <div key={i} className="card p-6 animate-fadeInUp">
            <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#555" }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.gold ? "#C6A15B" : "white" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Upgrade - more breathing room */}
      {!loading && stats.plan === "Gratuit" && (
        <div className="card-gold p-10 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 animate-fadeInUp delay-200">
          <div>
            <h3 className="text-white text-xl font-semibold mb-2">Passez a Premium</h3>
            <p className="text-base" style={{ color: "#888" }}>9,99€/mois — Analyses illimitees, Generateur IA, Chatbot Video.</p>
          </div>
          <Link to="/dashboard/subscription" className="btn-gold text-sm flex-shrink-0 px-8 py-3">Voir les offres</Link>
        </div>
      )}

      {/* Analyse cards with access info */}
      <div className="mb-16">
        <p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#555" }}>Nouvelle analyse</p>
        <div className="grid md:grid-cols-2 gap-5">
          {(() => {
            const plan = user?.plan || "free";
            const canPubs = user?.is_admin || ["free", "premium_pubs", "premium_combo"].includes(plan);
            const canReseaux = user?.is_admin || ["free", "premium_reseaux", "premium_combo"].includes(plan);
            return (<>
              <div className={`group card p-10 animate-fadeInUp ${canPubs ? "cursor-pointer" : "opacity-50"}`} onClick={() => canPubs && (window.location.href = "/dashboard/pubs")}>
                <h3 className="text-white text-2xl font-display italic mb-3">Pubs Classiques</h3>
                <p className="text-sm mb-6" style={{ color: "#555" }}>Meta Ads, Google Ads, YouTube Ads et autres regies publicitaires.</p>
                {canPubs ? (
                  <span className="text-sm flex items-center gap-2 group-hover:gap-4 transition-all" style={{ color: "#C6A15B" }}>Lancer une analyse <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
                ) : (
                  <span className="text-xs flex items-center gap-2" style={{ color: "#F87171" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Plan Premium Power ou Combo requis
                  </span>
                )}
              </div>
              <div className={`group card p-10 animate-fadeInUp delay-100 ${canReseaux ? "cursor-pointer" : "opacity-50"}`} onClick={() => canReseaux && (window.location.href = "/dashboard/reseaux")}>
                <h3 className="text-white text-2xl font-display italic mb-3">Videos Reseaux</h3>
                <p className="text-sm mb-6" style={{ color: "#555" }}>TikTok, Instagram Reels, YouTube Shorts, Snapchat et autres.</p>
                {canReseaux ? (
                  <span className="text-sm flex items-center gap-2 group-hover:gap-4 transition-all" style={{ color: "#C6A15B" }}>Lancer une analyse <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
                ) : (
                  <span className="text-xs flex items-center gap-2" style={{ color: "#F87171" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Plan Premium Creator ou Combo requis
                  </span>
                )}
              </div>
            </>);
          })()}
        </div>
      </div>

      {/* Tools with access info */}
      <div className="mb-16">
        <p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#555" }}>Outils IA</p>
        {(() => {
          const plan = user?.plan || "free";
          const isPremium = user?.is_admin || ["premium_pubs", "premium_reseaux", "premium_combo"].includes(plan);
          const isCombo = user?.is_admin || plan === "premium_combo";
          const tools = [
            { label: "Generateur", desc: "Script video ameliore seconde par seconde, hooks viraux, musiques.", href: "/dashboard/generator", icon: "✨", unlocked: isPremium },
            { label: "Boosteur", desc: "Horaires optimaux, hashtags, captions et strategie cross-posting.", href: "/dashboard/booster", icon: "🚀", unlocked: isPremium },
            { label: "Chatbot Video", desc: "Discutez avec l'IA pour creer et generer la video parfaite.", href: "/dashboard/chatbot", icon: "🤖", unlocked: isCombo, comboOnly: true },
          ];
          return (
            <div className="grid md:grid-cols-3 gap-5 stagger-children">
              {tools.map((tool, i) => (
                <div key={i} className={`group card p-8 animate-fadeInUp ${tool.unlocked ? "cursor-pointer" : "opacity-40"}`} onClick={() => tool.unlocked && (window.location.href = tool.href)}>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl">{tool.icon}</span>
                    {tool.unlocked ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C6A15B" }} /> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  </div>
                  <h3 className="text-white text-lg font-medium mb-2">{tool.label}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "#555" }}>{tool.desc}</p>
                  {!tool.unlocked && <p className="text-xs" style={{ color: "#C6A15B" }}>{tool.comboOnly ? "Combo Elite requis" : "Premium requis"}</p>}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </DashboardLayout>
  );
}