import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import VideoUploader from "../components/VideoUploader.jsx";
import { useTranslation } from "../i18n/useLang.jsx";

function ScriptStep({ step, index }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-extrabold flex-shrink-0" style={{ background: "rgba(198,161,91,0.12)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.18)" }}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag tag-gold">{step.timestamp}</span>
            {step.transition && <span className="tag">{step.transition}</span>}
          </div>
          <div className="mt-4 text-white text-base font-semibold">{step.visual}</div>
          {step.text_overlay && <div className="mt-2 text-sm" style={{ color: "#F1D59A" }}>"{step.text_overlay}"</div>}
          {step.audio && <div className="mt-2 text-sm" style={{ color: "#4ADE80" }}>{step.audio}</div>}
          {step.note && <div className="mt-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>{step.note}</div>}
        </div>
      </div>
    </div>
  );
}

function BulletListCard({ label, title, items, accent = "#C6A15B" }) {
  if (!items?.length) return null;
  return (
    <div className="card p-6">
      <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>{label}</div>
      <div className="mt-3 text-white text-xl font-semibold">{title}</div>
      <ul className="mt-4 space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

export default function Generator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleGenerate = async ({ file, platform }) => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("category", "reseaux");
      formData.append("platform", platform);
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch("/api/generate", { method: "POST", headers, body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || t("common_error"));
        setLoading(false);
        return;
      }
      setResult(data);
    } catch {
      setError(t("auth_connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-10 animate-fadeInUp">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm" style={{ color: "#B4AC9F" }}>
          <span>{"<-"}</span>
          {t("common_back")}
        </Link>
        <h1 className="mt-5 font-display text-white text-[clamp(2.1rem,4vw,4rem)] leading-[1.04] tracking-[-0.04em]">{t("gen_title")}</h1>
        <p className="mt-4 text-base leading-8 max-w-[760px]" style={{ color: "#C6BEB2" }}>{t("gen_desc")}</p>
      </div>

      {error && <div className="card px-5 py-4 mb-6" style={{ color: "#F87171" }}><p className="text-sm">{error}</p></div>}

      <VideoUploader onAnalyze={handleGenerate} category="reseaux" />

      {loading && (
        <div className="card p-14 text-center mt-10 animate-fadeIn">
          <div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "#C6A15B" }} />
          <p className="text-white font-semibold text-lg">{t("gen_loading")}</p>
          <p className="text-sm mt-2" style={{ color: "#BEB6A9" }}>{t("gen_loading_desc")}</p>
        </div>
      )}

      {result && !loading && (
        <div className="mt-12 space-y-6 stagger-children">
          <div className="card-gold p-7 sm:p-9 animate-fadeInUp">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="section-kicker">{t("gen_quick_brief")}</div>
                <h2 className="mt-5 text-white font-display text-3xl leading-[1.05]">{result.title}</h2>
                <p className="mt-4 text-base leading-8" style={{ color: "#E4D3AF" }}>{result.quick_brief?.headline || result.concept}</p>
                <p className="mt-3 text-sm leading-7" style={{ color: "#D7C7A4" }}>{result.quick_brief?.promise || result.concept}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="tag tag-gold">{result.duration_seconds}s</span>
                <span className="tag">{result.format}</span>
                <span className="tag">{t("gen_target_score")}: {result.target_score}</span>
              </div>
            </div>
            {result.quick_brief?.main_improvement && <p className="mt-5 text-sm leading-7" style={{ color: "#F5E8D1" }}>{result.quick_brief.main_improvement}</p>}
          </div>

          {result.video_analysis && (
            <div className="card p-7 animate-fadeInUp">
              <div className="section-kicker">{t("gen_video_analysis")}</div>
              <p className="mt-5 text-base leading-8" style={{ color: "#C6BEB2" }}>{result.video_analysis.what_i_see}</p>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#8A8173" }}>{t("gen_type")}</div>
                  <div className="mt-2 text-white font-semibold capitalize">{result.video_analysis.content_type}</div>
                </div>
                <div className="glass-card p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#8A8173" }}>{t("gen_subject")}</div>
                  <div className="mt-2 text-white font-semibold">{result.video_analysis.subject}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid xl:grid-cols-2 gap-5 animate-fadeInUp">
            <BulletListCard label={t("gen_beginner_checklist")} title={t("gen_beginner_checklist_desc")} items={result.beginner_checklist} />
            <BulletListCard label={t("gen_shooting_checklist")} title={t("gen_shooting_checklist_desc")} items={result.shooting_checklist} accent="#F1D59A" />
          </div>

          <div className="animate-fadeInUp">
            <div className="section-kicker">{t("gen_improved_script")}</div>
            <div className="mt-5 space-y-4">
              {(result.script || []).map((step, index) => <ScriptStep key={`${step.timestamp}-${index}`} step={step} index={index} />)}
            </div>
          </div>

          <div className="grid xl:grid-cols-2 gap-5 animate-fadeInUp">
            <BulletListCard label={t("gen_pro_tips")} title={t("gen_pro_tips_desc")} items={result.pro_tips} accent="#C6A15B" />
            <BulletListCard label={t("gen_publishing_notes")} title={t("gen_publishing_notes_desc")} items={result.publishing_notes} accent="#4ADE80" />
          </div>

          {result.music_recommendations?.length > 0 && (
            <div className="card p-7 animate-fadeInUp">
              <div className="section-kicker">{t("gen_music")}</div>
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                {result.music_recommendations.map((music) => (
                  <div key={`${music.name}-${music.platform}`} className="glass-card p-5">
                    <div className="text-white font-semibold">{music.name}</div>
                    <div className="text-sm mt-1" style={{ color: "#F1D59A" }}>{music.platform}</div>
                    <div className="text-sm mt-3 leading-7" style={{ color: "#BEB6A9" }}>{music.why}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid xl:grid-cols-2 gap-5 animate-fadeInUp">
            <BulletListCard label={t("gen_editing_tips")} title={t("gen_editing_tips_desc")} items={result.editing_tips} />
            <div className="card p-6">
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#C6A15B" }}>{t("gen_alt_hooks")}</div>
              <div className="mt-3 text-white text-xl font-semibold">{t("gen_alt_hooks_desc")}</div>
              <div className="mt-4 space-y-3">
                {(result.viral_hooks_alternatives || []).map((hook) => (
                  <button key={hook} type="button" onClick={() => navigator.clipboard.writeText(hook)} className="card w-full p-4 text-left">
                    <div className="text-sm font-semibold" style={{ color: "#F1D59A" }}>{hook}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {result.hashtags_suggested?.length > 0 && (
            <div className="card p-7 animate-fadeInUp">
              <div className="section-kicker">{t("booster_hashtags")}</div>
              <div className="mt-5 flex flex-wrap gap-2">
                {result.hashtags_suggested.map((tag) => (
                  <button key={tag} type="button" className="tag" onClick={() => navigator.clipboard.writeText(tag)}>{tag}</button>
                ))}
              </div>
            </div>
          )}

          {result.ai_generation_prompt && (
            <div className="card p-7 animate-fadeInUp">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="section-kicker">{t("gen_ai_prompt")}</div>
                  <div className="mt-3 text-white text-xl font-semibold">{t("gen_ai_prompt_desc")}</div>
                </div>
                <button type="button" onClick={() => navigator.clipboard.writeText(result.ai_generation_prompt)} className="btn-outline">
                  {t("gen_copy_prompt")}
                </button>
              </div>
              <div className="glass-card mt-5 p-5 text-sm leading-7" style={{ color: "#C6BEB2", fontFamily: "var(--font-body)" }}>
                {result.ai_generation_prompt}
              </div>
            </div>
          )}

          {result.estimated_improvement && (
            <div className="card-gold p-7 animate-fadeInUp">
              <div className="section-kicker">{t("gen_estimated_improvement")}</div>
              <p className="mt-5 text-base leading-8" style={{ color: "#F2E5CB" }}>{result.estimated_improvement}</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
