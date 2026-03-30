import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useTranslation, LanguageSwitcher } from "../i18n/useLang.jsx";

function useTheme() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return useMemo(() => {
    if (!user) return { label: "FREE", color: "#555" };
    if (user.is_admin) return { label: "ADMIN", color: "#C6A15B", emoji: "\u{1F451}" };
    if (user.plan === "premium_combo") return { label: "COMBO ELITE", color: "#C6A15B", emoji: "\u{1F48E}" };
    if (user.plan === "premium_reseaux") return { label: "CREATOR", color: "#C6A15B", emoji: "\u{1F525}" };
    if (user.plan === "premium_pubs") return { label: "POWER", color: "#C6A15B", emoji: "\u26A1" };
    return { label: "FREE", color: "#555" };
  }, [user?.plan, user?.is_admin]);
}

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({ analyse: true, outils: true, historique: false, compte: true });
  const [scheduledCount, setScheduledCount] = useState(0);
  const theme = useTheme();
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };
  const toggle = (s) => setSectionsOpen(prev => ({ ...prev, [s]: !prev[s] }));

  // Fetch scheduled posts count
  useEffect(() => {
    if (!token) return;
    fetch("/api/scheduled-posts", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.posts) {
          const pending = data.posts.filter(p => p.status !== "published").length;
          setScheduledCount(pending);
        }
      })
      .catch(() => {});
  }, [token, location.pathname]);

  const ChevronIcon = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );

  const I = {
    grid: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
    tv: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="20" height="15" x="2" y="7" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
    phone: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>,
    sparkle: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>,
    rocket: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>,
    chat: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    bar: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
    card: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>,
  };

  const sections = [
    { key: "analyse", label: t("sidebar_section_analyse"), items: [
      { l: t("sidebar_dashboard"), h: "/dashboard", icon: "grid" },
      { l: t("sidebar_pubs"), h: "/dashboard/pubs", icon: "tv" },
      { l: t("sidebar_reseaux"), h: "/dashboard/reseaux", icon: "phone" },
    ]},
    { key: "outils", label: t("sidebar_section_tools"), items: [
      { l: t("sidebar_generator"), h: "/dashboard/generator", icon: "sparkle", dot: true },
      { l: t("sidebar_booster"), h: "/dashboard/booster", icon: "rocket", dot: true, badge: scheduledCount },
      { l: t("sidebar_chatbot"), h: "/dashboard/chatbot", icon: "chat", dot: true },
    ]},
    { key: "historique", label: t("sidebar_section_history"), items: [
      { l: t("sidebar_analyses"), h: "/dashboard/analyses", icon: "bar" },
      { l: t("sidebar_generations"), h: "/dashboard/generations", icon: "sparkle" },
      { l: t("sidebar_conversations"), h: "/dashboard/chat-history", icon: "chat" },
    ]},
    { key: "compte", label: t("sidebar_section_account"), items: [
      { l: t("sidebar_subscription"), h: "/dashboard/subscription", icon: "card" },
      ...(user?.is_admin ? [{ l: t("sidebar_admin"), h: "/dashboard/admin", icon: "settings" }] : []),
    ]},
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#0A0A0A" }}>
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={"fixed lg:sticky top-0 left-0 h-screen w-60 z-40 flex flex-col transition-transform duration-300 " + (open ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}
        style={{ background: "#0A0A0A", borderRight: "1px solid #1C1C1C" }}>

        {/* Logo -> Home */}
        <div className="p-4 pb-3" style={{ borderBottom: "1px solid #1C1C1C" }}>
          <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <span className="text-white font-bold text-base tracking-tight">PronosysIA</span>
            {theme.emoji && <span className="text-sm">{theme.emoji}</span>}
          </Link>
          <p className="text-[9px] mt-1 font-semibold" style={{ color: theme.color, letterSpacing: "0.2em" }}>{theme.label}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {sections.map((sec) => (
            <div key={sec.key} className="mb-1">
              <button onClick={() => toggle(sec.key)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase font-semibold rounded-md transition-colors hover:bg-white/[0.02]"
                style={{ color: "#444", letterSpacing: "0.15em" }}>
                {sec.label}
                <ChevronIcon isOpen={sectionsOpen[sec.key]} />
              </button>
              <div style={{
                maxHeight: sectionsOpen[sec.key] ? "300px" : "0px",
                opacity: sectionsOpen[sec.key] ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s ease, opacity 0.3s ease",
              }}>
                {sec.items.map((n, i) => {
                  const active = location.pathname === n.h;
                  return (
                    <Link key={i} to={n.h} onClick={() => setOpen(false)}
                      className={"flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-[13px] transition-all duration-200 group " + (active ? "text-white" : "text-[#555] hover:text-[#999] hover:bg-white/[0.02]")}
                      style={active ? { background: "rgba(198,161,91,0.06)", borderLeft: "2px solid #C6A15B", marginLeft: "-1px" } : {}}>
                      <span style={{ color: active ? "#C6A15B" : "#444", transition: "color 0.2s" }}>{I[n.icon]}</span>
                      <span className="flex-1">{n.l}</span>
                      {n.badge > 0 && (
                        <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background: "#C6A15B", color: "#0A0A0A" }}>
                          {n.badge}
                        </span>
                      )}
                      {n.dot && !n.badge && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C6A15B" }} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: "1px solid #1C1C1C" }}>
          {user && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#1A1A1A", border: "1px solid #222", color: "#C6A15B" }}>
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{user.name}</p>
                <p className="text-[10px] truncate" style={{ color: "#444" }}>{user.email}</p>
              </div>
            </div>
          )}
          <LanguageSwitcher style={{ marginBottom: "8px" }} />
          <button onClick={logout} className="w-full text-center py-1.5 rounded-md text-[#555] hover:text-[#999] hover:bg-white/[0.02] text-xs transition-all">{t("sidebar_logout")}</button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <div className="lg:hidden flex items-center justify-between p-4" style={{ borderBottom: "1px solid #1C1C1C" }}>
          <button onClick={() => setOpen(true)} className="text-[#555]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
          </button>
          <Link to="/" className="text-white font-bold text-sm">PronosysIA</Link>
          <div className="w-5" />
        </div>
        <div className="p-6 md:p-10 lg:p-14 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}