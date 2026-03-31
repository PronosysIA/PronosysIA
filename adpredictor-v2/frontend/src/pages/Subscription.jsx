import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";

const Check = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const Lock = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function Subscription() {
  const [billing, setBilling] = useState("monthly");
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => { fetch("/api/subscription", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setSub(d)).finally(() => setLoading(false)); }, []);

  const subscribe = async (plan) => {
    try {
      const res = await fetch("/api/stripe/create-checkout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ plan_type: plan, billing }) });
      const d = await res.json(); if (d.checkout_url) window.location.href = d.checkout_url;
    } catch { alert("Erreur."); }
  };

  const portal = async () => {
    try { const res = await fetch("/api/stripe/customer-portal", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }); const d = await res.json(); if (d.portal_url) window.location.href = d.portal_url; } catch {}
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div></DashboardLayout>;

  const plans = [
    {
      key: "free", title: "Gratuit", emoji: "🆓",
      price: "0€", note: "",
      features: [
        { text: "3 analyses au total (pubs ou reseaux)", ok: true },
        { text: "Score de viralite", ok: true },
        { text: "1 generation de script", ok: true },
        { text: "1 boost", ok: true },
        { text: "Generateur illimite", ok: false },
        { text: "Chatbot Video IA", ok: false },
      ],
    },
    {
      key: "premium_pubs", type: "pubs", title: "Premium Power", emoji: "⚡",
      price: billing === "yearly" ? "7,99€" : "9,99€", note: "/mois",
      features: [
        { text: "Analyses Pubs illimitees", ok: true },
        { text: "Recommandations IA detaillees", ok: true },
        { text: "Predictions de vues", ok: true },
        { text: "Generateur IA illimite", ok: true },
        { text: "Boosteur illimite", ok: true },
        { text: "Analyses Reseaux", ok: false },
        { text: "Chatbot Video IA", ok: false },
      ],
    },
    {
      key: "premium_reseaux", type: "reseaux", title: "Premium Creator", emoji: "🔥",
      price: billing === "yearly" ? "7,99€" : "9,99€", note: "/mois",
      features: [
        { text: "Analyses Reseaux illimitees", ok: true },
        { text: "Codes de viralite IA", ok: true },
        { text: "Predictions de vues", ok: true },
        { text: "Generateur IA illimite", ok: true },
        { text: "Boosteur illimite", ok: true },
        { text: "Analyses Pubs", ok: false },
        { text: "Chatbot Video IA", ok: false },
      ],
    },
    {
      key: "premium_combo", type: "combo", title: "Combo Elite", emoji: "💎",
      price: billing === "yearly" ? "9,99€" : "11,99€", note: "/mois",
      popular: true,
      features: [
        { text: "Analyses Pubs + Reseaux illimitees", ok: true },
        { text: "Generateur IA illimite", ok: true },
        { text: "Boosteur illimite", ok: true },
        { text: "Chatbot Video IA", ok: true },
        { text: "Script ultra-detaille + storyboard", ok: true },
        { text: "Support prioritaire", ok: true },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-16 animate-fadeInUp">
        <h1 className="font-display text-4xl italic text-white mb-3">Abonnement.</h1>
      </div>

      {sub && sub.plan !== "free" && (
        <div className="card-gold p-6 mb-10 animate-fadeInUp">
          <p className="text-sm" style={{ color: "#C6A15B" }}>
            Plan actuel : <strong>{sub.plan === "premium_pubs" ? "Premium Power ⚡" : sub.plan === "premium_reseaux" ? "Premium Creator 🔥" : sub.plan === "premium_combo" ? "Combo Elite 💎" : sub.plan}</strong>
            {sub.plan === "premium_pubs" && <span className="ml-2 text-xs" style={{ color: "#888" }}>— Pubs + Generateur + Boosteur</span>}
            {sub.plan === "premium_reseaux" && <span className="ml-2 text-xs" style={{ color: "#888" }}>— Reseaux + Generateur + Boosteur</span>}
            {sub.plan === "premium_combo" && <span className="ml-2 text-xs" style={{ color: "#888" }}>— Acces complet</span>}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-12 animate-fadeInUp delay-100">
        {["monthly", "yearly"].map(b => (
          <button key={b} onClick={() => setBilling(b)} className="px-5 py-2.5 rounded-lg text-sm transition-all"
            style={billing === b ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { color: "#555", border: "1px solid #1C1C1C" }}>
            {b === "monthly" ? "Mensuel" : "Annuel"} {b === "yearly" && <span className="ml-1 text-xs" style={{ color: "#4ADE80" }}>-20%</span>}
          </button>
        ))}
      </div>

      <div className="card p-6 mb-8 animate-fadeInUp delay-200">
        <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#C6A15B" }}>Comprendre les plans</p>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div><p className="text-white font-medium mb-1">Premium Power ⚡</p><p style={{ color: "#555" }}>Analyses Pubs illimitees + Generateur + Boosteur. Pas d'acces aux analyses Reseaux ni au Chatbot.</p></div>
          <div><p className="text-white font-medium mb-1">Premium Creator 🔥</p><p style={{ color: "#555" }}>Analyses Reseaux illimitees + Generateur + Boosteur. Pas d'acces aux analyses Pubs ni au Chatbot.</p></div>
          <div><p className="text-white font-medium mb-1">Combo Elite 💎</p><p style={{ color: "#555" }}>Tout inclus : Pubs + Reseaux + Generateur + Boosteur + Chatbot Video IA.</p></div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-5 stagger-children">
        {plans.map((p, i) => {
          const isCurrent = sub?.plan === p.key;
          return (
            <div key={i} className={`card animate-fadeInUp ${isCurrent ? "scale-[1.02]" : ""}`}
              style={p.popular ? { border: "1px solid #C6A15B" } : isCurrent ? { border: "1px solid #C6A15B" } : {}}>
              {p.popular && !isCurrent && <div className="text-center py-2 text-[10px] font-semibold tracking-widest uppercase text-white" style={{ background: "#C6A15B", borderRadius: "1rem 1rem 0 0" }}>Recommande</div>}
              {isCurrent && <div className="text-center py-2 text-[10px] font-semibold tracking-widest uppercase text-white" style={{ background: "#C6A15B", borderRadius: "1rem 1rem 0 0" }}>Votre plan</div>}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-1"><span className="text-lg">{p.emoji}</span><h3 className="text-white font-medium">{p.title}</h3></div>
                <div className="mt-4 mb-8"><span className="text-3xl font-display italic text-white">{p.price}</span><span className="text-sm ml-1" style={{ color: "#555" }}>{p.note}</span></div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: f.ok ? "#888" : "#333" }}>
                      <span className="mt-0.5" style={{ color: f.ok ? "#C6A15B" : "#333" }}>{f.ok ? <Check /> : <Lock />}</span>
                      <span className={f.ok ? "" : "line-through"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="text-center py-3 rounded-lg text-sm" style={{ background: "rgba(198,161,91,0.06)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.15)" }}>Plan actuel</div>
                ) : p.type ? (
                  <button onClick={() => subscribe(p.type)} className={`w-full py-3 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 ${p.popular ? "text-white" : "text-white border"}`}
                    style={p.popular ? { background: "#C6A15B" } : { borderColor: "#333" }}>Choisir</button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-8 text-center mt-10 animate-fadeInUp delay-400">
        <p className="text-white font-medium mb-1">Sans abonnement</p>
        <p className="text-sm mb-4" style={{ color: "#555" }}>Pack 2 analyses a 5€ — Paiement unique</p>
        <button onClick={() => subscribe("individual")} className="btn-outline">Acheter — 5€</button>
      </div>

      {sub?.stripe_customer_id && <div className="text-center mt-6"><button onClick={portal} className="text-sm" style={{ color: "#C6A15B" }}>Gerer mon abonnement →</button></div>}
    </DashboardLayout>
  );
}