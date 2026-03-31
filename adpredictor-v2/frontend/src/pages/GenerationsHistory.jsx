import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";

export default function GenerationsHistory() {
  const navigate = useNavigate();
  const [generations, setGenerations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => { if (!token) { navigate("/login"); return; } fetch("/api/generations", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setGenerations(d.generations || []); setTotal(d.total || 0); }).finally(() => setLoading(false)); }, []);
  const formatDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fadeInUp">
        <div><h1 className="font-display text-3xl italic text-white">Mes Generations.</h1><p className="mt-2 text-sm" style={{ color: "#555" }}>{total} generation{total > 1 ? "s" : ""}</p></div>
        <Link to="/dashboard/generator" className="btn-gold text-sm">Nouvelle generation</Link>
      </div>
      {generations.length === 0 && <div className="card p-14 text-center animate-fadeInUp"><p className="text-white font-medium mb-2">Aucune generation</p><p className="text-sm mb-6" style={{ color: "#555" }}>Utilisez le Generateur IA.</p><Link to="/dashboard/generator" className="btn-gold text-sm">Generer</Link></div>}
      {generations.length > 0 && <div className="space-y-3 stagger-children">
        {generations.map(g => (
          <div key={g.id} className="card overflow-hidden animate-fadeInUp">
            <div className="p-6 cursor-pointer" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
              <div className="flex items-center justify-between">
                <div><p className="text-white text-sm font-medium">{g.title || "Generation"}</p><p className="text-xs mt-1" style={{ color: "#555" }}>{g.filename} · {formatDate(g.created_at)}</p></div>
                <div className="flex items-center gap-3">{g.target_score && <span className="text-xs" style={{ color: "#4ADE80" }}>Vise: {g.target_score}</span>}<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expanded === g.id ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg></div>
              </div>
            </div>
            {expanded === g.id && g.full_result && (
              <div className="px-6 pb-6 space-y-4" style={{ borderTop: "1px solid #1C1C1C" }}>
                {g.full_result.video_analysis && <div className="pt-4 p-4 rounded-lg" style={{ background: "#0E0E0E" }}><p className="text-xs mb-2" style={{ color: "#C6A15B" }}>Analyse</p><p className="text-xs" style={{ color: "#888" }}>{g.full_result.video_analysis.what_i_see}</p></div>}
                {g.full_result.concept && <p className="text-sm" style={{ color: "#888" }}>{g.full_result.concept}</p>}
                {g.full_result.script && <div><p className="text-xs mb-2" style={{ color: "#C6A15B" }}>Script</p>{g.full_result.script.map((s, i) => <div key={i} className="flex gap-2 text-xs mb-1"><span style={{ color: "#C6A15B" }}>{s.timestamp}</span><span style={{ color: "#555" }}>{s.visual}</span></div>)}</div>}
                {g.full_result.viral_hooks_alternatives && <div className="flex flex-wrap gap-2">{g.full_result.viral_hooks_alternatives.map((h, i) => <span key={i} className="tag text-xs cursor-pointer" style={{ color: "#C6A15B", borderColor: "rgba(198,161,91,0.15)" }} onClick={() => navigator.clipboard.writeText(h)}>{h}</span>)}</div>}
                {g.full_result.estimated_improvement && <div className="p-4 rounded-lg" style={{ background: "#0E0E0E" }}><p className="text-xs" style={{ color: "#4ADE80" }}>{g.full_result.estimated_improvement}</p></div>}
              </div>
            )}
          </div>
        ))}
      </div>}
    </DashboardLayout>
  );
}