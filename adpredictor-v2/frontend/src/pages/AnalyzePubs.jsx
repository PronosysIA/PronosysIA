import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import VideoUploader from "../components/VideoUploader.jsx";
import AnalysisResult from "../components/AnalysisResult.jsx";

export default function AnalyzePubs() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isPremium = user && (user.is_admin || ["premium_pubs", "premium_combo"].includes(user.plan));

  const handleAnalyze = async ({ file, platform }) => {
    setLoading(true); setResult(null); setError("");
    try {
      const fd = new FormData(); fd.append("video", file); fd.append("category", "pubs"); fd.append("platform", platform);
      const h = {}; if (token) h["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/analyze", { method: "POST", headers: h, body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur."); setLoading(false); return; }
      setResult({ globalScore: data.global_score, criteria: data.criteria_scores || [], summary: data.summary, tags: data.tags || [], strengths: data.strengths, weaknesses: data.weaknesses, suggestions: data.suggestions, viewsPrediction: data.views_prediction });
    } catch { setError("Erreur de connexion."); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="mb-12 animate-fadeInUp">
        <Link to="/dashboard" className="text-sm mb-6 inline-block transition-colors" style={{ color: "#555" }}>← Dashboard</Link>
        <h1 className="font-display text-3xl italic text-white">Pubs Classiques.</h1>
        <p className="mt-3 text-sm" style={{ color: "#555" }}>Meta Ads, Google Ads, YouTube Ads et autres regies.</p>
      </div>
      {error && <div className="card px-5 py-4 mb-8" style={{ color: "#F87171" }}><p className="text-sm">{error}</p></div>}
      <VideoUploader onAnalyze={handleAnalyze} category="pubs" />
      {loading && (
        <div className="card p-14 text-center mt-10 animate-fadeIn">
          <div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} />
          <p className="text-white font-medium mb-1">Analyse en cours...</p>
          <p className="text-sm" style={{ color: "#555" }}>L'IA evalue votre publicite.</p>
        </div>
      )}
      <AnalysisResult result={result} isPremium={isPremium} />
    </DashboardLayout>
  );
}