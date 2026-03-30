import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";

export default function ChatHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => { if (!token) { navigate("/login"); return; } fetch("/api/chat-sessions", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setSessions(d.sessions || []); setTotal(d.total || 0); }).finally(() => setLoading(false)); }, []);
  const formatDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fadeInUp">
        <div><h1 className="font-display text-3xl italic text-white">Mes Conversations.</h1><p className="mt-2 text-sm" style={{ color: "#555" }}>{total} conversation{total > 1 ? "s" : ""}</p></div>
        <Link to="/dashboard/chatbot" className="btn-gold text-sm">Nouvelle conversation</Link>
      </div>
      {sessions.length === 0 && <div className="card p-14 text-center animate-fadeInUp"><p className="text-white font-medium mb-2">Aucune conversation</p><p className="text-sm mb-6" style={{ color: "#555" }}>Lancez le chatbot.</p><Link to="/dashboard/chatbot" className="btn-gold text-sm">Demarrer</Link></div>}
      {sessions.length > 0 && <div className="space-y-3 stagger-children">
        {sessions.map(s => (
          <div key={s.id} className="card overflow-hidden animate-fadeInUp">
            <div className="p-6 cursor-pointer" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
              <div className="flex items-center justify-between">
                <div><p className="text-white text-sm">{s.filename || "Conversation"}</p><p className="text-xs mt-1" style={{ color: "#555" }}>{formatDate(s.created_at)} · {(s.messages || []).length} msg</p></div>
                <div className="flex items-center gap-3">
                  {s.analysis_score && <span className="text-sm font-bold" style={{ color: s.analysis_score >= 50 ? "#C6A15B" : "#F87171" }}>{Math.round(s.analysis_score)}</span>}
                  <span className="tag text-[10px]" style={s.status === "video_generated" ? { color: "#4ADE80", borderColor: "#4ADE8030" } : { color: "#C6A15B", borderColor: "rgba(198,161,91,0.15)" }}>{s.status === "video_generated" ? "Video" : "Chat"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expanded === s.id ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
            {expanded === s.id && (
              <div className="px-6 pb-6" style={{ borderTop: "1px solid #1C1C1C" }}>
                <div className="space-y-2 max-h-72 overflow-y-auto py-4">
                  {(s.messages || []).map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0" style={m.role === "user" ? { background: "#1A1A1A", color: "#C6A15B" } : { background: "#C6A15B", color: "white" }}>{m.role === "user" ? "V" : "IA"}</div>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 ${m.role === "user" ? "text-right" : ""}`} style={{ background: "#0E0E0E" }}><p className="text-xs" style={{ color: "#888" }}>{m.content}</p></div>
                    </div>
                  ))}
                </div>
                {s.video_url && <div className="mt-4 p-4 rounded-lg" style={{ background: "#0E0E0E" }}><video src={s.video_url} controls className="w-full max-w-sm rounded-lg bg-black aspect-video" /><a href={s.video_url} download className="btn-gold text-xs mt-3 inline-block">Telecharger</a></div>}
              </div>
            )}
          </div>
        ))}
      </div>}
    </DashboardLayout>
  );
}