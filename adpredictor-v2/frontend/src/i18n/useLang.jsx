import { useState, useEffect, createContext, useContext } from "react";
import translations from "./translations.js";

const LangContext = createContext({ lang: "fr", t: (k) => k, setLang: () => {} });

const FLAGS = {
  fr: "\u{1F1EB}\u{1F1F7}",
  en: "\u{1F1EC}\u{1F1E7}",
  es: "\u{1F1EA}\u{1F1F8}",
};

const LABELS = { fr: "Francais", en: "English", es: "Espanol" };

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("pronosys_lang") || "fr");

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem("pronosys_lang", l);
  };

  const t = (key) => {
    if (translations[lang] && translations[lang][key]) return translations[lang][key];
    if (translations.fr[key]) return translations.fr[key];
    return key;
  };

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LangContext);
}

export function LanguageSwitcher({ style }) {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative" style={style}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:bg-white/[0.05]"
        style={{ color: "#888", border: "1px solid #1C1C1C" }}
      >
        <span>{FLAGS[lang]}</span>
        <span>{lang.toUpperCase()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 rounded-lg overflow-hidden z-50 animate-fadeIn" style={{ background: "#141414", border: "1px solid #1C1C1C", minWidth: "120px" }}>
          {Object.keys(FLAGS).map((l) => (
            <button key={l} onClick={(e) => { e.stopPropagation(); setLang(l); setOpen(false); }}
              className={"w-full flex items-center gap-2 px-3 py-2 text-xs transition-all " + (l === lang ? "text-white" : "text-[#555] hover:text-white hover:bg-white/[0.03]")}>
              <span>{FLAGS[l]}</span>
              <span>{LABELS[l]}</span>
              {l === lang && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#C6A15B" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}