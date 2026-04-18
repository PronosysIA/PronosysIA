import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { useTranslation } from "../i18n/useLang.jsx";

function StatCard({ label, value, detail, accent, delay = 0 }) {
  return (
    <div className="card p-6 animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#8A8173" }}>{label}</div>
      <div className="mt-3 text-white text-4xl font-extrabold tracking-[-0.05em]">{value}</div>
      <div className="mt-3 text-sm" style={{ color: accent || "#BEB6A9" }}>{detail}</div>
    </div>
  );
}

function ActionCard({ title, desc, href, badge, accent = "#C6A15B", locked, lockText, cta }) {
  const content = (
    <div className={locked ? "card p-6 opacity-50" : "card p-6"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>{badge}</div>
          <div className="mt-3 text-white text-xl font-semibold">{title}</div>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: locked ? "rgba(255,255,255,0.04)" : "rgba(198,161,91,0.12)", color: locked ? "#6E675C" : "#C6A15B", border: locked ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(198,161,91,0.18)" }}>
          {locked ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect width="18" height="11" x="3" y="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm leading-7" style={{ color: "#BEB6A9" }}>{desc}</p>
      <div className="mt-6 text-sm font-semibold" style={{ color: locked ? "#8A8173" : accent }}>
        {locked ? lockText : cta}
      </div>
    </div>
  );

  return locked ? content : <Link to={href} className="no-underline">{content}</Link>;
}

function PlanCard({ title, desc, cta, href }) {
  return (
    <div className="card-gold p-7">
      <div className="section-kicker">{title}</div>
      <div className="mt-5 text-white text-2xl font-display">{desc}</div>
      <Link to={href} className="btn-primary mt-6">
        {cta}
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState({ total_analyses: 0, remaining: "...", avg_score: null, plan: "..." });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setMessage(t("dash_payment_success"));
    }
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch("/api/dashboard-stats", { headers })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams, token, t]);

  const plan = user?.plan || "free";
  const isPremium = user?.is_admin || ["premium_pubs", "premium_reseaux", "premium_combo"].includes(plan);
  const isCombo = user?.is_admin || plan === "premium_combo";
  const canPubs = user?.is_admin || ["free", "premium_pubs", "premium_combo"].includes(plan);
  const canReseaux = user?.is_admin || ["free", "premium_reseaux", "premium_combo"].includes(plan);

  const remainingValue = loading ? t("dash_stats_avg_empty") : stats.remaining === "illimite" ? t("dash_stats_unlimited") : stats.remaining;
  const averageValue = loading ? t("dash_stats_avg_empty") : stats.avg_score ? `${stats.avg_score}` : t("dash_stats_avg_empty");

  return (
    <DashboardLayout>
      {message && (
        <div className="card-gold px-5 py-4 mb-6 animate-fadeIn">
          <p className="text-sm" style={{ color: "#F5E2B6" }}>{message}</p>
        </div>
      )}

      <section className="grid xl:grid-cols-[1.08fr_0.92fr] gap-5 items-start">
        <div className="card p-8 sm:p-10 animate-fadeInUp">
          <div className="section-kicker">{t("dash_brand")}</div>
          <h1 className="mt-5 font-display text-white text-[clamp(2.2rem,4.6vw,4.6rem)] leading-[1.02] tracking-[-0.05em]">
            {user ? `${t("dash_hello")} ${user.name}.` : t("dash_guest_welcome")}
          </h1>
          <p className="mt-5 text-base leading-8 max-w-[680px]" style={{ color: "#C6BEB2" }}>
            {user ? t("dash_user_desc") : t("dash_guest_desc")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="metric-pill">{t("dash_mission_pill")}</span>
            <span className="metric-pill" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
              {loading ? t("common_loading") : stats.plan}
            </span>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <ActionCard
              title={t("dash_pubs_title")}
              desc={t("dash_pubs_desc")}
              href="/dashboard/pubs"
              badge={t("sidebar_pubs")}
              locked={!canPubs}
              lockText={t("dash_requires_premium")}
              cta={t("common_open")}
            />
            <ActionCard
              title={t("dash_reseaux_title")}
              desc={t("dash_reseaux_desc")}
              href="/dashboard/reseaux"
              badge={t("sidebar_reseaux")}
              locked={!canReseaux}
              lockText={t("dash_requires_premium")}
              cta={t("common_open")}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <PlanCard
            title={t("dash_upgrade_label")}
            desc={isPremium ? t("dash_plan_active_desc") : t("dash_upgrade_heading")}
            cta={isPremium ? t("sub_manage") : t("dash_upgrade_btn")}
            href="/dashboard/subscription"
          />
          <div className="card p-6 animate-fadeInUp delay-100">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#8A8173" }}>{t("dash_focus_title")}</div>
            <div className="mt-3 text-white text-lg font-semibold">{t("dash_focus_desc")}</div>
            <p className="mt-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>{t("dash_focus_note")}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label={t("dash_stats_analyses")} value={loading ? t("dash_stats_avg_empty") : stats.total_analyses} detail={t("dash_stats_analyses_detail")} delay={0} />
        <StatCard label={t("dash_stats_remaining")} value={remainingValue} detail={t("dash_stats_remaining_detail")} delay={80} />
        <StatCard label={t("dash_avg")} value={averageValue} detail={t("dash_stats_avg_detail")} delay={160} accent="#C6A15B" />
        <StatCard label={t("dash_plan")} value={loading ? t("dash_stats_avg_empty") : stats.plan} detail={t("dash_stats_plan_detail")} delay={240} />
      </section>

      <section className="mt-5 grid xl:grid-cols-[1.02fr_0.98fr] gap-5">
        <div className="card p-7 animate-fadeInUp">
          <div className="section-kicker">{t("dash_tools")}</div>
          <h2 className="mt-5 text-white font-display text-3xl">{t("dash_tools_title")}</h2>
          <p className="mt-4 text-sm leading-7" style={{ color: "#BEB6A9" }}>{t("dash_tools_desc")}</p>

          <div className="mt-7 grid gap-4">
            <ActionCard
              title={t("sidebar_generator")}
              desc={t("dash_tool_generator_desc")}
              href="/dashboard/generator"
              badge={t("dash_tools_generator_badge")}
              locked={!isPremium}
              lockText={t("dash_requires_premium")}
              cta={t("common_open")}
            />
            <ActionCard
              title={t("sidebar_booster")}
              desc={t("dash_tool_booster_desc")}
              href="/dashboard/booster"
              badge={t("dash_tools_booster_badge")}
              locked={!isPremium}
              lockText={t("dash_requires_premium")}
              cta={t("common_open")}
            />
            <ActionCard
              title={t("sidebar_chatbot")}
              desc={t("dash_tool_chatbot_desc")}
              href="/dashboard/chatbot"
              badge={t("dash_tools_chatbot_badge")}
              locked={!isCombo}
              lockText={t("dash_requires_combo")}
              cta={t("common_open")}
            />
          </div>
        </div>

        <div className="grid gap-5">
          <div className="card p-7 animate-fadeInUp delay-100">
            <div className="section-kicker">{t("dash_membership_title")}</div>
            <h2 className="mt-5 text-white font-display text-3xl">{t("dash_membership_desc")}</h2>
            <p className="mt-4 text-sm leading-7" style={{ color: "#BEB6A9" }}>{t("dash_membership_note")}</p>
            <Link to="/dashboard/subscription" className="btn-gold mt-6">
              {t("sub_upgrade")}
            </Link>
          </div>

          <div className="card p-7 animate-fadeInUp delay-200">
            <div className="section-kicker">{t("dash_next_step_title")}</div>
            <div className="mt-5 space-y-4">
              <div className="glass-card p-4">
                <div className="text-white font-semibold">{t("dash_next_step_1")}</div>
                <div className="text-sm mt-1" style={{ color: "#BEB6A9" }}>{t("dash_next_step_1_desc")}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-white font-semibold">{t("dash_next_step_2")}</div>
                <div className="text-sm mt-1" style={{ color: "#BEB6A9" }}>{t("dash_next_step_2_desc")}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-white font-semibold">{t("dash_next_step_3")}</div>
                <div className="text-sm mt-1" style={{ color: "#BEB6A9" }}>{t("dash_next_step_3_desc")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
