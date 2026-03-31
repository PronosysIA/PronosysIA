import { useState, useRef } from "react";

const PLATFORMS_PUBS = [
  { value: "meta", label: "Meta Ads" }, { value: "google", label: "Google Ads" },
  { value: "tiktok_ads", label: "TikTok Ads" }, { value: "snapchat_ads", label: "Snapchat Ads" }, { value: "other_ads", label: "Autre" },
];
const PLATFORMS_RESEAUX = [
  { value: "tiktok", label: "TikTok" }, { value: "instagram", label: "Instagram Reels" },
  { value: "youtube_shorts", label: "YouTube Shorts" }, { value: "snapchat", label: "Snapchat" }, { value: "other_social", label: "Autre" },
];

export default function VideoUploader({ onAnalyze, category }) {
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const platforms = category === "pubs" ? PLATFORMS_PUBS : PLATFORMS_RESEAUX;
  const handleFile = (f) => { if (f && f.type.startsWith("video/")) { setFile(f); if (!platform) setPlatform(platforms[0].value); } };
  const formatSize = (b) => b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className={`card p-12 text-center cursor-pointer transition-all ${dragOver ? "border-[#C6A15B]" : ""}`}
        style={dragOver ? { borderColor: "#C6A15B" } : { borderStyle: "dashed" }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <div className="animate-scaleIn">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#141414" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#4ADE80" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-white font-medium mb-1">{file.name}</p>
            <p className="text-sm" style={{ color: "#555" }}>{formatSize(file.size)}</p>
            <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-sm mt-3" style={{ color: "#F87171" }}>Changer</button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#141414" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#C6A15B" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <p className="text-white font-medium mb-2">Glissez votre video ici</p>
            <p className="text-sm" style={{ color: "#555" }}>ou <span style={{ color: "#C6A15B" }}>cliquez pour choisir</span> — MP4, MOV, AVI</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#555" }}>Plateforme</p>
        <div className="flex flex-wrap gap-2">
          {platforms.map(p => (
            <button key={p.value} onClick={() => setPlatform(p.value)}
              className="px-4 py-2.5 rounded-lg text-sm transition-all"
              style={platform === p.value ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { background: "#141414", color: "#555", border: "1px solid #1C1C1C" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => { if (file && platform) onAnalyze({ file, platform }); }} disabled={!file || !platform}
        className="btn-gold w-full py-4 disabled:opacity-20 disabled:cursor-not-allowed">
        Analyser ma video
      </button>
    </div>
  );
}