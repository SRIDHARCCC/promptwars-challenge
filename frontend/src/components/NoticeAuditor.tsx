"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { LanguageMode, NoticeAnalysisResponse } from "@/types";
import { translations } from "@/lib/translations";
import { analyzeNoticeText, uploadNoticeFile } from "@/lib/api";

interface Props {
  language: LanguageMode;
}

const SAMPLE_138_NOTICE = `LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881
To: Mr. R. Rajesh, No. 14, Anna Nagar, Chennai - 600040.
From: Advocate S. Sundaram, High Court of Madras, YMCA Building, Chennai.
Under instructions from my client M/s Apex Enterprises, you issued Cheque No. 458921 dated 10-02-2026 for Rs. 3,50,000/- drawn on HDFC Bank towards payment of goods supplied.
The said cheque was dishonoured on presentation on 12-02-2026 with remarks 'FUNDS INSUFFICIENT'.
You are hereby called upon to pay the said sum of Rs. 3,50,000/- within 15 (FIFTEEN) DAYS from the date of receipt of this notice, failing which criminal proceedings under Section 138 of the Negotiable Instruments Act will be initiated against you without further notice.`;

const SAMPLE_COURT_SUMMONS = `SUMMONS FOR APPEARANCE IN COURT OF JUDICIAL MAGISTRATE
IN THE COURT OF XIV METROPOLITAN MAGISTRATE, EGMORE, CHENNAI
C.C. No. 892/2026
State represented by Inspector of Police vs. A1 & Others.
To: Accused No. 1,
WHEREAS your attendance is necessary to answer to a charge under Section 318(4) of Bharatiya Nyaya Sanhita, 2023.
You are hereby required to appear in person or by Pleader before this Court on 15th April 2026 at 10:30 AM without fail.
Given under my hand and the seal of the Court, this 20th day of March 2026.`;

export function NoticeAuditor({ language }: Props) {
  const t = translations[language];

  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NoticeAnalysisResponse | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
    setLoading(true);
    try {
      const data = await uploadNoticeFile(selectedFile);
      setAnalysis(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse and audit document.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const data = await analyzeNoticeText(inputText);
      setAnalysis(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze notice text.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Summons & Notice Scanner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.noticeScannerTitle}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t.noticeScannerSubtitle}
          </p>
        </div>

        {/* Quick Sample Notice Buttons */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Test with Sample Indian Notices:
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Sample notice documents">
            <button
              type="button"
              onClick={() => {
                setInputText(SAMPLE_138_NOTICE);
                setFile(null);
              }}
              aria-label="Load sample 15-day cheque bounce notice under Section 138"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              📜 15-Day Cheque Bounce Notice (Sec 138)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText(SAMPLE_COURT_SUMMONS);
                setFile(null);
              }}
              aria-label="Load sample Magistrate Court summons under BNS/BNSS"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              🏛️ Magistrate Court Summons (BNS/BNSS)
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-colors flex flex-col justify-center items-center bg-slate-950/40">
            <Upload className="w-8 h-8 text-slate-400 mb-3" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-200">
              {t.dragDropText}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, plain text documents (.pdf, .txt up to 5MB)
            </p>
            <label
              htmlFor="notice-file-upload"
              className="mt-4 cursor-pointer inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-colors focus-within:ring-2 focus-within:ring-amber-400"
            >
              <span>Select File</span>
              <input
                id="notice-file-upload"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                aria-label="Upload notice file in PDF or TXT format"
                className="sr-only"
              />
            </label>
            {file && (
              <p className="text-xs text-amber-400 mt-2 font-medium">
                Selected: {file.name}
              </p>
            )}
          </div>

          <form onSubmit={handleTextSubmit} className="flex flex-col justify-between">
            <div>
              <label htmlFor="notice-text-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.orPasteText}
              </label>
              <textarea
                id="notice-text-input"
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste notice paragraphs, advocate details, demand amount, or dates..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs leading-relaxed resize-y"
              />
            </div>
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                aria-busy={loading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-md text-xs disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    <span>{t.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.analyzeNoticeButton}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div
          aria-live="polite"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {analysis.document_type}
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                Audit Summary of Received Document
              </h3>
              {analysis.sender_name && (
                <p className="text-xs text-slate-400 mt-1">
                  Issued by: <strong className="text-slate-300">{analysis.sender_name}</strong> ({analysis.sender_role || "Sender"})
                </p>
              )}
            </div>

            {/* Deadline Urgency Banner */}
            <div className="bg-rose-950/40 border border-rose-700/50 rounded-xl p-3.5 flex items-center space-x-3 shrink-0">
              <Clock className="w-6 h-6 text-rose-400 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-300">
                  {t.deadlineWarning}
                </p>
                <p className="text-base font-extrabold text-white">
                  {analysis.response_deadline_days
                    ? `${analysis.response_deadline_days} DAYS FROM RECEIPT`
                    : "Immediate Attention Required"}
                </p>
              </div>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.monetary_claim && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{t.claimsDemanded}</span>
                </div>
                <p className="text-sm font-bold text-slate-100">
                  {analysis.monetary_claim}
                </p>
              </div>
            )}

            {analysis.relevant_statutes_cited?.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Cited Statutes & Sections</span>
                </div>
                <p className="text-xs text-slate-300">
                  {analysis.relevant_statutes_cited.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Allegations */}
          {analysis.key_allegations?.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {t.allegations}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {analysis.key_allegations.map((a, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-400">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Immediate DOs and DONTs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Immediate Protective Steps</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.immediate_dos.map((d, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <XCircle className="w-4 h-4" />
                <span>Critical Mistakes to Avoid</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.immediate_donts.map((d, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Advocate Action Box */}
          <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              {t.advocateNextAction}
            </h4>
            <p className="text-xs text-slate-200">
              {analysis.recommended_advocate_action}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
