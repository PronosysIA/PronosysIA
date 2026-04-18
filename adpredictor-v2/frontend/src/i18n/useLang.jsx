import { useState, useEffect, useRef, createContext, useContext } from "react";
import translations from "./translations.js";

const LangContext = createContext({ lang: "fr", t: (k) => k, setLang: () => {} });

const OPTIONS = {
  fr: { code: "FR", label: "Francais" },
  en: { code: "EN", label: "English" },
  es: { code: "ES", label: "Espanol" },
};

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("pronosys_lang") || "fr");

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem("pronosys_lang", l);
  };

  const t = (key, vars = {}) => {
    const template = (translations[lang] && translations[lang][key]) || translations.fr[key] || key;
    return Object.entries(vars).reduce(
      (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
      template
    );
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
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative" style={style}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/[0.05]"
        style={{ color: "#D7D1C4", border: "1px solid #242424", background: "#101010", fontFamily: "var(--font-body)" }}
      >
        <span style={{ fontWeight: 800, letterSpacing: "0.14em", color: "#C6A15B" }}>{OPTIONS[lang].code}</span>
        <span style={{ color: "#F3EEE4" }}>{OPTIONS[lang].label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 rounded-xl overflow-hidden z-50 animate-fadeIn" style={{ background: "#141414", border: "1px solid #242424", minWidth: "150px", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
          {Object.keys(OPTIONS).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => { setLang(option); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 text-xs transition-all text-left"
              style={option === lang ? { color: "#F7F2E8", background: "rgba(198,161,91,0.08)", fontFamily: "var(--font-body)" } : { color: "#9B9488", background: "transparent", fontFamily: "var(--font-body)" }}
            >
              <span style={{ width: "22px", fontWeight: 800, letterSpacing: "0.12em", color: option === lang ? "#C6A15B" : "#6B6459" }}>{OPTIONS[option].code}</span>
              <span>{OPTIONS[option].label}</span>
              {option === lang && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#C6A15B" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
