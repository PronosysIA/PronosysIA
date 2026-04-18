import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { useTranslation } from "../i18n/useLang.jsx";

const Check = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>;
const Lock = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;

export default function Subscription() {
  const { t } = useTranslation();
  const [billing, setBilling] = useState("monthly");
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(null);
  const [stripeError, setStripeError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/subscription", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setSub(d))
      .finally(() => setLoading(false));
  }, [token]);

  const subscribe = async (plan) => {
    setStripeLoading(plan);
    setStripeError("");
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_type: plan, billing }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setStripeError(data.detail || t("sub_checkout_error"));
      }
    } catch {
      setStripeError(t("sub_server_error"));
    } finally {
      setStripeLoading(null);
    }
  };

  const portal = async () => {
    try {
      const res = await fetch("/api/stripe/customer-portal", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.portal_url) window.location.href = data.portal_url;
    } catch {}
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div></DashboardLayout>;

  const plans = [
    { key: "free", title: t("sub_plan_free"), emoji: "??", price: "0€", note: "", features: [
      { text: t("sub_plan_free_desc_1"), ok: true }, { text: t("sub_plan_free_desc_2"), ok: true }, { text: t("sub_plan_free_desc_3"), ok: true }, { text: t("sub_plan_free_desc_4"), ok: true }, { text: t("sub_plan_free_desc_5"), ok: false }, { text: t("sub_plan_free_desc_6"), ok: false },
    ] },
    { key: "premium_pubs", type: "pubs", title: t("sub_plan_power"), emoji: "?", price: billing === "yearly" ? "7,99€" : "9,99€", note: t("common_monthly_suffix"), features: [
      { text: t("sub_plan_power_desc_1"), ok: true }, { text: t("sub_plan_power_desc_2"), ok: true }, { text: t("sub_plan_power_desc_3"), ok: true }, { text: t("sub_plan_power_desc_4"), ok: true }, { text: t("sub_plan_power_desc_5"), ok: true }, { text: t("sub_plan_power_desc_6"), ok: false }, { text: t("sub_plan_power_desc_7"), ok: false },
    ] },
    { key: "premium_reseaux", type: "reseaux", title: t("sub_plan_creator"), emoji: "??", price: billing === "yearly" ? "7,99€" : "9,99€", note: t("common_monthly_suffix"), features: [
      { text: t("sub_plan_creator_desc_1"), ok: true }, { text: t("sub_plan_creator_desc_2"), ok: true }, { text: t("sub_plan_creator_desc_3"), ok: true }, { text: t("sub_plan_creator_desc_4"), ok: true }, { text: t("sub_plan_creator_desc_5"), ok: true }, { text: t("sub_plan_creator_desc_6"), ok: false }, { text: t("sub_plan_creator_desc_7"), ok: false },
    ] },
    { key: "premium_combo", type: "combo", title: t("sub_plan_combo"), emoji: "??", price: billing === "yearly" ? "9,99€" : "11,99€", note: t("common_monthly_suffix"), popular: true, features: [
      { text: t("sub_plan_combo_desc_1"), ok: true }, { text: t("sub_plan_combo_desc_2"), ok: true }, { text: t("sub_plan_combo_desc_3"), ok: true }, { text: t("sub_plan_combo_desc_4"), ok: true }, { text: t("sub_plan_combo_desc_5"), ok: true }, { text: t("sub_plan_combo_desc_6"), ok: true },
    ] },
  ];

  const currentPlanLabel = sub?.plan === "premium_pubs" ? `${t("sub_plan_power")} ?` : sub?.plan === "premium_reseaux" ? `${t("sub_plan_creator")} ??` : sub?.plan === "premium_combo" ? `${t("sub_plan_combo")} ??` : sub?.plan;

  return (
    <DashboardLayout>
      <div className="mb-16 animate-fadeInUp"><h1 className="font-display text-4xl italic text-white mb-3">{t("sub_title")}</h1><p className="text-sm" style={{ color: "#555" }}>{t("sub_desc")}</p></div>

      {stripeError && <div className="card px-5 py-4 mb-8 animate-fadeInUp" style={{ borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)" }}><p className="text-sm" style={{ color: "#F87171" }}>{stripeError}</p></div>}

      {sub && sub.plan !== "free" && <div className="card-gold p-6 mb-10 animate-fadeInUp"><p className="text-sm" style={{ color: "#C6A15B" }}>{t("sub_current")}: <strong>{currentPlanLabel}</strong>{sub.plan === "premium_pubs" && <span className="ml-2 text-xs" style={{ color: "#888" }}>- {t("sub_current_power")}</span>}{sub.plan === "premium_reseaux" && <span className="ml-2 text-xs" style={{ color: "#888" }}>- {t("sub_current_creator")}</span>}{sub.plan === "premium_combo" && <span className="ml-2 text-xs" style={{ color: "#888" }}>- {t("sub_full_access")}</span>}</p></div>}

      <div className="flex items-center gap-3 mb-12 animate-fadeInUp delay-100">{["monthly", "yearly"].map((item) => <button key={item} onClick={() => setBilling(item)} className="px-5 py-2.5 rounded-lg text-sm transition-all" style={billing === item ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { color: "#555", border: "1px solid #1C1C1C" }}>{item === "monthly" ? t("sub_monthly") : t("sub_yearly")} {item === "yearly" && <span className="ml-1 text-xs" style={{ color: "#4ADE80" }}>-20%</span>}</button>)}</div>

      <div className="card p-6 mb-8 animate-fadeInUp delay-200"><p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#C6A15B" }}>{t("sub_explain_plans")}</p><div className="grid md:grid-cols-3 gap-6 text-sm"><div><p className="text-white font-medium mb-1">{t("sub_plan_power")} ?</p><p style={{ color: "#555" }}>{t("sub_understand_power")}</p></div><div><p className="text-white font-medium mb-1">{t("sub_plan_creator")} ??</p><p style={{ color: "#555" }}>{t("sub_understand_creator")}</p></div><div><p className="text-white font-medium mb-1">{t("sub_plan_combo")} ??</p><p style={{ color: "#555" }}>{t("sub_understand_combo")}</p></div></div></div>

      <div className="grid md:grid-cols-4 gap-5 stagger-children">{plans.map((plan, i) => { const isCurrent = sub?.plan === plan.key; return <div key={i} className={`card animate-fadeInUp ${isCurrent ? "scale-[1.02]" : ""}`} style={plan.popular || isCurrent ? { border: "1px solid #C6A15B" } : {}}>{plan.popular && !isCurrent && <div className="text-center py-2 text-[10px] font-semibold tracking-widest uppercase text-white" style={{ background: "#C6A15B", borderRadius: "1rem 1rem 0 0" }}>{t("common_recommended")}</div>}{isCurrent && <div className="text-center py-2 text-[10px] font-semibold tracking-widest uppercase text-white" style={{ background: "#C6A15B", borderRadius: "1rem 1rem 0 0" }}>{t("common_current_plan")}</div>}<div className="p-8"><div className="flex items-center gap-2 mb-1"><span className="text-lg">{plan.emoji}</span><h3 className="text-white font-medium">{plan.title}</h3></div><div className="mt-4 mb-8"><span className="text-3xl font-display italic text-white">{plan.price}</span><span className="text-sm ml-1" style={{ color: "#555" }}>{plan.note}</span></div><ul className="space-y-3 mb-8">{plan.features.map((feature, j) => <li key={j} className="flex items-start gap-2 text-sm" style={{ color: feature.ok ? "#888" : "#333" }}><span className="mt-0.5" style={{ color: feature.ok ? "#C6A15B" : "#333" }}>{feature.ok ? <Check /> : <Lock />}</span><span className={feature.ok ? "" : "line-through"}>{feature.text}</span></li>)}</ul>{isCurrent ? <div className="text-center py-3 rounded-lg text-sm" style={{ background: "rgba(198,161,91,0.06)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.15)" }}>{t("common_current_plan")}</div> : plan.type ? <button onClick={() => subscribe(plan.type)} disabled={stripeLoading === plan.type} className={`w-full py-3 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 ${plan.popular ? "text-white" : "text-white border"}`} style={plan.popular ? { background: stripeLoading === plan.type ? "#A8864A" : "#C6A15B", opacity: stripeLoading ? 0.8 : 1 } : { borderColor: "#333", opacity: stripeLoading ? 0.8 : 1 }}>{stripeLoading === plan.type ? t("sub_loading") : t("common_choose")}</button> : null}</div></div>; })}</div>

      <div className="card p-8 text-center mt-10 animate-fadeInUp delay-400"><p className="text-white font-medium mb-1">{t("sub_without_subscription")}</p><p className="text-sm mb-4" style={{ color: "#555" }}>{t("sub_one_time_pack")}</p><button onClick={() => subscribe("individual")} disabled={stripeLoading === "individual"} className="btn-outline">{stripeLoading === "individual" ? t("sub_loading") : t("sub_buy_pack")}</button></div>

      {sub?.stripe_customer_id && <div className="text-center mt-6"><button onClick={portal} className="text-sm" style={{ color: "#C6A15B" }}>{t("sub_manage")}</button></div>}
    </DashboardLayout>
  );
}
