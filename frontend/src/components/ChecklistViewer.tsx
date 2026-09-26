"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  FileQuestion,
  Lightbulb,
  CheckSquare,
  Square,
  FileText,
  Shield,
  ArrowRight
} from "lucide-react";
import { LanguageMode, ChecklistResponse } from "@/types";
import { translations } from "@/lib/translations";
import { fetchChecklist } from "@/lib/api";

interface Props {
  language: LanguageMode;
  category: string;
  narrative?: string;
  onOpenPrepSheet: (readyDocs: string[], missingDocs: string[]) => void;
}

export function ChecklistViewer({ language, category, narrative, onOpenPrepSheet }: Props) {
  const t = translations[language];

  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"mandatory" | "supportive">("mandatory");

  useEffect(() => {
    async function load() {
      if (!category) return;
      setLoading(true);
      try {
        const data = await fetchChecklist(category, narrative, language);
        setChecklist(data);
        // Pre-check first 1 or 2 by default
        if (data.documents.length > 0) {
          setCheckedIds(new Set([data.documents[0].id]));
        }
      } catch (e) {
        console.error("Error loading checklist", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, narrative, language]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const mandatoryDocs = checklist?.documents.filter((d) => d.is_mandatory) || [];
  const supportiveDocs = checklist?.documents.filter((d) => !d.is_mandatory) || [];

  const totalDocs = checklist?.documents.length || 0;
  const readyCount = checkedIds.size;
  const readinessPercent = totalDocs > 0 ? Math.round((readyCount / totalDocs) * 100) : 0;

  const handleLaunchPrepSheet = () => {
    if (!checklist) return;
    const readyNames = checklist.documents
      .filter((d) => checkedIds.has(d.id))
      .map((d) => d.name);
    const missingNames = checklist.documents
      .filter((d) => !checkedIds.has(d.id))
      .map((d) => d.name);
    onOpenPrepSheet(readyNames, missingNames);
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">{t.analyzing}</p>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <p>Please complete Step 1 (Triage) to generate the tailored document checklist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Readiness Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>{category}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.checklistTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t.checklistSubtitle}
            </p>
          </div>

          {/* Readiness Meter */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 w-full sm:w-64 shrink-0">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-300">{t.readinessTracker}</span>
              <span className="text-amber-400">{readinessPercent}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={readinessPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t.readinessTracker}
              className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"
            >
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 text-right">
              {readyCount} of {totalDocs} documents ready
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div
          role="tablist"
          aria-label="Document classification tabs"
          className="flex space-x-2 mt-6 border-b border-slate-800 pb-3"
        >
          <button
            role="tab"
            id="tab-mandatory-docs"
            aria-selected={activeTab === "mandatory"}
            aria-controls="panel-docs-list"
            onClick={() => setActiveTab("mandatory")}
            className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              activeTab === "mandatory"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <FileCheck className="w-4 h-4" aria-hidden="true" />
            <span>{t.mandatoryTab} ({mandatoryDocs.length})</span>
          </button>
          <button
            role="tab"
            id="tab-supportive-docs"
            aria-selected={activeTab === "supportive"}
            aria-controls="panel-docs-list"
            onClick={() => setActiveTab("supportive")}
            className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              activeTab === "supportive"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <FileQuestion className="w-4 h-4" aria-hidden="true" />
            <span>{t.supportiveTab} ({supportiveDocs.length})</span>
          </button>
        </div>

        {/* Document Items List */}
        <div
          id="panel-docs-list"
          role="tabpanel"
          aria-labelledby={activeTab === "mandatory" ? "tab-mandatory-docs" : "tab-supportive-docs"}
          className="mt-4 space-y-3"
        >
          {(activeTab === "mandatory" ? mandatoryDocs : supportiveDocs).map((item) => {
            const isChecked = checkedIds.has(item.id);
            return (
              <div
                key={item.id}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onClick={() => toggleCheck(item.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    toggleCheck(item.id);
                  }
                }}
                aria-label={`${item.name}. ${isChecked ? "Marked as ready" : "Marked as pending"}`}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isChecked
                    ? "bg-emerald-950/20 border-emerald-800/40"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 text-slate-400" aria-hidden="true">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`text-sm font-semibold ${isChecked ? "text-emerald-200" : "text-slate-100"}`}>
                          {item.name}
                        </span>
                        {item.name_tamil && (
                          <span className="text-xs text-amber-300/80 font-medium">
                            ({item.name_tamil})
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <strong className="text-slate-300">Purpose:</strong> {item.purpose}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs">
                        <span className="text-sky-300 text-[11px] font-medium">
                          <strong>{t.evidentiaryValue}</strong> {item.evidentiary_value}
                        </span>
                        <span className="text-slate-400 hidden sm:inline" aria-hidden="true">•</span>
                        <span className="text-amber-400/90 text-[11px]">
                          <strong>{t.howToObtain}</strong> {item.how_to_obtain}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Golden Rules Box */}
      {checklist.evidence_golden_rules?.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-6">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Lightbulb className="w-4 h-4" />
            <span>{t.goldenRules}</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {checklist.evidence_golden_rules.map((rule, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Action */}
      <div className="flex justify-end">
        <button
          onClick={handleLaunchPrepSheet}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
        >
          <FileText className="w-4 h-4" />
          <span>{t.generatePrepSheet}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
