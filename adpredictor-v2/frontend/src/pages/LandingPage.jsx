import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation, LanguageSwitcher } from "../i18n/useLang.jsx";

function Counter({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [duration, end]);

  return <span className="counter-text">{count}{suffix}</span>;
}

function Check() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const stats = [
    { value: 8, suffix: "+", label: t("stat_criteria") },
    { value: 7, suffix: "", label: t("stat_platforms") },
    { value: 100, suffix: "", label: t("stat_score") },
    { value: 90, suffix: "%", label: t("stat_accuracy") },
  ];

  const features = [
    { title: t("feat_1_title"), desc: t("feat_1_desc"), accent: "#C6A15B" },
    { title: t("feat_2_title"), desc: t("feat_2_desc"), accent: "#F1D59A" },
    { title: t("feat_3_title"), desc: t("feat_3_desc"), accent: "#C6A15B" },
    { title: t("feat_4_title"), desc: t("feat_4_desc"), accent: "#4ADE80" },
    { title: t("feat_5_title"), desc: t("feat_5_desc"), accent: "#C6A15B" },
    { title: t("feat_6_title"), desc: t("feat_6_desc"), accent: "#F1D59A" },
  ];

  const plans = [
    {
      title: t("pricing_free"),
      price: "0EUR",
      note: t("landing_plan_free_note"),
      features: [t("price_free_1"), t("price_free_2"), t("price_free_3"), t("price_free_4")],
      popular: false,
    },
    {
      title: "Power",
      price: "9,99EUR",
      note: t("price_per_month"),
      features: [t("price_power_1"), t("price_power_2"), t("price_power_3"), t("price_power_4")],
      popular: false,
    },
    {
      title: "Creator",
      price: "9,99EUR",
      note: t("price_per_month"),
      features: [t("price_creator_1"), t("price_creator_2"), t("price_creator_3"), t("price_creator_4")],
      popular: false,
    },
    {
      title: "Combo Elite",
      price: "11,99EUR",
      note: t("price_per_month"),
      features: [t("price_combo_1"), t("price_combo_2"), t("price_combo_3"), t("price_combo_4"), t("price_combo_5")],
      popular: true,
    },
    {
      title: t("pricing_enterprise"),
      price: t("pricing_quote"),
      note: t("landing_plan_enterprise_note"),
      features: [t("price_enterprise_1"), t("price_enterprise_2"), t("price_enterprise_3"), t("price_enterprise_4"), t("price_enterprise_5")],
      popular: false,
      enterprise: true,
    },
  ];

  return (
    <div className="min-h-screen grain relative overflow-hidden">
      <div className="ambient-orb animate-drift" style={{ top: "8%", left: "-8%", width: "22rem", height: "22rem", background: "radial-gradient(circle, rgba(198,161,91,0.18), transparent 65%)" }} />
      <div className="ambient-orb animate-drift" style={{ top: "18%", right: "-6%", width: "18rem", height: "18rem", background: "radial-gradient(circle, rgba(198,161,91,0.12), transparent 68%)", animationDelay: "1.2s" }} />
      <div className="ambient-orb animate-drift" style={{ bottom: "6%", left: "22%", width: "16rem", height: "16rem", background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)", animationDelay: "2.4s" }} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="pt-6 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(198,161,91,0.24), rgba(198,161,91,0.08))", border: "1px solid rgba(198,161,91,0.22)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div className="text-white font-extrabold tracking-[-0.05em] text-lg font-brand">
                Pronosys<span style={{ color: "#C6A15B" }}>IA</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "#8E836E" }}>
                {t("landing_nav_tagline")}
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-7 text-sm" style={{ color: "#B6AEA2" }}>
            <a href="#features" className="hover:text-white transition-colors">{t("nav_features")}</a>
            <a href="#process" className="hover:text-white transition-colors">{t("nav_process")}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t("nav_pricing")}</a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <Link to="/dashboard" className="btn-gold">
                {t("nav_dashboard")}
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex btn-outline">
                  {t("nav_login")}
                </Link>
                <Link to="/register" className="btn-gold">
                  {t("nav_start")}
                </Link>
              </>
            )}
          </div>
        </nav>

        <section className="pt-14 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-[1.06fr_0.94fr] gap-10 items-center">
          <div className="max-w-[700px]">
            <div className="section-kicker animate-fadeInUp">
              {t("hero_badge")}
            </div>

            <h1 className="mt-6 animate-fadeInUp delay-100 font-display text-white leading-[0.98] tracking-[-0.05em] text-[clamp(3.2rem,7vw,6.8rem)]">
              {t("hero_title_1")} <span className="gold-text-gradient">{t("hero_title_2")}</span>
            </h1>

            <p className="mt-6 max-w-[620px] text-[1.02rem] leading-8 animate-fadeInUp delay-200" style={{ color: "#C8C0B4" }}>
              {t("hero_desc")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fadeInUp delay-300">
              <Link to={user ? "/dashboard" : "/register"} className="btn-gold px-7 py-4 text-base">
                {user ? t("hero_cta_logged") : t("hero_cta")}
                <Arrow />
              </Link>
              <div className="metric-pill">{t("hero_no_card")}</div>
              <div className="metric-pill" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
                {t("landing_proof")}
              </div>
            </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-3 animate-fadeInUp delay-400">
              <div className="glass-card px-5 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em]" style={{ color: "#806F50" }}>{t("landing_signal_fast")}</div>
                <div className="mt-2 text-sm text-white font-semibold">{t("landing_signal_fast_desc")}</div>
              </div>
              <div className="glass-card px-5 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em]" style={{ color: "#806F50" }}>{t("landing_signal_layered")}</div>
                <div className="mt-2 text-sm text-white font-semibold">{t("landing_signal_layered_desc")}</div>
              </div>
              <div className="glass-card px-5 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em]" style={{ color: "#806F50" }}>{t("landing_signal_conversion")}</div>
                <div className="mt-2 text-sm text-white font-semibold">{t("landing_signal_conversion_desc")}</div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] animate-fadeInUp delay-300">
            <div className="hero-orbit animate-pulse-gold" />
            <div className="absolute top-[2%] left-[2%] z-20 glass-card px-4 py-3 animate-float" style={{ width: "220px" }}>
              <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8C7C60" }}>{t("landing_preview_headline")}</div>
              <div className="mt-2 text-white text-lg font-semibold">92/100</div>
              <div className="text-xs mt-1" style={{ color: "#C7BEAF" }}>{t("landing_preview_desc")}</div>
            </div>

            <div className="signal-card absolute left-1/2 top-[18%] z-10 w-[calc(100%-1.5rem)] max-w-[560px] -translate-x-1/2 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#907B55" }}>{t("landing_preview_panel")}</div>
                  <div className="mt-2 text-white font-display text-3xl">{t("landing_preview_title")}</div>
                </div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold" style={{ border: "1px solid rgba(198,161,91,0.24)", color: "#C6A15B", background: "rgba(198,161,91,0.08)" }}>
                  86
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#887A62" }}>{t("landing_preview_quick")}</div>
                      <div className="mt-2 text-white font-semibold">{t("landing_preview_quick_desc")}</div>
                    </div>
                    <span className="tag tag-gold">{t("result_score")}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="card p-5">
                    <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8B7B5D" }}>{t("landing_preview_beginner")}</div>
                    <p className="mt-2 text-sm text-white font-semibold">{t("landing_preview_beginner_desc")}</p>
                    <p className="mt-2 text-xs" style={{ color: "#B7AE9E" }}>{t("landing_preview_beginner_note")}</p>
                  </div>
                  <div className="card p-5">
                    <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8B7B5D" }}>{t("landing_preview_expert")}</div>
                    <p className="mt-2 text-sm text-white font-semibold">{t("landing_preview_expert_desc")}</p>
                    <p className="mt-2 text-xs" style={{ color: "#B7AE9E" }}>{t("landing_preview_expert_note")}</p>
                  </div>
                </div>

                <div className="card-gold p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="tag tag-gold">{t("sidebar_generator")}</span>
                    <span className="tag">{t("sidebar_booster")}</span>
                    <span className="tag">{t("sidebar_chatbot")}</span>
                  </div>
                  <p className="text-sm text-white font-semibold">{t("landing_preview_stack")}</p>
                  <p className="text-xs mt-2" style={{ color: "#C8B896" }}>{t("landing_preview_stack_desc")}</p>
                </div>
              </div>
            </div>

            <div className="absolute right-[2%] bottom-[4%] z-20 glass-card px-4 py-3 animate-float" style={{ width: "230px", animationDelay: "1.8s" }}>
              <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8B7B5D" }}>{t("landing_growth_card")}</div>
              <div className="mt-2 text-white text-sm font-semibold">{t("landing_growth_card_desc")}</div>
            </div>
          </div>
        </section>

        <section className="pb-16 lg:pb-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className="card p-6 animate-fadeInUp" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="text-3xl md:text-4xl text-white font-extrabold tracking-[-0.05em]">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: "#8A8173" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="py-16 lg:py-24">
          <div className="max-w-[680px] mb-12">
            <div className="section-kicker">{t("features_label")}</div>
            <h2 className="mt-5 font-display text-white text-[clamp(2.4rem,5vw,4.8rem)] leading-[1.02] tracking-[-0.04em]">
              {t("features_title_1")} <span className="gold-text-gradient">{t("features_title_2")}</span>
            </h2>
            <p className="mt-5 text-base leading-8" style={{ color: "#C8C0B4" }}>
              {t("landing_features_subtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 stagger-children">
            {features.map((feature, index) => (
              <div key={feature.title} className="card p-7 animate-fadeInUp">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: feature.accent }}>{String(index + 1).padStart(2, "0")}</span>
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse-gold" style={{ background: feature.accent }} />
                </div>
                <h3 className="mt-6 text-white text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="process" className="py-16 lg:py-24">
          <div className="divider mb-14" />
          <div className="grid lg:grid-cols-[0.86fr_1.14fr] gap-8 items-start">
            <div>
              <div className="section-kicker">{t("process_label")}</div>
              <h2 className="mt-5 font-display text-white text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[1.03] tracking-[-0.04em]">
                {t("process_title_1")} <span className="gold-text-gradient">{t("process_title_2")}</span>
              </h2>
              <p className="mt-5 text-base leading-8" style={{ color: "#C8C0B4" }}>
                {t("landing_process_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 stagger-children">
              {[
                { step: "01", title: t("step_1_title"), desc: t("step_1_desc"), detail: t("step_1_detail") },
                { step: "02", title: t("step_2_title"), desc: t("step_2_desc"), detail: t("step_2_detail") },
                { step: "03", title: t("step_3_title"), desc: t("step_3_desc"), detail: t("step_3_detail") },
              ].map((item) => (
                <div key={item.step} className="card p-6 animate-fadeInUp">
                  <div className="text-5xl font-display gold-text-gradient">{item.step}</div>
                  <h3 className="mt-6 text-white text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>{item.desc}</p>
                  <p className="mt-4 text-xs leading-6" style={{ color: "#8F887C" }}>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="card-gold p-8 lg:p-12 grid lg:grid-cols-[0.92fr_1.08fr] gap-8 items-center">
            <div>
              <div className="section-kicker">{t("showcase_label")}</div>
              <h3 className="mt-5 font-display text-white text-[clamp(2rem,4vw,3.4rem)] leading-[1.04] tracking-[-0.04em]">
                {t("showcase_title")}
              </h3>
              <p className="mt-5 text-base leading-8" style={{ color: "#D8CCB1" }}>{t("showcase_desc")}</p>
              <Link to={user ? "/dashboard/chatbot" : "/register"} className="btn-primary mt-8">
                {t("showcase_cta")}
                <Arrow />
              </Link>
            </div>

            <div className="grid gap-4">
              <div className="card p-5 ml-auto max-w-[82%]">
                <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8B7B5D" }}>{t("showcase_chat_1")}</div>
                <div className="mt-2 text-white text-sm font-semibold">{t("landing_chat_reply_1")}</div>
              </div>
              <div className="card p-5 max-w-[92%]">
                <div className="text-white text-sm font-semibold">{t("showcase_chat_2")}</div>
              </div>
              <div className="card p-5 ml-auto max-w-[76%]">
                <div className="text-white text-sm font-semibold">{t("showcase_chat_3")}</div>
              </div>
              <div className="card p-5 max-w-[88%]">
                <div className="text-sm font-semibold" style={{ color: "#4ADE80" }}>{t("showcase_chat_4")}</div>
                <div className="mt-2 text-xs" style={{ color: "#B8AF9E" }}>{t("landing_chat_reply_2")}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16 lg:py-24">
          <div className="divider mb-14" />
          <div className="max-w-[720px]">
            <div className="section-kicker">{t("pricing_label")}</div>
            <h2 className="mt-5 font-display text-white text-[clamp(2.2rem,4.8vw,4.5rem)] leading-[1.03] tracking-[-0.04em]">
              {t("pricing_title")}
            </h2>
            <p className="mt-5 text-base leading-8" style={{ color: "#C8C0B4" }}>
              {t("pricing_desc")}
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-5 gap-4 stagger-children">
            {plans.map((plan) => (
              <div key={plan.title} className={plan.popular ? "card-gold p-6 animate-fadeInUp" : "card p-6 animate-fadeInUp"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{plan.title}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] mt-1" style={{ color: plan.popular ? "#C6A15B" : "#8A8173" }}>
                      {plan.popular ? t("pricing_popular") : plan.note}
                    </div>
                  </div>
                  {plan.popular && <span className="tag tag-gold">{t("landing_best_value")}</span>}
                </div>

                <div className="mt-6 text-white font-display text-4xl tracking-[-0.04em]">{plan.price}</div>
                {!plan.popular && <div className="text-xs mt-2" style={{ color: "#8A8173" }}>{plan.note}</div>}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm" style={{ color: "#C7BFB2" }}>
                      <span style={{ color: "#C6A15B", marginTop: "3px" }}><Check /></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.enterprise ? (
                  <a href="mailto:PronosysIA.Help@outlook.com?subject=Demande%20devis%20Entreprise%20PronosysIA" className="btn-outline mt-7 w-full">
                    {t("pricing_contact")}
                  </a>
                ) : (
                  <Link to={user ? "/dashboard/subscription" : "/register"} className={plan.popular ? "btn-gold mt-7 w-full" : "btn-outline mt-7 w-full"}>
                    {plan.popular ? t("pricing_start") : t("pricing_choose")}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-sm mt-8" style={{ color: "#A79C8B" }}>{t("pricing_footer")}</p>
        </section>

        <section className="py-16 lg:py-24">
          <div className="card-gold px-8 py-12 lg:px-14 lg:py-16 text-center">
            <div className="section-kicker justify-center">{t("landing_final_kicker")}</div>
            <h2 className="mt-6 font-display text-white text-[clamp(2.2rem,5vw,4.6rem)] leading-[1.02] tracking-[-0.04em]">
              {t("cta_title")}
            </h2>
            <p className="mt-5 max-w-[720px] mx-auto text-base leading-8" style={{ color: "#D6C8AB" }}>
              {t("cta_desc")}
            </p>
            <Link to={user ? "/dashboard" : "/register"} className="btn-primary mt-8 px-8 py-4">
              {t("cta_button")}
              <Arrow />
            </Link>
          </div>
        </section>

        <footer className="py-10 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <div className="text-white font-extrabold tracking-[-0.05em] text-lg font-brand">
                Pronosys<span style={{ color: "#C6A15B" }}>IA</span>
              </div>
              <div className="text-sm mt-1" style={{ color: "#968D80" }}>{t("footer_tagline")}</div>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: "#B8AFA1" }}>
              <a href="#features" className="hover:text-white transition-colors">{t("nav_features")}</a>
              <a href="#process" className="hover:text-white transition-colors">{t("nav_process")}</a>
              <a href="#pricing" className="hover:text-white transition-colors">{t("nav_pricing")}</a>
            </div>
          </div>
          <div className="mt-8 text-xs text-center" style={{ color: "#756C61" }}>
            &copy; 2026 PronosysIA. {t("footer_copyright")}
          </div>
        </footer>
      </div>
    </div>
  );
}
