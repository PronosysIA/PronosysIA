import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation, LanguageSwitcher } from "../i18n/useLang.jsx";

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
    <div className="min-h-screen grain" style={{ background: "#090909", position: "relative" }}>
      {/* Gold grid background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(198,161,91,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(198,161,91,0.018) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none", zIndex: 0 }} />

      {/* ===== NAV ===== */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-6 max-w-7xl mx-auto animate-fadeIn relative z-10">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, rgba(198,161,91,0.15), rgba(198,161,91,0.05))", border: "1px solid rgba(198,161,91,0.25)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <span style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.03em", color: "white" }}>Pronosys<span style={{ color: "#C6A15B" }}>IA</span></span>
        </Link>
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
      <section className="relative z-10" style={{ padding: "clamp(60px, 8vw, 120px) clamp(24px, 6vw, 80px) clamp(80px, 10vw, 140px)", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "20%", right: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(198,161,91,0.04) 0%, transparent 65%)", pointerEvents: "none" }} className="animate-pulse-gold" />

        {/* Badge */}
        <div className="animate-fadeInUp" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C6A15B", boxShadow: "0 0 8px rgba(198,161,91,0.6)" }} className="animate-pulse-gold" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#C6A15B" }}>{t("hero_badge")}</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(198,161,91,0.3), transparent)", maxWidth: "120px" }} />
        </div>

        {/* Title */}
        <h1 className="animate-fadeInUp delay-100" style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(44px, 7vw, 88px)", color: "white", fontStyle: "italic", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "24px", maxWidth: "900px" }}>
          {t("hero_title_1")}<br />
          <span style={{ color: "rgba(255,255,255,0.85)" }}>{t("hero_title_2")}</span>
        </h1>

        {/* Gold separator line */}
        <div className="animate-fadeInUp delay-200" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div style={{ width: "60px", height: "2px", background: "linear-gradient(90deg, #C6A15B, rgba(198,161,91,0.3))", borderRadius: "1px" }} />
          <div style={{ width: "8px", height: "8px", background: "transparent", border: "1px solid #C6A15B", transform: "rotate(45deg)" }} />
        </div>

        <p className="animate-fadeInUp delay-300" style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#888", lineHeight: 1.7, marginBottom: "48px", maxWidth: "540px" }}>
          {t("hero_desc")}
        </p>

        <div className="animate-fadeInUp delay-400" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
          <Link to={user ? "/dashboard" : "/register"} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#C6A15B", color: "white", padding: "14px 28px", borderRadius: "10px", fontSize: "15px", fontWeight: 700, textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#A8864A"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#C6A15B"; e.currentTarget.style.transform = "none"; }}
          >
            {user ? t("hero_cta_logged") : t("hero_cta")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <span style={{ fontSize: "13px", color: "#555" }}>{t("hero_no_card")}</span>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className="relative z-10" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(24px, 6vw, 80px)", marginBottom: "80px" }}>
        <div style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, #C6A15B40, transparent)" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 animate-fadeInUp delay-700">
          {[
            { value: 8, suffix: "+", label: t("stat_criteria") },
            { value: 5, suffix: "+", label: t("stat_platforms") },
            { value: 100, suffix: "", label: t("stat_score") },
            { value: 90, suffix: "%", label: t("stat_accuracy") },
          ].map((s, i) => (
            <div key={i} style={{ padding: "28px 20px", textAlign: "center", borderRight: i < 3 ? "1px solid #1A1A1A" : "none" }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, color: "white", marginBottom: "6px", letterSpacing: "-0.03em" }}><Counter end={s.value} suffix={s.suffix} /></p>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#555" }}>{s.label}</p>
            </div>
          ))}
        </div>
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
            <span style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", fontWeight: 800, fontSize: "15px", letterSpacing: "-0.03em", color: "white" }}>Pronosys<span style={{ color: "#C6A15B" }}>IA</span></span>
            <span className="text-xs" style={{ color: "#444" }}>{t("footer_tagline")}</span>
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