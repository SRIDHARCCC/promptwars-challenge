"use client";

import React from "react";
import { Scale, ShieldCheck, LogOut, LogIn, UserCheck } from "lucide-react";
import { LanguageMode } from "@/types";
import { translations } from "@/lib/translations";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
}

export function Navbar({ language, onLanguageChange }: NavbarProps) {
  const t = translations[language];
  const { user, authId, userName, signInWithGoogle, signInGuest, signOutUser } = useAuth();

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

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google ADK 2.0 • Vertex AI</span>
          </div>

          {/* User Auth Info & Actions */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-semibold text-slate-200 text-[11px] leading-tight truncate max-w-[100px]">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {authId.slice(0, 6)}...
                  </p>
                </div>
                <button
                  onClick={signOutUser}
                  title="Sign Out"
                  className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={signInWithGoogle}
                  className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Sign In</span>
                </button>
                <button
                  onClick={signInGuest}
                  title="Demo / Guest Login"
                  className="hidden sm:inline-flex items-center space-x-1 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 px-2.5 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Guest</span>
                </button>
              </div>
            )}
          </div>

          {/* Bilingual Language Switcher */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                language === "en"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("ta")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
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
