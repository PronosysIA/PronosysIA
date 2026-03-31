import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" }, { value: "instagram", label: "Instagram Reels" },
  { value: "youtube_shorts", label: "YouTube Shorts" }, { value: "snapchat", label: "Snapchat" }, { value: "other_social", label: "Autre" },
];
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const PLATFORM_NAMES = { tiktok: "TikTok", instagram: "Instagram", youtube_shorts: "YouTube Shorts", snapchat: "Snapchat", other_social: "Autre" };

export default function Booster() {
  const [tab, setTab] = useState("boost"); // boost | schedule
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState("tiktok");
  const [selectedDays, setSelectedDays] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");

  // Scheduler state
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [schedForm, setSchedForm] = useState({ title: "", platform: "tiktok", date: "", time: "", caption: "", hashtags: "" });
  const [schedLoading, setSchedLoading] = useState(false);

  const handleFile = (f) => { if (f && f.type.startsWith("video/")) setFile(f); };
  const toggleDay = (d) => setSelectedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const formatSize = (b) => b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;

  // Load scheduled posts
  useEffect(() => {
    if (!token) return;
    fetch("/api/scheduled-posts", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.posts) setScheduledPosts(data.posts); })
      .catch(() => {});
  }, [token, tab]);

  const handleBoost = async () => {
    if (!file) return;
    setLoading(true); setResult(null); setError("");
    try {
      const fd = new FormData();
      fd.append("video", file); fd.append("category", "reseaux"); fd.append("platform", platform);
      fd.append("preferred_days", selectedDays.join(","));
      const h = {}; if (token) h["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/boost", { method: "POST", headers: h, body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur."); setLoading(false); return; }
      setResult(data);
    } catch { setError("Erreur de connexion."); } finally { setLoading(false); }
  };

  const handleSchedule = async () => {
    if (!schedForm.date || !schedForm.time) { setError("Date et heure requises."); return; }
    setSchedLoading(true); setError("");
    try {
      const scheduled_at = `${schedForm.date}T${schedForm.time}:00`;
      const res = await fetch("/api/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...schedForm, scheduled_at, video_filename: file?.name || "" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur."); } else {
        setScheduledPosts(prev => [...prev, data]);
        setSchedForm({ title: "", platform: "tiktok", date: "", time: "", caption: "", hashtags: "" });
      }
    } catch { setError("Erreur de connexion."); } finally { setSchedLoading(false); }
  };

  const handleDeleteScheduled = async (id) => {
    await fetch(`/api/scheduled-posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    setScheduledPosts(prev => prev.filter(p => p.id !== id));
  };

  // Helpers
  const getSlots = () => { const s = result?.optimal_slots || result?.optimal_times || []; return Array.isArray(s) ? s : []; };
  const getHashtags = () => { const h = result?.hashtags; if (!h) return []; if (Array.isArray(h)) return h; if (typeof h === "object") { const a = []; if (h.trending) a.push(...h.trending); if (h.niche) a.push(...h.niche); if (h.medium) a.push(...h.medium); return a; } return []; };
  const getHashtagStrategy = () => { const h = result?.hashtags; return (h && typeof h === "object" && h.strategy) ? h.strategy : null; };
  const getCaptions = () => { const c = result?.captions; return Array.isArray(c) ? c : []; };
  const getCrossPosting = () => { const cp = result?.cross_posting_plan || result?.cross_posting || []; return Array.isArray(cp) ? cp : []; };
  const getPostActions = () => { const pa = result?.post_publication_actions || result?.post_actions || []; return Array.isArray(pa) ? pa : []; };
  const getWeeklyPlan = () => { const wp = result?.weekly_plan || []; return Array.isArray(wp) ? wp : []; };
  const getSoundStrategy = () => result?.sound_strategy || null;
  const getPublishingSettings = () => result?.publishing_settings || null;

  const formatDate = (iso) => { try { const d = new Date(iso); return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); } catch { return iso; } };

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fadeInUp">
        <Link to="/dashboard" className="text-sm mb-6 inline-block" style={{ color: "#555" }}>← Dashboard</Link>
        <h1 className="font-display text-3xl italic text-white">Boosteur.</h1>
        <p className="mt-3 text-sm" style={{ color: "#555" }}>Strategie optimale + planification de publication.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "#141414", border: "1px solid #1C1C1C" }}>
        <button onClick={() => setTab("boost")} className="flex-1 py-3 rounded-lg text-sm font-medium transition-all"
          style={tab === "boost" ? { background: "rgba(198,161,91,0.1)", color: "#C6A15B" } : { color: "#555" }}>
          Analyser & Booster
        </button>
        <button onClick={() => setTab("schedule")} className="flex-1 py-3 rounded-lg text-sm font-medium transition-all relative"
          style={tab === "schedule" ? { background: "rgba(198,161,91,0.1)", color: "#C6A15B" } : { color: "#555" }}>
          Planifier
          {scheduledPosts.filter(p => p.status !== "published").length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background: "#C6A15B", color: "#0A0A0A" }}>
              {scheduledPosts.filter(p => p.status !== "published").length}
            </span>
          )}
        </button>
      </div>

      {error && <div className="card px-5 py-4 mb-6" style={{ color: "#F87171" }}><p className="text-sm">{error}</p></div>}

      {/* ============================================================ */}
      {/* TAB: BOOST */}
      {/* ============================================================ */}
      {tab === "boost" && (
        <>
          <div className="space-y-6 animate-fadeInUp">
            <div className={`card p-12 text-center cursor-pointer transition-all`} style={{ borderStyle: "dashed", borderColor: dragOver ? "#C6A15B" : undefined }}
              onClick={() => inputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}>
              <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div><p className="text-white font-medium mb-1">{file.name}</p><p className="text-sm" style={{ color: "#555" }}>{formatSize(file.size)}</p>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-sm mt-3" style={{ color: "#F87171" }}>Changer</button></div>
              ) : (
                <div><p className="text-white font-medium mb-2">Glissez votre video ici</p><p className="text-sm" style={{ color: "#555" }}>ou <span style={{ color: "#C6A15B" }}>cliquez pour choisir</span></p></div>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#555" }}>Plateforme</p>
              <div className="flex flex-wrap gap-2">{PLATFORMS.map(p => <button key={p.value} onClick={() => setPlatform(p.value)} className="px-4 py-2.5 rounded-lg text-sm transition-all" style={platform === p.value ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { background: "#141414", color: "#555", border: "1px solid #1C1C1C" }}>{p.label}</button>)}</div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#555" }}>Jours preferes <span style={{ color: "#333" }}>(optionnel)</span></p>
              <div className="flex flex-wrap gap-2">{DAYS.map(d => <button key={d} onClick={() => toggleDay(d)} className="px-4 py-2.5 rounded-lg text-sm transition-all" style={selectedDays.includes(d) ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { background: "#141414", color: "#555", border: "1px solid #1C1C1C" }}>{d}</button>)}</div>
            </div>
            <button onClick={handleBoost} disabled={!file || loading} className="btn-gold w-full py-4 disabled:opacity-20">{loading ? "Analyse en cours..." : "Booster ma video"}</button>
          </div>

          {loading && <div className="card p-14 text-center mt-10 animate-fadeIn"><div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /><p className="text-white font-medium mb-1">Analyse en cours...</p><p className="text-sm" style={{ color: "#555" }}>L'IA prepare votre strategie optimale.</p></div>}

          {/* RESULTATS */}
          {result && !loading && (
            <div className="mt-12 space-y-8 stagger-children">
              {/* Creneaux */}
              {getSlots().length > 0 && <div className="card p-10 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#C6A15B" }}>Creneaux optimaux</p><div className="space-y-3">{getSlots().map((s, i) => <div key={i} className="card p-5 flex justify-between items-center"><div><p className="text-white font-medium">{s.day} {s.date && <span className="text-xs ml-2" style={{ color: "#555" }}>{s.date}</span>}</p><p className="text-xs mt-1" style={{ color: "#555" }}>{s.reason}</p>{s.expected_boost && <p className="text-xs mt-1" style={{ color: "#4ADE80" }}>{s.expected_boost}</p>}</div><span className="text-2xl font-display italic" style={{ color: "#C6A15B" }}>{s.time}</span></div>)}</div></div>}
              {/* Hashtags */}
              {getHashtags().length > 0 && <div className="card p-10 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#555" }}>Hashtags</p><div className="flex flex-wrap gap-2 mb-4">{getHashtags().map((h, i) => <span key={i} className="tag text-xs cursor-pointer hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText(h)}>{h}</span>)}</div>{getHashtagStrategy() && <p className="text-xs mb-4" style={{ color: "#888" }}>{getHashtagStrategy()}</p>}<button onClick={() => navigator.clipboard.writeText(getHashtags().join(" "))} className="btn-outline text-xs">Copier tous</button></div>}
              {/* Captions */}
              {getCaptions().length > 0 && <div className="card p-10 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#555" }}>Captions</p>{getCaptions().map((c, i) => { const text = typeof c === "string" ? c : (c.text || ""); const version = typeof c === "object" ? c.version : null; const why = typeof c === "object" ? c.why : null; return <div key={i} className="card p-5 mb-3"><div className="flex justify-between items-start gap-4"><div className="flex-1">{version && <p className="text-xs font-medium mb-2" style={{ color: "#C6A15B" }}>{version}</p>}<p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#888" }}>{text}</p>{why && <p className="text-xs mt-2" style={{ color: "#555" }}>{why}</p>}</div><button onClick={() => navigator.clipboard.writeText(text)} className="text-xs flex-shrink-0" style={{ color: "#C6A15B" }}>Copier</button></div></div>; })}</div>}
              {/* Son */}
              {getSoundStrategy() && <div className="card p-10 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#555" }}>Son / Musique</p><p className="text-sm mb-3" style={{ color: "#888" }}>{getSoundStrategy().recommendation}</p>{getSoundStrategy().alternatives && <div className="flex flex-wrap gap-2 mb-3">{getSoundStrategy().alternatives.map((a, i) => <span key={i} className="tag text-xs">{a}</span>)}</div>}{getSoundStrategy().tip && <p className="text-xs" style={{ color: "#555" }}>{getSoundStrategy().tip}</p>}</div>}
              {/* Parametres */}
              {getPublishingSettings() && <div className="card p-10 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#555" }}>Parametres publication</p>{Object.entries(getPublishingSettings()).map(([k, v], i) => <div key={i} className="mb-3"><p className="text-xs font-medium mb-1" style={{ color: "#C6A15B" }}>{k.replace(/_/g, " ")}</p><p className="text-sm" style={{ color: "#888" }}>{v}</p></div>)}</div>}
              {/* Cross-posting */}
              {getCrossPosting().length > 0 && <div className="card p-10 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#555" }}>Cross-posting</p>{getCrossPosting().map((cp, i) => <div key={i} className="card p-5 mb-3"><div className="flex items-center gap-3 mb-2"><p className="text-white font-medium">{cp.platform}</p>{cp.when && <span className="tag text-[10px]">{cp.when}</span>}</div>{(cp.adaptation || cp.strategy) && <p className="text-sm" style={{ color: "#555" }}>{cp.adaptation || cp.strategy}</p>}</div>)}</div>}
              {/* Post-actions */}
              {getPostActions().length > 0 && <div className="card-gold p-10 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#4ADE80" }}>Actions post-publication</p>{getPostActions().map((a, i) => <div key={i} className="card p-5 mb-3">{a.timing && <span className="text-xs font-medium" style={{ color: "#C6A15B" }}>{a.timing}</span>}<p className="text-sm mt-1" style={{ color: "#888" }}>{typeof a === "string" ? a : (a.action || "")}</p>{a.impact && <p className="text-xs mt-1" style={{ color: "#4ADE80" }}>{a.impact}</p>}</div>)}</div>}
              {/* Plan hebdo */}
              {getWeeklyPlan().length > 0 && <div className="card p-10 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#555" }}>Plan hebdomadaire</p>{getWeeklyPlan().map((w, i) => <div key={i} className="flex gap-4 mb-3"><span className="text-sm font-medium" style={{ color: "#C6A15B" }}>{w.day}</span><span className="text-sm" style={{ color: "#888" }}>{w.action}</span></div>)}</div>}

              {/* CTA Planifier */}
              <div className="card-gold p-8 text-center animate-fadeInUp">
                <p className="text-white font-medium mb-2">Pret a publier ?</p>
                <p className="text-sm mb-4" style={{ color: "#888" }}>Planifiez votre publication et recevez une notification au moment optimal.</p>
                <button onClick={() => setTab("schedule")} className="btn-gold px-8 py-3">Planifier ma publication</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* TAB: PLANIFIER */}
      {/* ============================================================ */}
      {tab === "schedule" && (
        <div className="space-y-8 animate-fadeInUp">

          {/* Formulaire de planification */}
          <div className="card p-8">
            <p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#C6A15B" }}>Nouvelle publication</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs mb-2 block" style={{ color: "#555" }}>Titre (optionnel)</label>
                <input type="text" value={schedForm.title} onChange={e => setSchedForm({ ...schedForm, title: e.target.value })} placeholder="Ma super video..."
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" style={{ background: "#141414", border: "1px solid #1C1C1C" }} />
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: "#555" }}>Plateforme</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => <button key={p.value} onClick={() => setSchedForm({ ...schedForm, platform: p.value })} className="px-4 py-2.5 rounded-lg text-sm transition-all"
                    style={schedForm.platform === p.value ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { background: "#141414", color: "#555", border: "1px solid #1C1C1C" }}>{p.label}</button>)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-2 block" style={{ color: "#555" }}>Date</label>
                  <input type="date" value={schedForm.date} onChange={e => setSchedForm({ ...schedForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-sm text-white focus:outline-none" style={{ background: "#141414", border: "1px solid #1C1C1C", colorScheme: "dark" }} />
                </div>
                <div>
                  <label className="text-xs mb-2 block" style={{ color: "#555" }}>Heure</label>
                  <input type="time" value={schedForm.time} onChange={e => setSchedForm({ ...schedForm, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-sm text-white focus:outline-none" style={{ background: "#141414", border: "1px solid #1C1C1C", colorScheme: "dark" }} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: "#555" }}>Caption</label>
                <textarea value={schedForm.caption} onChange={e => setSchedForm({ ...schedForm, caption: e.target.value })} rows={3} placeholder="Votre caption sera copiee automatiquement..."
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none resize-none" style={{ background: "#141414", border: "1px solid #1C1C1C" }} />
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: "#555" }}>Hashtags</label>
                <input type="text" value={schedForm.hashtags} onChange={e => setSchedForm({ ...schedForm, hashtags: e.target.value })} placeholder="#fyp #viral #tiktok..."
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" style={{ background: "#141414", border: "1px solid #1C1C1C" }} />
              </div>
              <button onClick={handleSchedule} disabled={!schedForm.date || !schedForm.time || schedLoading} className="btn-gold w-full py-3 disabled:opacity-20">
                {schedLoading ? "Planification..." : "Planifier la publication"}
              </button>
            </div>
          </div>

          {/* Comment ca marche */}
          <div className="card p-6" style={{ borderColor: "rgba(198,161,91,0.15)" }}>
            <p className="text-xs font-medium mb-3" style={{ color: "#C6A15B" }}>Comment ca marche ?</p>
            <div className="space-y-2">
              <p className="text-xs" style={{ color: "#888" }}>1. Choisissez la plateforme, la date et l'heure de publication</p>
              <p className="text-xs" style={{ color: "#888" }}>2. Ajoutez votre caption et vos hashtags (copies automatiquement)</p>
              <p className="text-xs" style={{ color: "#888" }}>3. <strong style={{ color: "#C6A15B" }}>10 min avant</strong> → une notification apparait</p>
              <p className="text-xs" style={{ color: "#888" }}>4. <strong style={{ color: "#C6A15B" }}>5 min avant</strong> → notification urgente avec bouton "Publier"</p>
              <p className="text-xs" style={{ color: "#888" }}>5. Cliquez <strong style={{ color: "#4ADE80" }}>"Publier maintenant"</strong> → l'app s'ouvre + caption copiee</p>
            </div>
          </div>

          {/* Liste des posts planifies */}
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#555" }}>
              Publications planifiees ({scheduledPosts.filter(p => p.status !== "published").length})
            </p>
            {scheduledPosts.length === 0 ? (
              <div className="card p-10 text-center"><p className="text-sm" style={{ color: "#555" }}>Aucune publication planifiee.</p></div>
            ) : (
              <div className="space-y-3">
                {scheduledPosts.map(post => (
                  <div key={post.id} className="card p-5 flex items-center justify-between gap-4 animate-fadeInUp"
                    style={post.status === "published" ? { opacity: 0.5 } : {}}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#141414", border: "1px solid #1C1C1C" }}>
                        <span className="text-xs font-bold" style={{ color: "#C6A15B" }}>{(PLATFORM_NAMES[post.platform] || "?").charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate">{post.title || "Publication"}</p>
                        <p className="text-xs" style={{ color: "#555" }}>
                          {PLATFORM_NAMES[post.platform] || post.platform} • {formatDate(post.scheduled_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {post.status === "published" ? (
                        <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(74,222,128,0.1)", color: "#4ADE80" }}>Publie</span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(198,161,91,0.1)", color: "#C6A15B" }}>Planifie</span>
                      )}
                      {post.status !== "published" && (
                        <button onClick={() => handleDeleteScheduled(post.id)} className="text-xs" style={{ color: "#F87171" }}>Supprimer</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}