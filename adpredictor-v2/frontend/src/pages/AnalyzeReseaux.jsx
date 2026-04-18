import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import VideoUploader from "../components/VideoUploader.jsx";
import AnalysisResult from "../components/AnalysisResult.jsx";
import { useTranslation } from "../i18n/useLang.jsx";

export default function AnalyzeReseaux() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isPremium = user && (user.is_admin || ["premium_reseaux", "premium_combo"].includes(user.plan));

  useEffect(() => { if (!token) navigate("/login"); }, [navigate, token]);

  const handleAnalyze = async ({ file, platform }) => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const fd = new FormData();
      fd.append("video", file);
      fd.append("category", "reseaux");
      fd.append("platform", platform);
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/analyze", { method: "POST", headers, body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || t("common_error"));
        setLoading(false);
        return;
      }
      setResult({
        globalScore: data.global_score,
        criteria: data.criteria_scores || [],
        summary: data.summary,
        quickTake: data.quick_take,
        tags: data.tags || [],
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        suggestions: data.suggestions,
        priorityActions: data.priority_actions,
        beginnerTake: data.beginner_take,
        expertTake: data.expert_take,
        watchouts: data.watchouts,
        viewsPrediction: data.views_prediction,
      });
    } catch {
      setError(t("auth_connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-12 animate-fadeInUp">
        <Link to="/dashboard" className="text-sm mb-6 inline-block transition-colors" style={{ color: "#888" }}>? {t("analyze_back")}</Link>
        <h1 className="font-display text-3xl italic text-white">{t("analyze_reseaux_title")}</h1>
        <p className="mt-3 text-sm" style={{ color: "#888" }}>{t("analyze_reseaux_subdesc")}</p>
      </div>
      {error && <div className="card px-5 py-4 mb-8" style={{ color: "#F87171" }}><p className="text-sm">{error}</p></div>}
      <VideoUploader onAnalyze={handleAnalyze} category="reseaux" />
      {loading && <div className="card p-14 text-center mt-10 animate-fadeIn"><div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /><p className="text-white font-medium mb-1">{t("analyze_loading")}</p><p className="text-sm" style={{ color: "#888" }}>{t("analyze_reseaux_loading_desc")}</p></div>}
      <AnalysisResult result={result} isPremium={isPremium} />
    </DashboardLayout>
  );
}
