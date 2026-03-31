import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation, LanguageSwitcher } from "../i18n/useLang.jsx";
const LOGO = "data:image/jpeg;base64,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";

function Counter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => { start += step; if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start)); }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span className="counter-text">{count}{suffix}</span>;
}

const Check = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const Arrow = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

export default function LandingPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { t } = useTranslation();

  return (
    <div className="min-h-screen grain" style={{ background: "#0A0A0A" }}>

      {/* ===== NAV ===== */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-6 max-w-7xl mx-auto animate-fadeIn relative z-10">
        <img src={LOGO} alt="PronosysIA" className="h-7" />
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm transition-colors hover:text-white" style={{ color: "#555" }}>{t("nav_features")}</a>
          <a href="#process" className="text-sm transition-colors hover:text-white" style={{ color: "#555" }}>{t("nav_process")}</a>
          <a href="#pricing" className="text-sm transition-colors hover:text-white" style={{ color: "#555" }}>{t("nav_pricing")}</a>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? <Link to="/dashboard" className="btn-primary">{t("nav_dashboard")}</Link> : <>
            <Link to="/login" className="text-sm px-4 py-2 transition-colors hover:text-white" style={{ color: "#555" }}>{t("nav_login")}</Link>
            <Link to="/register" className="btn-primary">{t("nav_start")}</Link>
          </>}
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative px-8 pt-20 pb-32 md:pt-32 md:pb-44 max-w-5xl mx-auto text-center overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-pulse-gold pointer-events-none" style={{ background: "radial-gradient(circle, rgba(198,161,91,0.04) 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full animate-pulse-gold pointer-events-none" style={{ background: "radial-gradient(circle, rgba(198,161,91,0.03) 0%, transparent 70%)", animationDelay: "2s" }} />

        {/* Rotating ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border animate-rotate-slow pointer-events-none" style={{ borderColor: "rgba(198,161,91,0.03)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border animate-rotate-slow pointer-events-none" style={{ borderColor: "rgba(198,161,91,0.05)", animationDirection: "reverse", animationDuration: "20s" }} />

        <div className="relative z-10">
          <div className="tag tag-gold mb-8 mx-auto w-fit animate-fadeInUp">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C6A15B" }} />
            {t("hero_badge")}
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl italic text-white leading-[1.02] mb-8 animate-fadeInUp delay-200">
            {t("hero_title_1")}<br />{t("hero_title_2")}
          </h1>

          <p className="text-lg md:text-xl max-w-xl mx-auto mb-14 leading-relaxed animate-fadeInUp delay-400" style={{ color: "#555" }}>
            {t("hero_desc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fadeInUp delay-500">
            <Link to={user ? "/dashboard" : "/register"} className="btn-gold px-10 py-4 text-base flex items-center gap-3">
              {user ? t("hero_cta_logged") : t("hero_cta")} <Arrow />
            </Link>
            <span className="text-sm" style={{ color: "#333" }}>{t("hero_no_card")}</span>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className="relative z-10 max-w-5xl mx-auto px-8">
        <div className="card p-0 grid grid-cols-2 md:grid-cols-4 divide-x animate-fadeInUp delay-700" style={{ divideColor: "#1C1C1C", borderColor: "#1C1C1C" }}>
          {[
            { value: 8, suffix: "+", label: t("stat_criteria") },
            { value: 5, suffix: "+", label: t("stat_platforms") },
            { value: 100, suffix: "", label: t("stat_score") },
            { value: 90, suffix: "%", label: t("stat_accuracy") },
          ].map((s, i) => (
            <div key={i} className="p-8 text-center" style={{ borderColor: "#1C1C1C" }}>
              <p className="text-3xl md:text-4xl font-bold text-white mb-2"><Counter end={s.value} suffix={s.suffix} /></p>
              <p className="text-[11px] uppercase tracking-widest" style={{ color: "#555" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section id="features" className="px-8 py-32 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <p className="text-[11px] uppercase tracking-widest mb-4 animate-fadeInUp" style={{ color: "#C6A15B" }}>{t("features_label")}</p>
          <h2 className="font-display text-4xl md:text-5xl italic text-white animate-fadeInUp delay-100">
            {t("features_title_1")}<br />{t("features_title_2")}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px stagger-children" style={{ background: "#1C1C1C", borderRadius: "1.5rem", overflow: "hidden" }}>
          {[
            { title: t("feat_1_title"), desc: t("feat_1_desc"), accent: "#C6A15B", number: "01" },
            { title: t("feat_2_title"), desc: t("feat_2_desc"), accent: "#C6A15B", number: "02" },
            { title: t("feat_3_title"), desc: t("feat_3_desc"), accent: "#C6A15B", number: "03" },
            { title: t("feat_4_title"), desc: t("feat_4_desc"), accent: "#4ADE80", number: "04" },
            { title: t("feat_5_title"), desc: t("feat_5_desc"), accent: "#C6A15B", number: "05" },
            { title: t("feat_6_title"), desc: t("feat_6_desc"), accent: "#C6A15B", number: "06" },
          ].map((f, i) => (
            <div key={i} className="p-8 md:p-10 group animate-fadeInUp relative overflow-hidden" style={{ background: "#0A0A0A" }}>
              <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, " + f.accent + "20, transparent)" }} />
              <div className="flex items-start justify-between mb-8">
                <span className="text-4xl font-display italic font-bold" style={{ color: "#1C1C1C" }}>{f.number}</span>
                <div className="w-2 h-2 rounded-full mt-3 group-hover:scale-150 transition-transform" style={{ background: f.accent }} />
              </div>
              <h3 className="text-white font-medium text-lg mb-3 group-hover:translate-x-1 transition-transform">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="process" className="px-8 py-32 max-w-5xl mx-auto relative z-10">
        <div className="divider mb-32" />
        <div className="text-center mb-20">
          <p className="text-[11px] uppercase tracking-widest mb-4 animate-fadeInUp" style={{ color: "#C6A15B" }}>{t("process_label")}</p>
          <h2 className="font-display text-4xl md:text-5xl italic text-white animate-fadeInUp delay-100">
            {t("process_title_1")}<br />{t("process_title_2")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: t("step_1_title"), desc: t("step_1_desc"), detail: t("step_1_detail") },
            { step: "02", title: t("step_2_title"), desc: t("step_2_desc"), detail: t("step_2_detail") },
            { step: "03", title: t("step_3_title"), desc: t("step_3_desc"), detail: t("step_3_detail") },
          ].map((s, i) => (
            <div key={i} className="animate-fadeInUp group" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="mb-6">
                <span className="text-6xl font-display italic font-bold transition-colors group-hover:text-white" style={{ color: "#1C1C1C" }}>{s.step}</span>
              </div>
              <h3 className="text-white text-xl font-medium mb-3">{s.title}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#888" }}>{s.desc}</p>
              <p className="text-xs leading-relaxed" style={{ color: "#333" }}>{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SHOWCASE ===== */}
      <section className="px-8 py-20 max-w-5xl mx-auto relative z-10">
        <div className="card p-0 overflow-hidden animate-fadeInUp">
          <div className="grid md:grid-cols-2">
            <div className="p-12 md:p-16 flex flex-col justify-center">
              <p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#C6A15B" }}>{t("showcase_label")}</p>
              <h3 className="font-display text-3xl italic text-white mb-4">{t("showcase_title")}</h3>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#555" }}>{t("showcase_desc")}</p>
              <Link to={user ? "/dashboard/chatbot" : "/register"} className="btn-gold w-fit">{t("showcase_cta")}</Link>
            </div>
            <div className="p-8 flex items-center justify-center" style={{ background: "#0E0E0E" }}>
              <div className="w-full max-w-xs space-y-3">
                <div className="flex gap-2 justify-end"><div className="rounded-xl px-4 py-2 text-sm max-w-[80%]" style={{ background: "rgba(198,161,91,0.08)", color: "#C6A15B" }}>{t("showcase_chat_1")}</div></div>
                <div className="flex gap-2"><div className="rounded-xl px-4 py-2 text-sm max-w-[85%]" style={{ background: "#1A1A1A", color: "#888" }}>{t("showcase_chat_2")}</div></div>
                <div className="flex gap-2 justify-end"><div className="rounded-xl px-4 py-2 text-sm" style={{ background: "rgba(198,161,91,0.08)", color: "#C6A15B" }}>{t("showcase_chat_3")}</div></div>
                <div className="flex gap-2"><div className="rounded-xl px-4 py-2 text-sm" style={{ background: "#1A1A1A", color: "#4ADE80" }}>✓ {t("showcase_chat_4")}</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIAL ===== */}
      <section className="px-8 py-20 max-w-4xl mx-auto relative z-10">
        <div className="text-center animate-fadeInUp">
          <div className="w-16 h-16 rounded-full mx-auto mb-8 flex items-center justify-center" style={{ background: "#141414", border: "1px solid #1C1C1C" }}>
            <span className="text-2xl">💬</span>
          </div>
          <blockquote className="font-display text-2xl md:text-3xl italic text-white leading-snug mb-8 max-w-2xl mx-auto">
            "{t("testimonial_quote")}"
          </blockquote>
          <p className="text-sm" style={{ color: "#555" }}>— {t("testimonial_author")}</p>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="px-8 py-32 max-w-6xl mx-auto relative z-10">
        <div className="divider mb-32" />
        <div className="text-center mb-20">
          <p className="text-[11px] uppercase tracking-widest mb-4 animate-fadeInUp" style={{ color: "#C6A15B" }}>{t("pricing_label")}</p>
          <h2 className="font-display text-4xl md:text-5xl italic text-white animate-fadeInUp delay-100">{t("pricing_title")}</h2>
          <p className="text-base mt-4 animate-fadeInUp delay-200" style={{ color: "#555" }}>{t("pricing_desc")}</p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
          {[
            { title: t("pricing_free"), price: "0\u20AC", note: "", features: [t("price_free_1"), t("price_free_2"), t("price_free_3"), t("price_free_4")], popular: false },
            { title: "Power \u26A1", price: "9,99\u20AC", note: t("price_per_month"), features: [t("price_power_1"), t("price_power_2"), t("price_power_3"), t("price_power_4")], popular: false },
            { title: "Creator \u{1F525}", price: "9,99\u20AC", note: t("price_per_month"), features: [t("price_creator_1"), t("price_creator_2"), t("price_creator_3"), t("price_creator_4")], popular: false },
            { title: "Combo Elite \u{1F48E}", price: "11,99\u20AC", note: t("price_per_month"), features: [t("price_combo_1"), t("price_combo_2"), t("price_combo_3"), t("price_combo_4"), t("price_combo_5")], popular: true },
            { title: t("pricing_enterprise"), price: t("pricing_quote"), note: "", features: [t("price_enterprise_1"), t("price_enterprise_2"), t("price_enterprise_3"), t("price_enterprise_4"), t("price_enterprise_5")], popular: false, enterprise: true },
          ].map((p, i) => (
            <div key={i} className="card animate-fadeInUp" style={p.popular ? { border: "1px solid #C6A15B" } : {}}>
              {p.popular && <div className="text-center py-2 text-[10px] font-semibold tracking-widest uppercase text-white" style={{ background: "#C6A15B", borderRadius: "1rem 1rem 0 0" }}>{t("pricing_popular")}</div>}
              <div className="p-6">
                <h3 className="text-white font-medium mb-3 text-sm">{p.title}</h3>
                <div className="mb-6"><span className="text-3xl font-display italic text-white">{p.price}</span><span className="text-xs ml-1" style={{ color: "#555" }}>{p.note}</span></div>
                <ul className="space-y-2.5 mb-6">{p.features.map((f, j) => <li key={j} className="flex items-start gap-2 text-xs" style={{ color: "#888" }}><span style={{ color: "#C6A15B" }} className="mt-0.5"><Check /></span>{f}</li>)}</ul>
                {p.enterprise ? (
                  <a href="mailto:PronosysIA.Help@outlook.com?subject=Demande%20devis%20Entreprise%20PronosysIA" className="block text-center py-2.5 rounded-lg text-xs font-semibold transition-all hover:-translate-y-1 text-white border" style={{ borderColor: "#333" }}>{t("pricing_contact")}</a>
                ) : (
                  <Link to="/register" className={`block text-center py-2.5 rounded-lg text-xs font-semibold transition-all hover:-translate-y-1 ${p.popular ? "text-white" : "text-white border"}`}
                    style={p.popular ? { background: "#C6A15B" } : { borderColor: "#333" }}>
                    {p.popular ? t("pricing_start") : t("pricing_choose")}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm mt-10 animate-fadeInUp delay-500" style={{ color: "#333" }}>{t("pricing_footer")}</p>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="px-8 py-20 max-w-4xl mx-auto relative z-10">
        <div className="relative rounded-2xl p-16 md:p-20 text-center overflow-hidden animate-fadeInUp" style={{ background: "#0E0E0E", border: "1px solid #1C1C1C" }}>
          {/* Gold glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full pointer-events-none animate-pulse-gold" style={{ background: "radial-gradient(ellipse, rgba(198,161,91,0.08) 0%, transparent 70%)" }} />

          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl italic text-white mb-6">{t("cta_title")}</h2>
            <p className="text-base mb-12 max-w-md mx-auto" style={{ color: "#555" }}>{t("cta_desc")}</p>
            <Link to={user ? "/dashboard" : "/register"} className="btn-gold px-12 py-4 text-base inline-flex items-center gap-3">
              {t("cta_button")} <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 px-8 py-12 max-w-6xl mx-auto" style={{ borderTop: "1px solid #1C1C1C" }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img src={LOGO} alt="PronosysIA" className="h-5" />
            <span className="text-xs" style={{ color: "#333" }}>{t("footer_tagline")}</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-xs transition-colors hover:text-white" style={{ color: "#333" }}>{t("nav_features")}</a>
            <a href="#pricing" className="text-xs transition-colors hover:text-white" style={{ color: "#333" }}>{t("nav_pricing")}</a>
            <Link to="/login" className="text-xs transition-colors hover:text-white" style={{ color: "#333" }}>{t("nav_login")}</Link>
          </div>
        </div>
        <div className="mt-8 pt-8" style={{ borderTop: "1px solid #141414" }}>
          <p className="text-xs text-center" style={{ color: "#222" }}>&copy; 2026 PronosysIA. {t("footer_copyright")}</p>
        </div>
      </footer>
    </div>
  );
}