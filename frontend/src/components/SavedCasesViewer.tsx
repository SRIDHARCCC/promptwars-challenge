"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderOpen,
  Calendar,
  ArrowRight,
  Database,
  FileText,
  UserCheck,
  RefreshCw
} from "lucide-react";
import { LanguageMode, SavedCase } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { fetchUserCases } from "@/lib/api";

interface Props {
  language: LanguageMode;
  onSelectCase: (caseItem: SavedCase) => void;
  onViewPrepSheet: (caseItem: SavedCase) => void;
}

export function SavedCasesViewer({ language, onSelectCase, onViewPrepSheet }: Props) {
  const { authId, user } = useAuth();
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCases = useCallback(async () => {
    if (!authId) return;
    setLoading(true);
    try {
      const data = await fetchUserCases(authId);
      setCases(data);
    } catch (e) {
      console.error("Failed to load user cases from Firestore", e);
    } finally {
      setLoading(false);
    }
  }, [authId]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Google Cloud Firestore Vault</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {language === "ta" ? "என் சேமிக்கப்பட்ட வழக்குகள்" : "My Saved Consultations & Cases"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {language === "ta"
                ? "உங்கள் Firebase Auth ID உடன் பாதுகாப்பாக சேமிக்கப்பட்ட சட்ட ஆவணங்கள்."
                : "Persistent legal grievances, triage analyses, and prep sheets linked to your Firebase Account."}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="flex items-center space-x-1.5 justify-end text-xs font-semibold text-emerald-400">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{user ? "Firebase Verified" : "Guest ID Active"}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                UID: {authId.slice(0, 14)}...
              </p>
            </div>
            <button
              onClick={loadCases}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
              title="Refresh Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* List of Consultations */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-7 h-7 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-400">Loading cases from Google Cloud Firestore...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/40 border border-slate-800/80 rounded-xl p-8">
              <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">
                {language === "ta" ? "வழக்குகள் எதுவும் இல்லை" : "No Saved Consultations Found"}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {language === "ta"
                  ? "படி 1-ல் உங்கள் புகாரை சமர்ப்பித்ததும், அது தானாகவே Firestore-ல் சேமிக்கப்படும்."
                  : "When you analyze a grievance in Step 1 or generate a Prep Sheet, it is saved persistently to Firestore under your Firebase Auth ID."}
              </p>
            </div>
          ) : (
            cases.map((c) => {
              const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recent";
              const urgency = c.triage_result?.urgency_level || "Standard";
              return (
                <div
                  key={c.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {c.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          urgency === "High"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {urgency} Urgency
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {c.narrative}
                    </p>

                    {c.triage_result?.statutory_info?.act_name && (
                      <p className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Act:</strong> {c.triage_result.statutory_info.act_name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onSelectCase(c)}
                      className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-slate-700"
                    >
                      <span>Reload Case</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {c.prep_sheet && (
                      <button
                        onClick={() => onViewPrepSheet(c)}
                        className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Prep Sheet</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
