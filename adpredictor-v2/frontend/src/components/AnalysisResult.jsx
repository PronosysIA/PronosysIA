import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/useLang.jsx";

function ScoreCircle({ score, t }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#4ADE80" : score >= 50 ? "#C6A15B" : "#F87171";
  const label = score >= 75 ? t("result_excellent") : score >= 50 ? t("result_good_potential") : score >= 25 ? t("result_moderate") : t("result_low");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-4xl font-extrabold tracking-[-0.05em]">{score}</span>
          <span className="text-xs uppercase tracking-[0.24em]" style={{ color: "#8A8173" }}>/100</span>
        </div>
      </div>
      <span className="tag" style={{ borderColor: `${color}35`, color }}>{label}</span>
    </div>
  );
}

function formatViews(value) {
  if (!value && value !== 0) return "N/A";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return `${value}`;
}

function CriteriaCard({ criterion }) {
  const color = criterion.score >= 75 ? "#4ADE80" : criterion.score >= 50 ? "#C6A15B" : "#F87171";
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white text-sm font-semibold">{criterion.label}</div>
          <div className="text-xs mt-2 leading-6" style={{ color: "#BEB6A9" }}>{criterion.description}</div>
        </div>
        <div className="text-sm font-bold" style={{ color }}>{criterion.score}/100</div>
      </div>
      <div className="mt-4 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${criterion.score}%`, background: color }} />
      </div>
    </div>
  );
}

function InsightCard({ label, title, desc, accent = "#C6A15B" }) {
  return (
    <div className="card p-5">
      <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>{label}</div>
      <div className="mt-3 text-white text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-7" style={{ color: "#BEB6A9" }}>{desc}</div>
    </div>
  );
}

function ViewsPrediction({ prediction, t }) {
  if (!prediction) return null;
  const color = prediction.potential_label === "Viral probable" ? "#4ADE80" : prediction.potential_label === "Bon potentiel" ? "#C6A15B" : "#F87171";

  return (
    <div className="card p-7 animate-fadeInUp">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color }}>{t("result_views")}</div>
          <div className="mt-2 text-white text-xl font-semibold">{prediction.potential_label}</div>
        </div>
        <span className="tag" style={{ borderColor: `${color}35`, color }}>{prediction.confidence}</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="glass-card p-5 text-center">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#8A8173" }}>{t("result_min")}</div>
          <div className="mt-2 text-white text-3xl font-extrabold tracking-[-0.05em]">{formatViews(prediction.views_min)}</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#8A8173" }}>{t("result_max")}</div>
          <div className="mt-2 text-white text-3xl font-extrabold tracking-[-0.05em]">{formatViews(prediction.views_max)}</div>
        </div>
      </div>
      {prediction.note && <p className="mt-4 text-sm leading-7" style={{ color: "#BEB6A9" }}>{prediction.note}</p>}
    </div>
  );
}

function PremiumBlock({ result, t }) {
  return (
    <div className="space-y-5 animate-fadeInUp">
      {result.priorityActions?.length > 0 && (
        <div className="card-gold p-7">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#C6A15B" }}>{t("result_priority_actions")}</div>
          <div className="mt-5 grid gap-4">
            {result.priorityActions.map((action) => (
              <div key={`${action.priority}-${action.title}`} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-white font-semibold">{action.priority}. {action.title}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.18em]" style={{ color: action.impact === "fort" ? "#F1D59A" : "#B89A60" }}>{action.impact}</div>
                  </div>
                  <span className="tag tag-gold">P{action.priority}</span>
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8A8173" }}>{t("result_action_why")}</div>
                    <div className="mt-2 text-sm leading-7" style={{ color: "#F1E9DB" }}>{action.why}</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8A8173" }}>{t("result_action_how")}</div>
                    <div className="mt-2 text-sm leading-7" style={{ color: "#F1E9DB" }}>{action.how}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {result.beginnerTake && (
          <div className="card p-6">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#C6A15B" }}>{t("result_beginner_take")}</div>
            <div className="mt-4 space-y-4 text-sm leading-7" style={{ color: "#BEB6A9" }}>
              <div>
                <div className="text-white font-semibold">{t("result_beginner_meaning")}</div>
                <div className="mt-1">{result.beginnerTake.what_it_means}</div>
              </div>
              <div>
                <div className="text-white font-semibold">{t("result_beginner_focus")}</div>
                <div className="mt-1">{result.beginnerTake.first_focus}</div>
              </div>
              <div>
                <div className="text-white font-semibold">{t("result_beginner_avoid")}</div>
                <div className="mt-1">{result.beginnerTake.mistake_to_avoid}</div>
              </div>
            </div>
          </div>
        )}

        {result.expertTake && (
          <div className="card p-6">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#C6A15B" }}>{t("result_expert_take")}</div>
            <div className="mt-4 space-y-4 text-sm leading-7" style={{ color: "#BEB6A9" }}>
              <div>
                <div className="text-white font-semibold">{t("result_expert_diagnosis")}</div>
                <div className="mt-1">{result.expertTake.diagnosis}</div>
              </div>
              <div>
                <div className="text-white font-semibold">{t("result_expert_leverage")}</div>
                <div className="mt-1">{result.expertTake.leverage}</div>
              </div>
              <div>
                <div className="text-white font-semibold">{t("result_expert_test")}</div>
                <div className="mt-1">{result.expertTake.test_to_run}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {result.strengths?.length > 0 && (
          <div className="card p-6">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#4ADE80" }}>{t("result_strengths")}</div>
            <ul className="mt-4 space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
              {result.strengths.map((item) => <li key={item}>+ {item}</li>)}
            </ul>
          </div>
        )}
        {result.weaknesses?.length > 0 && (
          <div className="card p-6">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#F87171" }}>{t("result_weaknesses")}</div>
            <ul className="mt-4 space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
              {result.weaknesses.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </div>
        )}
        {result.suggestions?.length > 0 && (
          <div className="card p-6">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#C6A15B" }}>{t("result_suggestions")}</div>
            <ul className="mt-4 space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
              {result.suggestions.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        )}
      </div>

      {result.watchouts?.length > 0 && (
        <div className="card p-6">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#C6A15B" }}>{t("result_watchouts")}</div>
          <ul className="mt-4 space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
            {result.watchouts.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function LockedBlock({ t }) {
  return (
    <div className="card-gold p-7 animate-fadeInUp">
      <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#C6A15B" }}>{t("result_unlock_title")}</div>
      <div className="mt-3 text-white text-2xl font-display">{t("result_lock_title")}</div>
      <p className="mt-3 text-sm leading-7" style={{ color: "#D5C7AA" }}>{t("result_lock_desc")}</p>
      <div className="mt-6 grid md:grid-cols-3 gap-3">
        <div className="glass-card p-4 text-sm" style={{ color: "#F4EBDD" }}>{t("result_unlock_preview_1")}</div>
        <div className="glass-card p-4 text-sm" style={{ color: "#F4EBDD" }}>{t("result_unlock_preview_2")}</div>
        <div className="glass-card p-4 text-sm" style={{ color: "#F4EBDD" }}>{t("result_unlock_preview_3")}</div>
      </div>
      <Link to="/dashboard/subscription" className="btn-primary mt-6">
        {t("result_unlock_cta")}
      </Link>
    </div>
  );
}

export default function AnalysisResult({ result, isPremium }) {
  const { t } = useTranslation();
  if (!result) return null;

  const criteria = Array.isArray(result.criteria) ? result.criteria : [];
  const bestCriterion = [...criteria].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const lowestCriterion = [...criteria].sort((a, b) => (a.score || 0) - (b.score || 0))[0];

  return (
    <div className="mt-12 space-y-6 stagger-children">
      <div className="card p-7 sm:p-9 animate-fadeInUp">
        <div className="grid lg:grid-cols-[0.38fr_0.62fr] gap-8 items-center">
          <ScoreCircle score={result.globalScore} t={t} />
          <div>
            <div className="section-kicker">{t("result_score")}</div>
            <p className="mt-4 text-white text-2xl font-display">{result.summary}</p>
            {result.quickTake && <p className="mt-4 text-base leading-8" style={{ color: "#C8C0B4" }}>{result.quickTake}</p>}
            {!!result.tags?.length && (
              <div className="mt-5 flex flex-wrap gap-2">
                {result.tags.map((tag, index) => (
                  <span
                    key={`${tag.label}-${index}`}
                    className="tag"
                    style={tag.type === "positive" ? { borderColor: "rgba(74,222,128,0.28)", color: "#4ADE80" } : tag.type === "warning" ? { borderColor: "rgba(198,161,91,0.28)", color: "#C6A15B" } : { borderColor: "rgba(248,113,113,0.28)", color: "#F87171" }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 animate-fadeInUp">
        <InsightCard
          label={t("result_quick_take")}
          title={bestCriterion?.label || t("common_understand")}
          desc={result.quickTake || result.summary}
          accent="#C6A15B"
        />
        <InsightCard
          label={t("result_best_signal")}
          title={bestCriterion?.label || t("common_na")}
          desc={bestCriterion?.description || t("common_na")}
          accent="#4ADE80"
        />
        <InsightCard
          label={t("result_main_opportunity")}
          title={lowestCriterion?.label || t("common_na")}
          desc={lowestCriterion?.description || t("common_na")}
          accent="#F87171"
        />
      </div>

      <ViewsPrediction prediction={result.viewsPrediction} t={t} />

      <div className="animate-fadeInUp">
        <div className="section-kicker">{t("result_criteria")}</div>
        <div className="mt-5 grid md:grid-cols-2 gap-4">
          {criteria.map((criterion) => (
            <CriteriaCard key={`${criterion.label}-${criterion.score}`} criterion={criterion} />
          ))}
        </div>
      </div>

      {isPremium ? <PremiumBlock result={result} t={t} /> : <LockedBlock t={t} />}
    </div>
  );
}
