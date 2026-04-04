// This file contains: AnalysesHistory
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";


function formatViews(n) { if (!n) return "N/A"; if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n/1e3).toFixed(n>=1e4?0:1)}K`; return n.toString(); }

export default function AnalysesHistory() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isPremium = user && (user.is_admin || ["premium_pubs", "premium_reseaux", "premium_combo"].includes(user.plan));

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch("/api/analyses", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.status === 401) { navigate("/login"); return null; }
        if (!r.ok) { setFetchError("Erreur de chargement des analyses."); return null; }
        return r.json();
      })
      .then(d => { if (d) { setAnalyses(d.analyses || []); setTotal(d.total || 0); } })
      .catch(() => setFetchError("Impossible de joindre le serveur."))
      .finally(() => setLoading(false));
  }, []);
  const filtered = analyses.filter(a => filter === "all" || a.category === filter);
  const formatDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const scoreColor = (s) => s >= 75 ? "#4ADE80" : s >= 50 ? "#C6A15B" : "#F87171";

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fadeInUp">
        <div><h1 className="font-display text-3xl italic text-white">Mes Analyses.</h1><p className="mt-2 text-sm" style={{ color: "#888" }}>{total} analyse{total > 1 ? "s" : ""}</p></div>
        <div className="flex gap-2">{["all", "pubs", "reseaux"].map(f => <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-lg text-sm transition-all" style={filter === f ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { color: "#888", border: "1px solid #1C1C1C" }}>{f === "all" ? "Toutes" : f === "pubs" ? "Pubs" : "Reseaux"}</button>)}</div>
      </div>
      {fetchError && <div className="card px-5 py-4 mb-8" style={{ color: "#F87171", borderColor: "rgba(248,113,113,0.2)" }}><p className="text-sm">{fetchError}</p></div>}
      {filtered.length === 0 && !fetchError && <div className="card p-14 text-center animate-fadeInUp"><p className="text-white font-medium mb-2">Aucune analyse</p><p className="text-sm mb-6" style={{ color: "#888" }}>Lancez votre premiere analyse depuis la page Pubs ou Reseaux.</p><Link to="/dashboard/pubs" className="btn-gold text-sm">Analyser</Link></div>}
      {filtered.length > 0 && <div className="space-y-3 stagger-children">
        {filtered.map(a => (
          <div key={a.id} className="card overflow-hidden animate-fadeInUp">
            <div className="p-6 cursor-pointer" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold" style={{ color: scoreColor(a.global_score) }}>{a.global_score !== null ? Math.round(a.global_score) : "?"}</span>
                  <div><p className="text-white text-sm">{a.filename}</p><p className="text-xs" style={{ color: "#888" }}>{formatDate(a.created_at)}</p></div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expanded === a.id ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
            {expanded === a.id && (
              <div className="px-6 pb-6 space-y-4" style={{ borderTop: "1px solid #1C1C1C" }}>
                {a.summary && <div className="pt-4"><p className="text-sm" style={{ color: "#888" }}>{a.summary}</p></div>}
                {a.criteria_scores?.length > 0 && <div className="grid grid-cols-2 gap-2">{a.criteria_scores.map((c, i) => <div key={i} className="p-3 rounded-lg" style={{ background: "#0E0E0E" }}><div className="flex justify-between mb-1"><span className="text-xs text-white">{c.label}</span><span className="text-xs" style={{ color: scoreColor(c.score) }}>{c.score}</span></div><div className="h-0.5 rounded-full" style={{ background: "#1C1C1C" }}><div className="h-full rounded-full" style={{ width: `${c.score}%`, background: scoreColor(c.score) }} /></div></div>)}</div>}
                {a.views_prediction && <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "#0E0E0E" }}><span className="text-xs" style={{ color: "#888" }}>Vues:</span><span className="font-bold" style={{ color: scoreColor(a.global_score) }}>{formatViews(a.views_prediction.views_min)}</span><span style={{ color: "#666" }}>→</span><span className="font-bold" style={{ color: scoreColor(a.global_score) }}>{formatViews(a.views_prediction.views_max)}</span></div>}
                {a.strengths?.length > 0 && <div>{a.strengths.map((s, i) => <p key={i} className="text-xs mb-1" style={{ color: "#888" }}>+ {s}</p>)}</div>}
                {a.weaknesses?.length > 0 && <div>{a.weaknesses.map((w, i) => <p key={i} className="text-xs mb-1" style={{ color: "#888" }}>− {w}</p>)}</div>}
                {!isPremium && (
                  <div className="pt-2">
                    <div className="h-px mb-4" style={{ background: "rgba(198,161,91,0.1)" }} />
                    <Link to="/dashboard/subscription" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg, #C6A15B, #A8863C)", color: "#0A0A0A", fontWeight: "600", fontSize: "13px", borderRadius: "8px", textDecoration: "none" }}>
                      Exploiter le plein potentiel
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>}
    </DashboardLayout>
  );
}