import { Link } from "react-router-dom";

function ScoreCircle({ score }) {
  const r = 56, c = 2 * Math.PI * r, o = c - (score / 100) * c;
  const color = score >= 75 ? "#4ADE80" : score >= 50 ? "#C6A15B" : "#F87171";
  const label = score >= 75 ? "Excellent" : score >= 50 ? "Bon potentiel" : score >= 25 ? "Modere" : "Faible";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#1C1C1C" strokeWidth="6" />
          <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={o} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs" style={{ color: "#888" }}>/100</span>
        </div>
      </div>
      <p className="text-xs mt-3" style={{ color }}>{label}</p>
    </div>
  );
}

function CriteriaBar({ label, score, description }) {
  const color = score >= 75 ? "#4ADE80" : score >= 50 ? "#C6A15B" : "#F87171";
  return (
    <div className="card p-5">
      <div className="flex justify-between mb-3"><span className="text-white text-sm">{label}</span><span className="text-sm" style={{ color }}>{score}/100</span></div>
      <div className="h-1 rounded-full" style={{ background: "#1C1C1C" }}><div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} /></div>
      {description && <p className="text-xs mt-3" style={{ color: "#888" }}>{description}</p>}
    </div>
  );
}

function formatViews(n) { if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n/1e3).toFixed(n>=1e4?0:1)}K`; return n.toString(); }

function ViewsPrediction({ prediction }) {
  if (!prediction) return null;
  const color = prediction.potential_label === "Viral probable" ? "#4ADE80" : prediction.potential_label === "Bon potentiel" ? "#C6A15B" : "#F87171";
  return (
    <div className="card p-8 animate-fadeInUp" style={{ borderColor: `${color}20` }}>
      <div className="flex items-center gap-3 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        <span className="text-white font-medium">Prediction de vues</span>
        <span className="tag text-xs ml-auto" style={{ borderColor: `${color}30`, color }}>{prediction.potential_label}</span>
      </div>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center"><p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "#888" }}>Min</p><p className="text-3xl font-bold" style={{ color }}>{formatViews(prediction.views_min)}</p></div>
        <span style={{ color: "#666" }}>→</span>
        <div className="text-center"><p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "#888" }}>Max</p><p className="text-3xl font-bold" style={{ color }}>{formatViews(prediction.views_max)}</p></div>
      </div>
      {prediction.note && <p className="text-xs mt-6 text-center" style={{ color: "#888" }}>{prediction.note}</p>}
    </div>
  );
}

export default function AnalysisResult({ result, isPremium }) {
  if (!result) return null;
  return (
    <div className="space-y-8 mt-12 stagger-children">
      <div className="card p-10 animate-fadeInUp">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <ScoreCircle score={result.globalScore} />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-display italic text-white mb-3">Score de viralite</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#888" }}>{result.summary}</p>
            <div className="flex flex-wrap gap-2">
              {result.tags.map((t, i) => <span key={i} className="tag text-xs" style={t.type === "positive" ? { borderColor: "#4ADE8030", color: "#4ADE80" } : t.type === "warning" ? { borderColor: "#C6A15B30", color: "#C6A15B" } : { borderColor: "#F8717130", color: "#F87171" }}>{t.label}</span>)}
            </div>
          </div>
        </div>
      </div>

      {result.viewsPrediction && <ViewsPrediction prediction={result.viewsPrediction} />}

      <div className="animate-fadeInUp delay-200">
        <p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: "#888" }}>Criteres</p>
        <div className="grid md:grid-cols-2 gap-4">{result.criteria.map((c, i) => <CriteriaBar key={i} label={c.label} score={c.score} description={c.description} />)}</div>
      </div>

      {isPremium ? (
        <div className="card p-10 animate-fadeInUp delay-300">
          <h3 className="text-white font-medium mb-6">Recommandations IA</h3>
          {result.strengths?.length > 0 && <div className="mb-6"><p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#4ADE80" }}>Forces</p><ul className="space-y-2">{result.strengths.map((s, i) => <li key={i} className="text-sm flex gap-2" style={{ color: "#888" }}><span style={{ color: "#4ADE80" }}>+</span>{s}</li>)}</ul></div>}
          {result.weaknesses?.length > 0 && <div className="mb-6"><p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#F87171" }}>Faiblesses</p><ul className="space-y-2">{result.weaknesses.map((w, i) => <li key={i} className="text-sm flex gap-2" style={{ color: "#888" }}><span style={{ color: "#F87171" }}>−</span>{w}</li>)}</ul></div>}
          {result.suggestions?.length > 0 && <div><p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#C6A15B" }}>Suggestions</p><ul className="space-y-2">{result.suggestions.map((s, i) => <li key={i} className="text-sm flex gap-2" style={{ color: "#888" }}><span style={{ color: "#C6A15B" }}>•</span>{s}</li>)}</ul></div>}
        </div>
      ) : (
        <div className="card p-10 animate-fadeInUp delay-300" style={{ borderColor: "rgba(198,161,91,0.2)", background: "linear-gradient(135deg, #0D0D0D 0%, #0F0D08 100%)" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(198,161,91,0.1)", border: "1px solid rgba(198,161,91,0.2)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#C6A15B" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Recommandations IA verrouillees</p>
              <p className="text-sm" style={{ color: "#888" }}>Forces, faiblesses et suggestions personnalisees disponibles en Premium.</p>
            </div>
          </div>
          <div className="h-px mb-6" style={{ background: "rgba(198,161,91,0.1)" }} />
          <Link to="/dashboard/subscription" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "linear-gradient(135deg, #C6A15B, #A8863C)", color: "#0A0A0A", fontWeight: "600", fontSize: "14px", borderRadius: "8px", textDecoration: "none", letterSpacing: "0.01em" }}>
            Exploiter le plein potentiel
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      )}
    </div>
  );
}