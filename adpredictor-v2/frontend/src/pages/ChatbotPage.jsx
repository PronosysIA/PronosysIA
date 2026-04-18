import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import VideoUploader from "../components/VideoUploader.jsx";
import { useTranslation } from "../i18n/useLang.jsx";

function ChatMessage({ message, t }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fadeInUp`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={isUser ? { background: "#1A1A1A", color: "#C6A15B", border: "1px solid #222" } : { background: "#C6A15B", color: "white" }}>{isUser ? t("chatbot_user_badge") : t("chatbot_assistant_badge")}</div>
      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div className="rounded-xl px-4 py-3" style={isUser ? { background: "#1A1A1A", border: "1px solid #222" } : { background: "#141414", border: "1px solid #1C1C1C" }}><p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "#888" }}>{message.content}</p></div>
        {message.script_data && (
          <div className="card mt-3 p-5">
            <p className="text-xs mb-3" style={{ color: "#C6A15B" }}>
              {message.script_data.title} - {t("gen_target_score")}: {message.script_data.target_score}
            </p>
            {message.script_data.quick_brief?.headline && (
              <div className="glass-card p-4 mb-4">
                <p className="text-sm font-semibold text-white">{message.script_data.quick_brief.headline}</p>
                {message.script_data.quick_brief.promise && <p className="text-xs mt-2 leading-6" style={{ color: "#BEB6A9" }}>{message.script_data.quick_brief.promise}</p>}
              </div>
            )}
            {(message.script_data.beginner_checklist || []).length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "#8A8173" }}>{t("chatbot_beginner_checklist")}</p>
                <div className="space-y-1.5">
                  {message.script_data.beginner_checklist.slice(0, 3).map((item) => <p key={item} className="text-xs leading-6" style={{ color: "#BEB6A9" }}>• {item}</p>)}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              {(message.script_data.script || []).slice(0, 5).map((step, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span style={{ color: "#C6A15B" }}>{step.timestamp}</span>
                  <span style={{ color: "#888" }}>{step.visual}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {message.video_url && <div className="card mt-3 p-4"><video src={message.video_url} controls className="w-full rounded-lg bg-black aspect-video" /><a href={message.video_url} download className="btn-gold text-xs mt-3 inline-block">{t("chatbot_download")}</a></div>}
        {message.video_loading && <div className="card mt-3 p-6 text-center"><div className="w-8 h-8 rounded-full border-2 mx-auto mb-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /><p className="text-xs" style={{ color: "#555" }}>{t("chatbot_video_generating")}</p></div>}
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState("upload");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleUpload = async ({ file, platform }) => {
    setStep("analyzing");
    setError("");
    try {
      const fd = new FormData();
      fd.append("video", file);
      fd.append("category", "reseaux");
      fd.append("platform", platform);
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/analyze", { method: "POST", headers, body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || t("common_error"));
        setStep("upload");
        return;
      }
      setAnalysisData(data);
      const initRes = await fetch("/api/chatbot/start", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ analysis_data: data }) });
      const initData = await initRes.json();
      setSessionId(initData.session_id);
      setMessages([{ role: "assistant", content: initData.response, script_data: initData.script_data }]);
      setStep("chat");
    } catch {
      setError(t("auth_connection_error"));
      setStep("upload");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chatbot/message", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ session_id: sessionId, messages: nextMessages.map((item) => ({ role: item.role, content: item.content })), analysis_data: analysisData }) });
      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.response, script_data: data.script_data || null };
      if (data.generate_video) {
        aiMsg.video_loading = true;
        setMessages([...nextMessages, aiMsg]);
        const genRes = await fetch("/api/chatbot/generate-video", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(data.generate_video) });
        const genData = await genRes.json();
        aiMsg.video_loading = false;
        if (genData.video_url) aiMsg.video_url = genData.video_url;
        else aiMsg.content += `\n\n${t("common_error")}: ${genData.detail || t("common_error")}`;
      }
      setMessages([...nextMessages, aiMsg]);
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: t("auth_connection_error") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fadeInUp">
        <Link to="/dashboard" className="text-sm mb-6 inline-block" style={{ color: "#555" }}>{`<- ${t("analyze_back")}`}</Link>
        <h1 className="font-display text-3xl italic text-white">{t("chatbot_title")}</h1>
        <p className="mt-3 text-sm" style={{ color: "#555" }}>{t("chatbot_desc")}</p>
      </div>

      {error && <div className="card px-5 py-4 mb-6" style={{ color: "#F87171" }}><p className="text-sm">{error}</p></div>}

      {step === "upload" && <div><div className="card-gold p-8 mb-8 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#C6A15B" }}>{t("chatbot_how_title")}</p><ol className="space-y-2 text-sm" style={{ color: "#888" }}><li>1. {t("chatbot_upload_step1")}</li><li>2. {t("chatbot_upload_step2")}</li><li>3. {t("chatbot_upload_step3")}</li></ol></div><VideoUploader onAnalyze={handleUpload} category="reseaux" /></div>}

      {step === "analyzing" && <div className="card p-14 text-center animate-fadeIn"><div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /><p className="text-white font-medium mb-1">{t("chatbot_analyzing")}</p><p className="text-sm" style={{ color: "#555" }}>{t("chatbot_analyzing_desc")}</p></div>}

      {step === "chat" && <div className="card overflow-hidden flex flex-col animate-scaleIn" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
        {analysisData && <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1C1C1C" }}><span className="text-sm text-white">{analysisData.filename}</span><div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: analysisData.global_score >= 50 ? "#C6A15B" : "#F87171" }}>{t("chatbot_score_target", { score: Math.round(analysisData.global_score) })}</span><span style={{ color: "#333" }}>-&gt;</span><span className="text-sm font-bold" style={{ color: "#4ADE80" }}>{t("chatbot_target")}</span></div></div>}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">{messages.map((message, i) => <ChatMessage key={i} message={message} t={t} />)}{loading && <div className="flex gap-3"><div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#C6A15B" }}>{t("chatbot_assistant_badge")}</div><div className="card px-4 py-3"><div className="flex gap-1.5">{[0, 1, 2].map((item) => <div key={item} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#C6A15B", animationDelay: `${item * 150}ms` }} />)}</div></div></div>}<div ref={chatEndRef} /></div>
        <div className="p-5" style={{ borderTop: "1px solid #1C1C1C" }}><div className="flex gap-3"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={t("chatbot_placeholder")} className="input-dark flex-1" /><button onClick={sendMessage} disabled={!input.trim() || loading} className="btn-gold px-5 disabled:opacity-20"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div></div>
      </div>}
    </DashboardLayout>
  );
}
