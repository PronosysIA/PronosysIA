import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import VideoUploader from "../components/VideoUploader.jsx";

function ChatMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fadeInUp`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={isUser ? { background: "#1A1A1A", color: "#C6A15B", border: "1px solid #222" } : { background: "#C6A15B", color: "white" }}>{isUser ? "V" : "IA"}</div>
      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div className="rounded-xl px-4 py-3" style={isUser ? { background: "#1A1A1A", border: "1px solid #222" } : { background: "#141414", border: "1px solid #1C1C1C" }}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "#888" }}>{message.content}</p>
        </div>
        {message.script_data && (
          <div className="card mt-3 p-5"><p className="text-xs mb-3" style={{ color: "#C6A15B" }}>{message.script_data.title} — Score vise: {message.script_data.target_score}</p>
          <div className="space-y-1.5">{(message.script_data.script || []).map((s, i) => <div key={i} className="flex gap-2 text-xs"><span style={{ color: "#C6A15B" }}>{s.timestamp}</span><span style={{ color: "#555" }}>{s.visual}</span></div>)}</div></div>
        )}
        {message.video_url && <div className="card mt-3 p-4"><video src={message.video_url} controls className="w-full rounded-lg bg-black aspect-video" /><a href={message.video_url} download className="btn-gold text-xs mt-3 inline-block">Telecharger</a></div>}
        {message.video_loading && <div className="card mt-3 p-6 text-center"><div className="w-8 h-8 rounded-full border-2 mx-auto mb-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /><p className="text-xs" style={{ color: "#555" }}>Generation video...</p></div>}
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  const [step, setStep] = useState("upload");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleUpload = async ({ file, platform }) => {
    setStep("analyzing");
    try {
      const fd = new FormData(); fd.append("video", file); fd.append("category", "reseaux"); fd.append("platform", platform);
      const h = {}; if (token) h["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/analyze", { method: "POST", headers: h, body: fd }); const data = await res.json();
      if (!res.ok) { alert(data.detail || "Erreur."); setStep("upload"); return; }
      setAnalysisData(data);
      const initRes = await fetch("/api/chatbot/start", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ analysis_data: data }) });
      const initData = await initRes.json();
      setSessionId(initData.session_id);
      setMessages([{ role: "assistant", content: initData.response, script_data: initData.script_data }]);
      setStep("chat");
    } catch { alert("Erreur."); setStep("upload"); }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg]; setMessages(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chatbot/message", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ session_id: sessionId, messages: newMsgs.map(m => ({ role: m.role, content: m.content })), analysis_data: analysisData }) });
      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.response, script_data: data.script_data || null };
      if (data.generate_video) {
        aiMsg.video_loading = true; setMessages([...newMsgs, aiMsg]);
        const genRes = await fetch("/api/chatbot/generate-video", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(data.generate_video) });
        const genData = await genRes.json(); aiMsg.video_loading = false;
        if (genData.video_url) aiMsg.video_url = genData.video_url; else aiMsg.content += "\n\nErreur: " + (genData.detail || "Erreur");
      }
      setMessages([...newMsgs, aiMsg]);
    } catch { setMessages([...newMsgs, { role: "assistant", content: "Erreur de connexion." }]); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fadeInUp">
        <Link to="/dashboard" className="text-sm mb-6 inline-block" style={{ color: "#555" }}>← Dashboard</Link>
        <h1 className="font-display text-3xl italic text-white">Chatbot Video IA.</h1>
        <p className="mt-3 text-sm" style={{ color: "#555" }}>Discutez avec l'IA pour creer la video parfaite.</p>
      </div>

      {step === "upload" && <div><div className="card-gold p-8 mb-8 animate-fadeInUp"><p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#C6A15B" }}>Comment ca marche</p><ol className="space-y-2 text-sm" style={{ color: "#888" }}><li>1. Uploadez votre video</li><li>2. Discutez pour affiner le script</li><li>3. Generez la video IA</li></ol></div><VideoUploader onAnalyze={handleUpload} category="reseaux" /></div>}

      {step === "analyzing" && <div className="card p-14 text-center animate-fadeIn"><div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /><p className="text-white font-medium">Analyse en cours...</p></div>}

      {step === "chat" && (
        <div className="card overflow-hidden flex flex-col animate-scaleIn" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
          {analysisData && <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1C1C1C" }}><span className="text-sm text-white">{analysisData.filename}</span><div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: analysisData.global_score >= 50 ? "#C6A15B" : "#F87171" }}>{Math.round(analysisData.global_score)}/100</span><span style={{ color: "#333" }}>→</span><span className="text-sm font-bold" style={{ color: "#4ADE80" }}>90+</span></div></div>}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => <ChatMessage key={i} message={m} />)}
            {loading && <div className="flex gap-3"><div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#C6A15B" }}>IA</div><div className="card px-4 py-3"><div className="flex gap-1.5">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#C6A15B", animationDelay: `${i*150}ms` }} />)}</div></div></div>}
            <div ref={chatEndRef} />
          </div>
          <div className="p-5" style={{ borderTop: "1px solid #1C1C1C" }}>
            <div className="flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Decrivez ce que vous voulez..." className="input-dark flex-1" />
              <button onClick={sendMessage} disabled={!input.trim() || loading} className="btn-gold px-5 disabled:opacity-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}