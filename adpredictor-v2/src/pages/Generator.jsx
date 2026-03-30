import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import VideoUploader from "../components/VideoUploader.jsx";

function ScriptStep({ step, index }) {
  return (
    <div className="card p-5 group">
      <div className="flex items-start gap-4">
        <span className="text-[11px] font-bold w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#1A1A1A", color: "#C6A15B" }}>{index + 1}</span>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono" style={{ color: "#C6A15B" }}>{step.timestamp}</span>
            {step.transition && <span className="tag text-[10px]">{step.transition}</span>}
          </div>
          <p className="text-white text-sm mb-1">{step.visual}</p>
          {step.text_overlay && <p className="text-xs" style={{ color: "#C6A15B" }}>"{step.text_overlay}"</p>}
          {step.audio && <p className="text-xs" style={{ color: "#4ADE80" }}>{step.audio}</p>}
          {step.note && <p className="text-xs italic mt-1" style={{ color: "#333" }}>{step.note}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Generator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleGenerate = async ({ file, platform }) => {
    setLoading(true); setResult(null); setError("");
    try {
      const fd = new FormData(); fd.append("video", file); fd.append("category", "reseaux"); fd.append("platform", platform);
      const h = {}; if (token) h["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/generate", { method: "POST", headers: h, body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur."); setLoading(false); return; }
      setResult(data);
    } catch { setError("Erreur de connexion."); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="mb-12 animate-fadeInUp">
        <Link to="/dashboard" className="text-sm mb-6 inline-block" style={{ color: "#555" }}>← Dashboard</Link>
        <h1 className="font-display text-3xl italic text-white">Generateur Video IA.</h1>
        <p className="mt-3 text-sm" style={{ color: "#555" }}>Uploadez votre video — l'IA cree un script ameliore personnalise.</p>
      </div>
      {error && <div className="card px-5 py-4 mb-8" style={{ color: "#F87171" }}><p className="text-sm">{error}</p></div>}
      <VideoUploader onAnalyze={handleGenerate} category="reseaux" />
      {loading && <div className="card p-14 text-center mt-10 animate-fadeIn"><div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /><p className="text-white font-medium mb-1">Generation en cours...</p><p className="text-sm" style={{ color: "#555" }}>L'IA analyse et cree votre script.</p></div>}
      {result && !loading && (
        <div className="mt-12 space-y-8 stagger-children">
          {result.video_analysis && (
            <div className="card p-10 animate-fadeInUp">
              <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#C6A15B" }}>Analyse de votre video</p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#888" }}>{result.video_analysis.what_i_see}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="card p-4"><p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#555" }}>Type</p><p className="text-white text-sm capitalize">{result.video_analysis.content_type}</p></div>
                <div className="card p-4"><p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#555" }}>Sujet</p><p className="text-white text-sm">{result.video_analysis.subject}</p></div>
              </div>
              {result.video_analysis.current_strengths && <div className="mb-4"><p className="text-xs mb-2" style={{ color: "#4ADE80" }}>Forces</p>{result.video_analysis.current_strengths.map((s, i) => <p key={i} className="text-sm mb-1" style={{ color: "#888" }}>+ {s}</p>)}</div>}
              {result.video_analysis.current_weaknesses && <div><p className="text-xs mb-2" style={{ color: "#F87171" }}>Faiblesses</p>{result.video_analysis.current_weaknesses.map((w, i) => <p key={i} className="text-sm mb-1" style={{ color: "#888" }}>− {w}</p>)}</div>}
            </div>
          )}
          <div className="card-gold p-10 animate-fadeInUp">
            <h2 className="font-display text-2xl italic text-white mb-3">{result.title}</h2>
            <p className="text-sm mb-6" style={{ color: "#888" }}>{result.concept}</p>
            <div className="flex flex-wrap gap-3">
              <span className="tag tag-gold text-xs">{result.duration_seconds}s</span>
              <span className="tag tag-gold text-xs">{result.format}</span>
              <span className="tag text-xs" style={{ borderColor: "#4ADE8030", color: "#4ADE80" }}>Score vise: {result.target_score}</span>
            </div>
          </div>
          <div className="animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: "#555" }}>Script ameliore</p><div className="space-y-3">{(result.script || []).map((s, i) => <ScriptStep key={i} step={s} index={i} />)}</div></div>
          {result.music_recommendations && <div className="card p-8 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: "#555" }}>Musiques</p>{result.music_recommendations.map((m, i) => <div key={i} className="mb-3"><p className="text-white text-sm">{m.name}</p><p className="text-xs" style={{ color: "#555" }}>{m.why}</p></div>)}</div>}
          {result.editing_tips && <div className="card p-8 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: "#555" }}>Conseils montage</p>{result.editing_tips.map((t, i) => <p key={i} className="text-sm mb-2" style={{ color: "#888" }}>• {t}</p>)}</div>}
          {result.viral_hooks_alternatives && <div className="card p-8 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: "#555" }}>Hooks alternatifs</p>{result.viral_hooks_alternatives.map((h, i) => <div key={i} className="card p-4 mb-2 cursor-pointer" onClick={() => { navigator.clipboard.writeText(h); }}><p className="text-sm" style={{ color: "#C6A15B" }}>{h}</p></div>)}</div>}
          {result.hashtags_suggested && <div className="card p-8 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: "#555" }}>Hashtags</p><div className="flex flex-wrap gap-2">{result.hashtags_suggested.map((t, i) => <span key={i} className="tag text-xs cursor-pointer" onClick={() => navigator.clipboard.writeText(t)}>{t}</span>)}</div></div>}
          {result.ai_generation_prompt && <div className="card p-8 animate-fadeInUp"><div className="flex justify-between mb-4"><p className="text-[11px] uppercase tracking-widest" style={{ color: "#555" }}>Prompt IA</p><button onClick={() => { navigator.clipboard.writeText(result.ai_generation_prompt); }} className="btn-outline text-xs py-1 px-3">Copier</button></div><p className="text-xs font-mono leading-relaxed p-4 rounded-lg" style={{ background: "#0E0E0E", color: "#555" }}>{result.ai_generation_prompt}</p></div>}
          {result.estimated_improvement && <div className="card-gold p-8 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#4ADE80" }}>Amelioration estimee</p><p className="text-sm" style={{ color: "#888" }}>{result.estimated_improvement}</p></div>}
        </div>
      )}
    </DashboardLayout>
  );
}