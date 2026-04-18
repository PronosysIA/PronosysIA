import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { useTranslation } from "../i18n/useLang.jsx";

function SectionCard({ label, title, children, accent = "#C6A15B", gold = false }) {
  return (
    <div className={gold ? "card-gold p-7" : "card p-7"}>
      <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>{label}</div>
      {title && <div className="mt-3 text-white text-xl font-semibold">{title}</div>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function Booster() {
  const { t, lang } = useTranslation();
  const token = localStorage.getItem("token");
  const platforms = [
    { value: "tiktok", label: "TikTok" },
    { value: "instagram", label: "Instagram Reels" },
    { value: "youtube_shorts", label: "YouTube Shorts" },
    { value: "snapchat", label: "Snapchat" },
    { value: "other_social", label: t("booster_other") },
  ];
  const dayOptions = [
    t("booster_monday"),
    t("booster_tuesday"),
    t("booster_wednesday"),
    t("booster_thursday"),
    t("booster_friday"),
    t("booster_saturday"),
    t("booster_sunday"),
  ];

  const [tab, setTab] = useState("boost");
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState("tiktok");
  const [selectedDays, setSelectedDays] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [schedLoading, setSchedLoading] = useState(false);
  const [schedForm, setSchedForm] = useState({ title: "", platform: "tiktok", date: "", time: "", caption: "", hashtags: "" });
  const inputRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/scheduled-posts", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.posts) setScheduledPosts(data.posts);
      })
      .catch(() => {});
  }, [token, tab]);

  const toggleDay = (day) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]);
  };

  const handleFile = (nextFile) => {
    if (nextFile && nextFile.type.startsWith("video/")) setFile(nextFile);
  };

  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const handleBoost = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("category", "reseaux");
      formData.append("platform", platform);
      formData.append("preferred_days", selectedDays.join(","));
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch("/api/boost", { method: "POST", headers, body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || t("common_error"));
        setLoading(false);
        return;
      }
      setResult(data);
    } catch {
      setError(t("auth_connection_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!schedForm.date || !schedForm.time) {
      setError(t("booster_required_datetime"));
      return;
    }
    setSchedLoading(true);
    setError("");
    try {
      const scheduled_at = `${schedForm.date}T${schedForm.time}:00`;
      const response = await fetch("/api/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...schedForm, scheduled_at, video_filename: file?.name || "" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || t("common_error"));
      } else {
        setScheduledPosts((prev) => [...prev, data]);
        setSchedForm({ title: "", platform: "tiktok", date: "", time: "", caption: "", hashtags: "" });
      }
    } catch {
      setError(t("auth_connection_error"));
    } finally {
      setSchedLoading(false);
    }
  };

  const handleDeleteScheduled = async (id) => {
    await fetch(`/api/scheduled-posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    setScheduledPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const unpublishedCount = scheduledPosts.filter((post) => post.status !== "published").length;

  const formatDate = (value) => {
    try {
      const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "fr-FR";
      const date = new Date(value);
      return `${date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })} ${date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return value;
    }
  };

  const allHashtags = result?.hashtags && typeof result.hashtags === "object"
    ? [...(result.hashtags.trending || []), ...(result.hashtags.niche || []), ...(result.hashtags.medium || [])]
    : Array.isArray(result?.hashtags) ? result.hashtags : [];

  return (
    <DashboardLayout>
      <div className="mb-10 animate-fadeInUp">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm" style={{ color: "#B4AC9F" }}>
          <span>{"<-"}</span>
          {t("common_back")}
        </Link>
        <h1 className="mt-5 font-display text-white text-[clamp(2.1rem,4vw,4rem)] leading-[1.04] tracking-[-0.04em]">{t("booster_title")}</h1>
        <p className="mt-4 text-base leading-8 max-w-[760px]" style={{ color: "#C6BEB2" }}>{t("booster_desc")}</p>
      </div>

      <div className="glass-card p-2 rounded-[24px] flex gap-2 mb-8 animate-fadeInUp">
        <button type="button" onClick={() => setTab("boost")} className={tab === "boost" ? "btn-primary flex-1" : "btn-outline flex-1"}>{t("booster_tab_boost")}</button>
        <button type="button" onClick={() => setTab("schedule")} className={tab === "schedule" ? "btn-primary flex-1 relative" : "btn-outline flex-1 relative"}>
          {t("booster_tab_schedule")}
          {unpublishedCount > 0 && <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center" style={{ background: "#C6A15B", color: "#120f0a" }}>{unpublishedCount}</span>}
        </button>
      </div>

      {error && <div className="card px-5 py-4 mb-6" style={{ color: "#F87171" }}><p className="text-sm">{error}</p></div>}

      {tab === "boost" && (
        <>
          <div className="space-y-6 animate-fadeInUp">
            <div
              className="card p-12 text-center cursor-pointer transition-all"
              style={dragOver ? { borderColor: "#C6A15B", borderStyle: "dashed" } : { borderStyle: "dashed" }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                handleFile(event.dataTransfer.files[0]);
              }}
            >
              <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(event) => handleFile(event.target.files[0])} />
              {file ? (
                <div>
                  <div className="text-white text-lg font-semibold">{file.name}</div>
                  <div className="text-sm mt-2" style={{ color: "#BEB6A9" }}>{formatSize(file.size)}</div>
                  <button type="button" className="btn-outline mt-4" onClick={(event) => { event.stopPropagation(); setFile(null); }}>{t("upload_change")}</button>
                </div>
              ) : (
                <div>
                  <div className="text-white text-lg font-semibold">{t("booster_upload")}</div>
                  <div className="text-sm mt-2" style={{ color: "#BEB6A9" }}>{t("upload_or")} <span style={{ color: "#C6A15B" }}>{t("booster_upload_click")}</span></div>
                </div>
              )}
            </div>

            <div>
              <div className="section-kicker">{t("booster_platform")}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {platforms.map((item) => (
                  <button key={item.value} type="button" onClick={() => setPlatform(item.value)} className={platform === item.value ? "btn-primary" : "btn-outline"}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="section-kicker">{t("booster_days")}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <button key={day} type="button" onClick={() => toggleDay(day)} className={selectedDays.includes(day) ? "btn-primary" : "btn-outline"}>
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleBoost} disabled={!file || loading} className="btn-gold w-full py-4 disabled:opacity-20">
              {loading ? t("booster_analyzing") : t("booster_analyze")}
            </button>
          </div>

          {loading && (
            <div className="card p-14 text-center mt-10 animate-fadeIn">
              <div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "#C6A15B" }} />
              <p className="text-white font-semibold text-lg">{t("booster_analyzing")}</p>
              <p className="text-sm mt-2" style={{ color: "#BEB6A9" }}>{t("booster_analyzing_desc")}</p>
            </div>
          )}

          {result && !loading && (
            <div className="mt-12 space-y-6 stagger-children">
              <SectionCard label={t("booster_strategy_overview")} title={t("booster_strategy_overview_desc")} gold>
                <p className="text-base leading-8" style={{ color: "#F2E5CB" }}>{result.strategy_overview}</p>
              </SectionCard>

              <div className="grid xl:grid-cols-2 gap-5 animate-fadeInUp">
                <SectionCard label={t("booster_priority_checklist")} title={t("booster_priority_checklist_desc")}>
                  <ul className="space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
                    {(result.priority_checklist || []).map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </SectionCard>
                <SectionCard label={t("booster_first_hour")} title={t("booster_first_hour_desc")} accent="#4ADE80">
                  <div className="space-y-3">
                    {(result.first_hour_plan || []).map((item, index) => (
                      <div key={`${item.timing}-${index}`} className="glass-card p-4">
                        <div className="text-white font-semibold">{item.timing || t("common_new")}</div>
                        <div className="text-sm mt-2" style={{ color: "#BEB6A9" }}>{item.action || item}</div>
                        {item.impact && <div className="text-xs mt-2" style={{ color: "#4ADE80" }}>{item.impact}</div>}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              <SectionCard label={t("booster_slots")} title={t("booster_slots_desc")}>
                <div className="grid gap-4">
                  {(result.optimal_slots || []).map((slot, index) => (
                    <div key={`${slot.day}-${slot.time}-${index}`} className="card p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-white text-lg font-semibold">{slot.day} {slot.date && <span className="text-sm" style={{ color: "#BEB6A9" }}>• {slot.date}</span>}</div>
                          <div className="text-sm mt-2 leading-7" style={{ color: "#BEB6A9" }}>{slot.reason}</div>
                          {slot.source && <div className="text-xs mt-2" style={{ color: "#8A8173" }}>{slot.source}</div>}
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-display text-white">{slot.time}</div>
                          {slot.expected_boost && <div className="text-sm mt-2" style={{ color: "#4ADE80" }}>{slot.expected_boost}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {allHashtags.length > 0 && (
                <SectionCard label={t("booster_hashtags")} title={t("booster_hashtags_desc")}>
                  <div className="flex flex-wrap gap-2">
                    {allHashtags.map((tag) => <button key={tag} type="button" className="tag" onClick={() => navigator.clipboard.writeText(tag)}>{tag}</button>)}
                  </div>
                  {result.hashtags?.strategy && <p className="mt-4 text-sm leading-7" style={{ color: "#BEB6A9" }}>{result.hashtags.strategy}</p>}
                  <button type="button" onClick={() => navigator.clipboard.writeText(allHashtags.join(" "))} className="btn-outline mt-4">{t("booster_copy_all")}</button>
                </SectionCard>
              )}

              {result.captions?.length > 0 && (
                <SectionCard label={t("booster_captions")} title={t("booster_captions_desc")}>
                  <div className="space-y-4">
                    {result.captions.map((caption, index) => {
                      const text = typeof caption === "string" ? caption : caption.text || "";
                      return (
                        <div key={`${caption.version || "caption"}-${index}`} className="card p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {caption.version && <div className="text-sm font-semibold" style={{ color: "#C6A15B" }}>{caption.version}</div>}
                              <div className="mt-3 text-sm whitespace-pre-wrap leading-7" style={{ color: "#BEB6A9" }}>{text}</div>
                              {caption.why && <div className="text-xs mt-3" style={{ color: "#8A8173" }}>{caption.why}</div>}
                            </div>
                            <button type="button" className="btn-outline" onClick={() => navigator.clipboard.writeText(text)}>{t("booster_copy")}</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              <div className="grid xl:grid-cols-2 gap-5 animate-fadeInUp">
                {result.sound_strategy && (
                  <SectionCard label={t("booster_sound")} title={t("booster_sound_desc")}>
                    <div className="text-white font-semibold">{result.sound_strategy.recommendation}</div>
                    {result.sound_strategy.alternatives?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.sound_strategy.alternatives.map((item) => <span key={item} className="tag">{item}</span>)}
                      </div>
                    )}
                    {result.sound_strategy.tip && <p className="mt-4 text-sm leading-7" style={{ color: "#BEB6A9" }}>{result.sound_strategy.tip}</p>}
                  </SectionCard>
                )}

                {result.publishing_settings && (
                  <SectionCard label={t("booster_settings")} title={t("booster_settings_desc")}>
                    <div className="space-y-4">
                      {Object.entries(result.publishing_settings).map(([key, value]) => (
                        <div key={key} className="glass-card p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "#8A8173" }}>{key.replace(/_/g, " ")}</div>
                          <div className="mt-2 text-sm leading-7" style={{ color: "#F3ECE0" }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>

              <div className="grid xl:grid-cols-2 gap-5 animate-fadeInUp">
                {result.cross_posting_plan?.length > 0 && (
                  <SectionCard label={t("booster_crosspost")} title={t("booster_crosspost_desc")}>
                    <div className="space-y-3">
                      {result.cross_posting_plan.map((item, index) => (
                        <div key={`${item.platform}-${index}`} className="card p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-white font-semibold">{item.platform}</div>
                            {item.when && <span className="tag">{item.when}</span>}
                          </div>
                          <div className="text-sm mt-3 leading-7" style={{ color: "#BEB6A9" }}>{item.adaptation || item.strategy}</div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {result.post_publication_actions?.length > 0 && (
                  <SectionCard label={t("booster_actions")} title={t("booster_actions_desc")} gold>
                    <div className="space-y-3">
                      {result.post_publication_actions.map((item, index) => (
                        <div key={`${item.timing}-${index}`} className="card p-4">
                          {item.timing && <div className="text-sm font-semibold" style={{ color: "#C6A15B" }}>{item.timing}</div>}
                          <div className="text-sm mt-2 leading-7" style={{ color: "#BEB6A9" }}>{item.action || item}</div>
                          {item.impact && <div className="text-xs mt-2" style={{ color: "#4ADE80" }}>{item.impact}</div>}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>

              <div className="grid xl:grid-cols-2 gap-5 animate-fadeInUp">
                {result.repurpose_angles?.length > 0 && (
                  <SectionCard label={t("booster_repurpose")} title={t("booster_repurpose_desc")}>
                    <ul className="space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
                      {result.repurpose_angles.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </SectionCard>
                )}
                {result.distribution_risks?.length > 0 && (
                  <SectionCard label={t("booster_risks")} title={t("booster_risks_desc")} accent="#F87171">
                    <ul className="space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
                      {result.distribution_risks.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </SectionCard>
                )}
              </div>

              {result.weekly_plan?.length > 0 && (
                <SectionCard label={t("booster_weekly")} title={t("booster_weekly_desc")}>
                  <div className="space-y-3">
                    {result.weekly_plan.map((item, index) => (
                      <div key={`${item.day}-${index}`} className="glass-card p-4 flex flex-wrap items-center gap-3 justify-between">
                        <div className="text-white font-semibold">{item.day}</div>
                        <div className="text-sm" style={{ color: "#BEB6A9" }}>{item.action}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          )}
        </>
      )}

      {tab === "schedule" && (
        <div className="space-y-6 animate-fadeInUp">
          <SectionCard label={t("booster_schedule_new")} title={t("booster_schedule_desc")} gold>
            <div className="space-y-4">
              <input type="text" value={schedForm.title} onChange={(event) => setSchedForm({ ...schedForm, title: event.target.value })} placeholder={t("booster_title_placeholder")} className="input-dark" />
              <div className="flex flex-wrap gap-2">
                {platforms.map((item) => (
                  <button key={item.value} type="button" onClick={() => setSchedForm({ ...schedForm, platform: item.value })} className={schedForm.platform === item.value ? "btn-primary" : "btn-outline"}>
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="date" value={schedForm.date} onChange={(event) => setSchedForm({ ...schedForm, date: event.target.value })} className="input-dark" style={{ colorScheme: "dark" }} />
                <input type="time" value={schedForm.time} onChange={(event) => setSchedForm({ ...schedForm, time: event.target.value })} className="input-dark" style={{ colorScheme: "dark" }} />
              </div>
              <textarea value={schedForm.caption} onChange={(event) => setSchedForm({ ...schedForm, caption: event.target.value })} rows={4} placeholder={t("booster_caption_placeholder")} className="input-dark resize-none" />
              <input type="text" value={schedForm.hashtags} onChange={(event) => setSchedForm({ ...schedForm, hashtags: event.target.value })} placeholder={t("booster_hashtags_placeholder")} className="input-dark" />
              <button type="button" onClick={handleSchedule} disabled={!schedForm.date || !schedForm.time || schedLoading} className="btn-gold w-full py-4 disabled:opacity-20">
                {schedLoading ? t("booster_schedule_planning") : t("booster_schedule_btn")}
              </button>
            </div>
          </SectionCard>

          <SectionCard label={t("booster_schedule_how")} title={t("booster_schedule_how_desc")}>
            <div className="space-y-3 text-sm leading-7" style={{ color: "#BEB6A9" }}>
              <p>1. {t("booster_schedule_step1")}</p>
              <p>2. {t("booster_schedule_step2")}</p>
              <p>3. {t("booster_schedule_step3")}</p>
              <p>4. {t("booster_schedule_step4")}</p>
              <p>5. {t("booster_schedule_step5")}</p>
            </div>
          </SectionCard>

          <SectionCard label={t("booster_scheduled_posts")} title={t("booster_scheduled_count", { count: unpublishedCount })}>
            {scheduledPosts.length === 0 ? (
              <div className="glass-card p-5 text-sm" style={{ color: "#BEB6A9" }}>{t("booster_no_posts")}</div>
            ) : (
              <div className="space-y-3">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-white font-semibold">{post.title || t("booster_publication")}</div>
                        <div className="text-sm mt-2" style={{ color: "#BEB6A9" }}>{formatDate(post.scheduled_at)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tag" style={post.status === "published" ? { borderColor: "rgba(74,222,128,0.24)", color: "#4ADE80" } : { borderColor: "rgba(198,161,91,0.24)", color: "#C6A15B" }}>
                          {post.status === "published" ? t("booster_published") : t("booster_scheduled")}
                        </span>
                        {post.status !== "published" && <button type="button" className="btn-outline" onClick={() => handleDeleteScheduled(post.id)}>{t("booster_delete")}</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </DashboardLayout>
  );
}
