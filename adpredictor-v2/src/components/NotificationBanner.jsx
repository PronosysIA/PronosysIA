import { useState, useEffect } from "react";

const APP_LINKS = {
  tiktok: "https://www.tiktok.com/upload",
  instagram: "https://www.instagram.com/",
  youtube_shorts: "https://www.youtube.com/upload",
  snapchat: "https://www.snapchat.com/",
  other_social: null,
};

const PLATFORM_NAMES = {
  tiktok: "TikTok", instagram: "Instagram", youtube_shorts: "YouTube Shorts", snapchat: "Snapchat", other_social: "Autre"
};

export default function NotificationBanner() {
  const [upcoming, setUpcoming] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    const poll = () => {
      fetch("/api/scheduled-posts/upcoming", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.posts) setUpcoming(data.posts); })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [token]);

  const handlePublish = async (post) => {
    // Mark as published
    await fetch(`/api/scheduled-posts/${post.id}/publish`, {
      method: "PUT", headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});

    // Copy caption + hashtags to clipboard
    const copyText = [post.caption, post.hashtags].filter(Boolean).join("\n\n");
    if (copyText) {
      try { await navigator.clipboard.writeText(copyText); } catch {}
    }

    // Open app
    const link = APP_LINKS[post.platform];
    if (link) window.open(link, "_blank");

    // Remove from list
    setDismissed(prev => [...prev, post.id]);
  };

  const handleDismiss = (id) => setDismissed(prev => [...prev, id]);

  const visible = upcoming.filter(p => !dismissed.includes(p.id));
  if (visible.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3" style={{ maxWidth: "380px" }}>
      {visible.map(post => {
        const mins = Math.round(post.minutes_left);
        const urgent = mins <= 5;
        return (
          <div key={post.id} className="animate-fadeInUp" style={{
            background: urgent ? "rgba(198,161,91,0.15)" : "rgba(20,20,20,0.95)",
            border: `1px solid ${urgent ? "rgba(198,161,91,0.4)" : "#1C1C1C"}`,
            borderRadius: "16px", padding: "16px", backdropFilter: "blur(20px)",
            boxShadow: urgent ? "0 0 30px rgba(198,161,91,0.2)" : "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {urgent ? (
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#C6A15B" }} />
                  ) : (
                    <span className="w-2 h-2 rounded-full" style={{ background: "#555" }} />
                  )}
                  <span className="text-xs font-medium" style={{ color: urgent ? "#C6A15B" : "#555" }}>
                    {mins <= 0 ? "C'est l'heure !" : `Dans ${mins} min`}
                  </span>
                  <span className="text-xs" style={{ color: "#555" }}>• {PLATFORM_NAMES[post.platform] || post.platform}</span>
                </div>
                <p className="text-white text-sm font-medium mb-1">{post.title || "Publication planifiee"}</p>
                {post.caption && <p className="text-xs line-clamp-2" style={{ color: "#888" }}>{post.caption.substring(0, 80)}...</p>}
              </div>
              <button onClick={() => handleDismiss(post.id)} className="text-xs" style={{ color: "#555" }}>✕</button>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handlePublish(post)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: urgent ? "linear-gradient(135deg, #C6A15B, #D4B87A)" : "rgba(198,161,91,0.1)",
                  color: urgent ? "#0A0A0A" : "#C6A15B",
                  border: urgent ? "none" : "1px solid rgba(198,161,91,0.2)",
                }}>
                {urgent ? "Publier maintenant" : "Publier"}
              </button>
            </div>
            {urgent && (
              <p className="text-[10px] text-center mt-2" style={{ color: "#888" }}>
                Caption + hashtags copies automatiquement
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}