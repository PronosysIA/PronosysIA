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
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => { if (!token) { navigate("/login"); return; } fetch("/api/analyses", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setAnalyses(d.analyses || []); setTotal(d.total || 0); }).finally(() => setLoading(false)); }, []);
  const filtered = analyses.filter(a => filter === "all" || a.category === filter);
  const formatDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const scoreColor = (s) => s >= 75 ? "#4ADE80" : s >= 50 ? "#C6A15B" : "#F87171";

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fadeInUp">
        <div><h1 className="font-display text-3xl italic text-white">Mes Analyses.</h1><p className="mt-2 text-sm" style={{ color: "#555" }}>{total} analyse{total > 1 ? "s" : ""}</p></div>
        <div className="flex gap-2">{["all", "pubs", "reseaux"].map(f => <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-lg text-sm transition-all" style={filter === f ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { color: "#555", border: "1px solid #1C1C1C" }}>{f === "all" ? "Toutes" : f === "pubs" ? "Pubs" : "Reseaux"}</button>)}</div>
      </div>
      {filtered.length === 0 && <div className="card p-14 text-center animate-fadeInUp"><p className="text-white font-medium mb-2">Aucune analyse</p><p className="text-sm mb-6" style={{ color: "#555" }}>Lancez votre premiere analyse.</p><Link to="/dashboard/pubs" className="btn-gold text-sm">Analyser</Link></div>}
      {filtered.length > 0 && <div className="space-y-3 stagger-children">
        {filtered.map(a => (
          <div key={a.id} className="card overflow-hidden animate-fadeInUp">
            <div className="p-6 cursor-pointer" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold" style={{ color: scoreColor(a.global_score) }}>{a.global_score !== null ? Math.round(a.global_score) : "?"}</span>
                  <div><p className="text-white text-sm">{a.filename}</p><p className="text-xs" style={{ color: "#555" }}>{formatDate(a.created_at)}</p></div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expanded === a.id ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
            {expanded === a.id && (
              <div className="px-6 pb-6 space-y-4" style={{ borderTop: "1px solid #1C1C1C" }}>
                {a.summary && <div className="pt-4"><p className="text-sm" style={{ color: "#888" }}>{a.summary}</p></div>}
                {a.criteria_scores?.length > 0 && <div className="grid grid-cols-2 gap-2">{a.criteria_scores.map((c, i) => <div key={i} className="p-3 rounded-lg" style={{ background: "#0E0E0E" }}><div className="flex justify-between mb-1"><span className="text-xs text-white">{c.label}</span><span className="text-xs" style={{ color: scoreColor(c.score) }}>{c.score}</span></div><div className="h-0.5 rounded-full" style={{ background: "#1C1C1C" }}><div className="h-full rounded-full" style={{ width: `${c.score}%`, background: scoreColor(c.score) }} /></div></div>)}</div>}
                {a.views_prediction && <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "#0E0E0E" }}><span className="text-xs" style={{ color: "#555" }}>Vues:</span><span className="font-bold" style={{ color: scoreColor(a.global_score) }}>{formatViews(a.views_prediction.views_min)}</span><span style={{ color: "#333" }}>→</span><span className="font-bold" style={{ color: scoreColor(a.global_score) }}>{formatViews(a.views_prediction.views_max)}</span></div>}
                {a.strengths?.length > 0 && <div>{a.strengths.map((s, i) => <p key={i} className="text-xs mb-1" style={{ color: "#888" }}>+ {s}</p>)}</div>}
                {a.weaknesses?.length > 0 && <div>{a.weaknesses.map((w, i) => <p key={i} className="text-xs mb-1" style={{ color: "#888" }}>− {w}</p>)}</div>}
              </div>
            )}
          </div>
        ))}
      </div>}
    </DashboardLayout>
  );
}