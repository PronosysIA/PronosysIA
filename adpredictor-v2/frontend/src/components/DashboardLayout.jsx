import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation, LanguageSwitcher } from "../i18n/useLang.jsx";
import NotificationBanner from "./NotificationBanner.jsx";

const Icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect width="7" height="7" x="3" y="3" rx="1.4" />
      <rect width="7" height="7" x="14" y="3" rx="1.4" />
      <rect width="7" height="7" x="14" y="14" rx="1.4" />
      <rect width="7" height="7" x="3" y="14" rx="1.4" />
    </svg>
  ),
  ads: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect width="20" height="15" x="2" y="5" rx="2" />
      <path d="M7 20v2M17 20v2M2 10h20" />
    </svg>
  ),
  social: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect width="14" height="20" x="5" y="2" rx="2.5" />
      <path d="M12 18h.01" />
    </svg>
  ),
  generator: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  ),
  booster: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M5 19c-1.4 1.18-2 4-2 4s2.82-.6 4-2c.7-.83.63-2.04-.11-2.77C6.16 17.5 5.95 17.3 5 19z" />
      <path d="M14 14l-4-4c.9-2.9 2.6-5.38 5.02-6.98C18.01 1.04 21 1 21 1s.04 2.99-1.02 5.98C18.38 9.4 15.9 11.1 13 12z" />
    </svg>
  ),
  chatbot: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 5V5z" />
    </svg>
  ),
  history: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M12 8v5l3 2" />
      <path d="M3.05 11A9 9 0 1 0 6 5.3" />
      <path d="M3 4v5h5" />
    </svg>
  ),
  billing: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  admin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path d="M3 12h2m14 0h2M12 3v2m0 14v2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4" />
    </svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M20 19V5a2 2 0 0 0-2-2h-4" />
    </svg>
  ),
  menu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
};

function getTheme(user) {
  if (!user) return { label: "FREE", detail: "Starter access", accent: "#686158" };
  if (user.is_admin) return { label: "ADMIN", detail: "Full control", accent: "#C6A15B" };
  if (user.plan === "premium_combo") return { label: "COMBO ELITE", detail: "All systems unlocked", accent: "#C6A15B" };
  if (user.plan === "premium_reseaux") return { label: "CREATOR", detail: "Social virality stack", accent: "#C6A15B" };
  if (user.plan === "premium_pubs") return { label: "POWER", detail: "Ads performance stack", accent: "#C6A15B" };
  if (user.plan === "individual") return { label: "PACK", detail: "Credit-based access", accent: "#C6A15B" };
  return { label: "FREE", detail: "Starter access", accent: "#686158" };
}

function BrandMark() {
  return (
    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(198,161,91,0.22), rgba(198,161,91,0.06))", border: "1px solid rgba(198,161,91,0.24)", boxShadow: "0 12px 28px rgba(0,0,0,0.28)" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    </div>
  );
}

function SidebarLink({ item, active, onClick }) {
  return (
    <Link
      to={item.h}
      onClick={onClick}
      className="group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all"
      style={active ? { background: "linear-gradient(135deg, rgba(198,161,91,0.16), rgba(198,161,91,0.05))", border: "1px solid rgba(198,161,91,0.2)" } : { border: "1px solid transparent" }}
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-xl transition-all" style={active ? { background: "rgba(198,161,91,0.16)", color: "#C6A15B" } : { background: "rgba(255,255,255,0.03)", color: "#7D7568" }}>
        {Icons[item.icon]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold leading-none" style={{ color: active ? "#F6F0E5" : "#D2CAC0" }}>{item.l}</div>
        {item.sub && <div className="text-[11px] mt-1 truncate" style={{ color: active ? "#B8AB93" : "#6F685D" }}>{item.sub}</div>}
      </div>
      {item.badge > 0 && (
        <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center" style={{ background: "#C6A15B", color: "#120f0a" }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const theme = getTheme(user);
  const [open, setOpen] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/scheduled-posts", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.posts) {
          setScheduledCount(data.posts.filter((post) => post.status !== "published").length);
        }
      })
      .catch(() => {});
  }, [token, location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(path);

  const navGroups = [
    {
      key: "analysis",
      label: t("sidebar_section_analyse"),
      items: [
        { l: t("sidebar_dashboard"), h: "/dashboard", icon: "dashboard", sub: t("dash_tools_label") },
        { l: t("sidebar_pubs"), h: "/dashboard/pubs", icon: "ads", sub: t("analyze_pubs_subdesc") },
        { l: t("sidebar_reseaux"), h: "/dashboard/reseaux", icon: "social", sub: t("analyze_reseaux_subdesc") },
      ],
    },
    {
      key: "tools",
      label: t("sidebar_section_tools"),
      items: [
        { l: t("sidebar_generator"), h: "/dashboard/generator", icon: "generator", sub: t("dash_tool_generator_desc") },
        { l: t("sidebar_booster"), h: "/dashboard/booster", icon: "booster", sub: t("dash_tool_booster_desc"), badge: scheduledCount },
        { l: t("sidebar_chatbot"), h: "/dashboard/chatbot", icon: "chatbot", sub: t("dash_tool_chatbot_desc") },
      ],
    },
    {
      key: "history",
      label: t("sidebar_section_history"),
      items: [
        { l: t("sidebar_analyses"), h: "/dashboard/analyses", icon: "history", sub: t("history_analyses_desc") },
        { l: t("sidebar_generations"), h: "/dashboard/generations", icon: "generator", sub: t("history_gens_desc") },
        { l: t("sidebar_conversations"), h: "/dashboard/chat-history", icon: "chatbot", sub: t("history_chats_desc") },
      ],
    },
    {
      key: "account",
      label: t("sidebar_section_account"),
      items: [
        { l: t("sidebar_subscription"), h: "/dashboard/subscription", icon: "billing", sub: t("sub_desc") },
        ...(user?.is_admin ? [{ l: t("sidebar_admin"), h: "/dashboard/admin", icon: "admin", sub: t("admin_platform_management") }] : []),
      ],
    },
  ];

  const mobileTabs = [
    { l: t("sidebar_dashboard"), h: "/dashboard", icon: "dashboard" },
    { l: t("sidebar_pubs"), h: "/dashboard/pubs", icon: "ads" },
    { l: t("sidebar_generator"), h: "/dashboard/generator", icon: "generator" },
    { l: t("sidebar_booster"), h: "/dashboard/booster", icon: "booster" },
    { l: t("sidebar_subscription"), h: "/dashboard/subscription", icon: "billing" },
  ];

  return (
    <div className="layout-shell">
      <NotificationBanner />

      {!isDesktop && open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}

      <div className="relative z-10 flex min-h-screen">
        <aside
          className="fixed lg:sticky top-0 left-0 z-40 h-screen w-[310px] max-w-[86vw] transition-transform duration-300"
          style={{
            transform: isDesktop || open ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          <div className="h-full p-4 lg:p-5">
            <div className="h-full rounded-[30px] border backdrop-blur-xl overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(12,12,12,0.92), rgba(8,8,8,0.96))", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.45)" }}>
              <div className="h-full flex flex-col">
                <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <Link to="/" className="flex items-center gap-3 no-underline">
                    <BrandMark />
                    <div>
                      <div className="text-[1.05rem] leading-none font-extrabold tracking-[-0.04em] text-white font-brand">
                        Pronosys<span style={{ color: "#C6A15B" }}>IA</span>
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.26em]" style={{ color: theme.accent }}>
                        {theme.label}
                      </div>
                    </div>
                  </Link>

                  <div className="mt-5 card-gold p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em]" style={{ color: "#C6A15B" }}>
                      {t("common_current_plan")}
                    </div>
                    <div className="mt-2 text-white text-sm font-semibold">{theme.label}</div>
                    <div className="text-xs mt-1" style={{ color: "#BDAE92" }}>{theme.detail}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5">
                  {navGroups.map((group) => (
                    <div key={group.key} className="mb-7">
                      <div className="px-2 mb-3 text-[10px] uppercase tracking-[0.24em]" style={{ color: "#6C6458" }}>
                        {group.label}
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <SidebarLink key={item.h} item={item} active={isActive(item.h)} onClick={() => setOpen(false)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {user && (
                    <div className="glass-card px-4 py-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-extrabold" style={{ background: "rgba(198,161,91,0.12)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.18)" }}>
                          {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-white font-semibold truncate">{user.name}</div>
                          <div className="text-xs truncate" style={{ color: "#8A8378" }}>{user.email}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <LanguageSwitcher style={{ width: "100%", marginBottom: "10px" }} />
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#B8B1A6", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {Icons.logout}
                    {t("sidebar_logout")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative flex-1 min-w-0">
          {!isDesktop && (
            <header className="sticky top-0 z-20 px-4 pt-4">
              <div className="mobile-nav-blur rounded-[22px] border px-4 py-3 flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#D5CDBF", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {Icons.menu}
                </button>
                <Link to="/" className="text-white font-extrabold tracking-[-0.04em] text-base font-brand no-underline">
                  Pronosys<span style={{ color: "#C6A15B" }}>IA</span>
                </Link>
                <div className="w-11" />
              </div>
            </header>
          )}

          <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-28 lg:pb-10">
            <div className="mx-auto w-full max-w-[1180px]">
              {children}
            </div>
          </div>
        </main>
      </div>

      {!isDesktop && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-3">
          <div className="mobile-nav-blur rounded-[24px] border px-2 py-2 flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {mobileTabs.map((item) => {
              const active = isActive(item.h);
              return (
                <Link
                  key={item.h}
                  to={item.h}
                  className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-2xl no-underline"
                  style={active ? { background: "rgba(198,161,91,0.14)", color: "#F8F2E8" } : { color: "#81796E" }}
                >
                  <span style={active ? { color: "#C6A15B" } : undefined}>{Icons[item.icon]}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">{item.l}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
