import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { useTranslation } from "../i18n/useLang.jsx";

export default function GenerationsHistory() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch("/api/generations", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d) => { setGenerations(d.generations || []); setTotal(d.total || 0); }).finally(() => setLoading(false));
  }, [navigate, token]);

  const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "fr-FR";
  const formatDate = (iso) => new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const suffix = total > 1 ? "s" : "";

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fadeInUp"><div><h1 className="font-display text-3xl italic text-white">{t("history_gens_title")}</h1><p className="mt-2 text-sm" style={{ color: "#555" }}>{t("history_generation_count_label", { count: total, suffix })}</p></div><Link to="/dashboard/generator" className="btn-gold text-sm">{t("history_new_generation")}</Link></div>
      {generations.length === 0 && <div className="card p-14 text-center animate-fadeInUp"><p className="text-white font-medium mb-2">{t("history_no_generation")}</p><p className="text-sm mb-6" style={{ color: "#555" }}>{t("history_use_generator")}</p><Link to="/dashboard/generator" className="btn-gold text-sm">{t("history_generate")}</Link></div>}
      {generations.length > 0 && <div className="space-y-3 stagger-children">{generations.map((generation) => <div key={generation.id} className="card overflow-hidden animate-fadeInUp"><div className="p-6 cursor-pointer" onClick={() => setExpanded(expanded === generation.id ? null : generation.id)}><div className="flex items-center justify-between"><div><p className="text-white text-sm font-medium">{generation.title || t("history_generate")}</p><p className="text-xs mt-1" style={{ color: "#555" }}>{generation.filename} - {formatDate(generation.created_at)}</p></div><div className="flex items-center gap-3">{generation.target_score && <span className="text-xs" style={{ color: "#4ADE80" }}>{t("history_target")}: {generation.target_score}</span>}<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expanded === generation.id ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg></div></div></div>{expanded === generation.id && generation.full_result && <div className="px-6 pb-6 space-y-4" style={{ borderTop: "1px solid #1C1C1C" }}>{generation.full_result.video_analysis && <div className="pt-4 p-4 rounded-lg" style={{ background: "#0E0E0E" }}><p className="text-xs mb-2" style={{ color: "#C6A15B" }}>{t("history_analysis")}</p><p className="text-xs" style={{ color: "#888" }}>{generation.full_result.video_analysis.what_i_see}</p></div>}{generation.full_result.concept && <p className="text-sm" style={{ color: "#888" }}>{generation.full_result.concept}</p>}{generation.full_result.script && <div><p className="text-xs mb-2" style={{ color: "#C6A15B" }}>{t("history_script")}</p>{generation.full_result.script.map((step, i) => <div key={i} className="flex gap-2 text-xs mb-1"><span style={{ color: "#C6A15B" }}>{step.timestamp}</span><span style={{ color: "#555" }}>{step.visual}</span></div>)}</div>}{generation.full_result.viral_hooks_alternatives && <div className="flex flex-wrap gap-2">{generation.full_result.viral_hooks_alternatives.map((hook, i) => <span key={i} className="tag text-xs cursor-pointer" style={{ color: "#C6A15B", borderColor: "rgba(198,161,91,0.15)" }} onClick={() => navigator.clipboard.writeText(hook)}>{hook}</span>)}</div>}{generation.full_result.estimated_improvement && <div className="p-4 rounded-lg" style={{ background: "#0E0E0E" }}><p className="text-xs" style={{ color: "#4ADE80" }}>{generation.full_result.estimated_improvement}</p></div>}</div>}</div>)}</div>}
    </DashboardLayout>
  );
}
