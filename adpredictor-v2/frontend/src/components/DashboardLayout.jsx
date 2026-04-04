import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useTranslation, LanguageSwitcher } from "../i18n/useLang.jsx";

function useTheme() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return useMemo(() => {
    if (!user) return { label: "FREE", color: "#444" };
    if (user.is_admin) return { label: "ADMIN", color: "#C6A15B", emoji: "\u{1F451}" };
    if (user.plan === "premium_combo") return { label: "COMBO ELITE", color: "#C6A15B", emoji: "\u{1F48E}" };
    if (user.plan === "premium_reseaux") return { label: "CREATOR", color: "#C6A15B", emoji: "\u{1F525}" };
    if (user.plan === "premium_pubs") return { label: "POWER", color: "#C6A15B", emoji: "\u26A1" };
    return { label: "FREE", color: "#444" };
  }, [user?.plan, user?.is_admin]);
}

const Icons = {
  grid: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  tv: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="20" height="15" x="2" y="7" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
  phone: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>,
  sparkle: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>,
  rocket: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>,
  chat: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  bar: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
  card: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  menu: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>,
};

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const theme = useTheme();
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/scheduled-posts", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.posts) setScheduledCount(data.posts.filter(p => p.status !== "published").length);
      })
      .catch(() => {});
  }, [token, location.pathname]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isActive = (path) => path === "/dashboard"
    ? location.pathname === "/dashboard"
    : location.pathname.startsWith(path);

  const navGroups = [
    {
      key: "analyse", label: t("sidebar_section_analyse"), items: [
        { l: t("sidebar_dashboard"), h: "/dashboard", icon: "grid" },
        { l: t("sidebar_pubs"), h: "/dashboard/pubs", icon: "tv" },
        { l: t("sidebar_reseaux"), h: "/dashboard/reseaux", icon: "phone" },
      ]
    },
    {
      key: "outils", label: t("sidebar_section_tools"), items: [
        { l: t("sidebar_generator"), h: "/dashboard/generator", icon: "sparkle", premium: true },
        { l: t("sidebar_booster"), h: "/dashboard/booster", icon: "rocket", premium: true, badge: scheduledCount },
        { l: t("sidebar_chatbot"), h: "/dashboard/chatbot", icon: "chat", premium: true },
      ]
    },
    {
      key: "historique", label: t("sidebar_section_history"), items: [
        { l: t("sidebar_analyses"), h: "/dashboard/analyses", icon: "bar" },
        { l: t("sidebar_generations"), h: "/dashboard/generations", icon: "sparkle" },
        { l: t("sidebar_conversations"), h: "/dashboard/chat-history", icon: "chat" },
      ]
    },
    {
      key: "compte", label: t("sidebar_section_account"), items: [
        { l: t("sidebar_subscription"), h: "/dashboard/subscription", icon: "card" },
        ...(user?.is_admin ? [{ l: t("sidebar_admin"), h: "/dashboard/admin", icon: "settings" }] : []),
      ]
    },
  ];

  const bottomTabs = [
    { l: "Home", h: "/dashboard", icon: "grid" },
    { l: "Pubs", h: "/dashboard/pubs", icon: "tv" },
    { l: "Outils", h: "/dashboard/generator", icon: "sparkle" },
    { l: "Historique", h: "/dashboard/analyses", icon: "bar" },
    { l: "Compte", h: "/dashboard/subscription", icon: "card" },
  ];

  // Sidebar inline style — handles both mobile (fixed) and desktop (sticky)
  const sidebarStyle = {
    width: "252px",
    flexShrink: 0,
    background: "#070707",
    borderRight: "1px solid #1A1A1A",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    zIndex: 40,
    transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
    ...(isDesktop ? {
      position: "sticky",
      top: 0,
      transform: "none",
    } : {
      position: "fixed",
      top: 0,
      left: 0,
      transform: open ? "translateX(0)" : "translateX(-100%)",
    }),
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#090909" }}>

      {/* Mobile overlay */}
      {!isDesktop && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 35,
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside style={sidebarStyle}>

        {/* Gold signature line */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #C6A15B 40%, #D4B87A 60%, transparent)", flexShrink: 0 }} />

        {/* Brand */}
        <div style={{ padding: "18px 16px 16px", borderBottom: "1px solid #141414", flexShrink: 0 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "11px", textDecoration: "none" }}>
            {/* Logo mark */}
            <div style={{
              width: "34px", height: "34px",
              background: "linear-gradient(135deg, rgba(198,161,91,0.15), rgba(198,161,91,0.05))",
              border: "1px solid rgba(198,161,91,0.25)",
              borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', 'Inter', sans-serif", fontWeight: 800, fontSize: "15px", letterSpacing: "-0.03em", color: "white", lineHeight: 1.1 }}>
                Pronosys<span style={{ color: "#C6A15B" }}>IA</span>
              </div>
              <div style={{ fontSize: "9px", color: theme.color, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "3px" }}>
                {theme.label}{theme.emoji ? ` ${theme.emoji}` : ""}
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px", scrollbarWidth: "none" }}>
          {navGroups.map((group, gi) => (
            <div key={group.key} style={{ marginBottom: "4px", marginTop: gi > 0 ? "20px" : "0" }}>
              <div style={{ padding: "0 8px 6px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#383838" }}>
                {group.label}
              </div>
              {group.items.map((item, ii) => {
                const active = isActive(item.h);
                return (
                  <Link
                    key={ii}
                    to={item.h}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 10px",
                      borderRadius: "8px",
                      marginBottom: "1px",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                      background: active ? "rgba(198,161,91,0.08)" : "transparent",
                      borderLeft: active ? "2px solid #C6A15B" : "2px solid transparent",
                      paddingLeft: "9px",
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ color: active ? "#C6A15B" : "#4A4A4A", flexShrink: 0, display: "flex" }}>
                      {Icons[item.icon]}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? "white" : "#666", flex: 1, lineHeight: 1 }}>
                      {item.l}
                    </span>
                    {item.badge > 0 && (
                      <span style={{ minWidth: "18px", height: "18px", background: "#C6A15B", color: "#080808", borderRadius: "9px", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                        {item.badge}
                      </span>
                    )}
                    {item.premium && !item.badge && (
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: active ? "#C6A15B" : "#2A2A2A", flexShrink: 0 }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: "12px 10px 14px", borderTop: "1px solid #141414", flexShrink: 0 }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: "#0D0D0D", border: "1px solid #1A1A1A", marginBottom: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg, rgba(198,161,91,0.2), rgba(198,161,91,0.08))", border: "1px solid rgba(198,161,91,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#C6A15B", flexShrink: 0 }}>
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "white", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ fontSize: "10px", color: "#555", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
            </div>
          )}
          <LanguageSwitcher style={{ marginBottom: "8px" }} />
          <button
            onClick={logout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", color: "#555", fontSize: "12px", fontWeight: 500, transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#999"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ display: "flex" }}>{Icons.logout}</span>
            {t("sidebar_logout")}
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Mobile top bar */}
        {!isDesktop && (
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: "56px", background: "#070707", borderBottom: "1px solid #141414", position: "sticky", top: 0, zIndex: 20, flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(198,161,91,0.5), transparent)" }} />
            <button
              onClick={() => setOpen(true)}
              style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", border: "1px solid #1E1E1E", borderRadius: "9px", color: "#777", cursor: "pointer" }}
            >
              {Icons.menu}
            </button>
            <div style={{ fontFamily: "'Syne', 'Inter', sans-serif", fontWeight: 800, fontSize: "15px", letterSpacing: "-0.03em", color: "white" }}>
              Pronosys<span style={{ color: "#C6A15B" }}>IA</span>
            </div>
            <div style={{ width: "36px" }} />
          </header>
        )}

        {/* Page content */}
        <div style={{ flex: 1, padding: "clamp(24px, 4vw, 52px)", maxWidth: "1024px", width: "100%", margin: "0 auto", paddingBottom: isDesktop ? "52px" : "88px" }}>
          {children}
        </div>
      </main>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      {!isDesktop && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#070707", borderTop: "1px solid #161616", zIndex: 30 }}>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(198,161,91,0.35), transparent)" }} />
          <div style={{ display: "flex", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            {bottomTabs.map((tab, i) => {
              const active = isActive(tab.h);
              return (
                <Link
                  key={i}
                  to={tab.h}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 4px", textDecoration: "none", color: active ? "#C6A15B" : "#444", transition: "color 0.15s ease", position: "relative" }}
                >
                  {active && <div style={{ position: "absolute", top: 0, left: "25%", right: "25%", height: "1px", background: "#C6A15B" }} />}
                  <span style={{ display: "flex" }}>{Icons[tab.icon]}</span>
                  <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{tab.l}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
