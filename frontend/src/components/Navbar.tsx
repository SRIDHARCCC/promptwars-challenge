"use client";

import React from "react";
import { Scale, ShieldCheck } from "lucide-react";
import { LanguageMode } from "@/types";
import { translations } from "@/lib/translations";

interface NavbarProps {
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
}

export function Navbar({ language, onLanguageChange }: NavbarProps) {
  const t = translations[language];

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-amber-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">
                {language === "ta" ? "சட்டத் தோழன்" : "Satta Thozhan"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                India Legal Navigator
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.brandTagline}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google ADK 2.0 • Gemini Flash</span>
          </div>

          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                language === "en"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange("ta")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                language === "ta"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
