import { useMemo } from "react";

export default function useTheme() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return useMemo(() => {
    if (!user) return FREE;
    if (user.is_admin) return ADMIN;
    if (user.plan === "premium_combo") return COMBO;
    if (user.plan === "premium_reseaux") return RESEAUX;
    if (user.plan === "premium_pubs") return PUBS;
    return FREE;
  }, [user?.plan, user?.is_admin]);
}

const FREE = {
  name: "free", label: "Free", emoji: null,
  accent: "#6B7280", accentBg: "#F3F4F6", accentBorder: "#E5E7EB",
  gradient: "#6B7280", cardBg: "#FFFFFF", tagBg: "#F3F4F6", tagColor: "#6B7280",
};
const PUBS = {
  name: "pubs", label: "Premium Power", emoji: "⚡",
  accent: "#C6A15B", accentBg: "#FAF5EB", accentBorder: "#E8D5B0",
  gradient: "linear-gradient(135deg, #C6A15B, #A8864A)", cardBg: "#FFFDF8", tagBg: "#FAF5EB", tagColor: "#A8864A",
};
const RESEAUX = {
  name: "reseaux", label: "Premium Creator", emoji: "🔥",
  accent: "#C6A15B", accentBg: "#FAF5EB", accentBorder: "#E8D5B0",
  gradient: "linear-gradient(135deg, #C6A15B, #D4B87A)", cardBg: "#FFFDF8", tagBg: "#FAF5EB", tagColor: "#A8864A",
};
const COMBO = {
  name: "combo", label: "Combo Elite", emoji: "💎",
  accent: "#C6A15B", accentBg: "#FAF5EB", accentBorder: "#D4B87A",
  gradient: "linear-gradient(135deg, #A8864A, #C6A15B, #D4B87A)", cardBg: "#FFFDF8", tagBg: "#FAF5EB", tagColor: "#A8864A",
};
const ADMIN = {
  name: "admin", label: "Admin", emoji: "👑",
  accent: "#C6A15B", accentBg: "#FAF5EB", accentBorder: "#D4B87A",
  gradient: "linear-gradient(135deg, #A8864A, #C6A15B, #D4B87A)", cardBg: "#FFFDF8", tagBg: "#FAF5EB", tagColor: "#A8864A",
};