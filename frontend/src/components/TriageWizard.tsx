"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Landmark,
  BookOpen,
  FileCheck2
} from "lucide-react";
import { LanguageMode, TriageResponse } from "@/types";
import { translations } from "@/lib/translations";
import { fetchTriage } from "@/lib/api";

interface Props {
  language: LanguageMode;
  onTriageComplete: (data: TriageResponse, narrative: string) => void;
  onProceedToChecklist: () => void;
}

const INDIAN_STATES = [
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Delhi (NCT)",
  "Kerala",
  "Telangana",
  "Andhra Pradesh",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat"
];

export function TriageWizard({ language, onTriageComplete, onProceedToChecklist }: Props) {
  const t = translations[language];

  const [narrative, setNarrative] = useState("");
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [role, setRole] = useState("Tenant / Consumer / Citizen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResponse | null>(null);

  const applyScenario = (type: "cheque" | "rent" | "cyber" | "consumer" | "police") => {
    if (language === "ta") {
      switch (type) {
        case "cheque":
          setNarrative("ஒரு வாடிக்கையாளர் எனக்கு ₹2,50,000 காசோலை (Cheque) கொடுத்தார். அது போதுமான நிதி இல்லை (Insufficient funds) என்று வங்கியில் பவுன்ஸ் ஆகிவிட்டது. வங்கி மெமோ நேற்று கிடைத்தது.");
          break;
        case "rent":
          setNarrative("சென்னையில் நான் குடியிருந்த வீட்டை காலி செய்து 2 மாதங்கள் ஆகிவிட்டது. வீட்டு உரிமையாளர் எந்த காரணமும் இல்லாமல் எனது முன்பணம் ₹1,00,000-ஐ திருப்பித் தர மறுக்கிறார்.");
          break;
        case "cyber":
          setNarrative("இன்று காலை வங்கி அதிகாரி போல் பேசிய ஒரு நபர் அனுப்பிய இணைப்பை அழுத்தியதில், எனது வங்கிக் கணக்கிலிருந்து ₹45,000 திருடப்பட்டுவிட்டது.");
          break;
        case "consumer":
          setNarrative("பிரபல இ-காமர்ஸ் தளத்தில் வாங்கிய மடிக்கணினி வேலை செய்யவில்லை. சர்வீஸ் சென்டர் மாற்றிக் கொடுக்கவோ சரிசெய்யவோ மறுக்கிறது.");
          break;
        case "police":
          setNarrative("அக்கம்பக்கத்து நபர் எனது நிலத்தில் அத்துமீறி நுழைந்து மிரட்டல் விடுக்கிறார். காவல் நிலையத்தில் புகார் அளிக்க விரும்புகிறேன்.");
          break;
      }
    } else {
      switch (type) {
        case "cheque":
          setNarrative("A business client issued a cheque for ₹2,50,000 which bounced yesterday with the remark 'Funds Insufficient'. I have the original cheque and the bank return memo.");
          break;
        case "rent":
          setNarrative("I vacated my rented flat in Chennai on 1st January after serving 1 month notice. The landlord has refused to return my security deposit of ₹1,00,000 citing baseless repair excuses.");
          break;
        case "cyber":
          setNarrative("I was tricked by an unauthorized caller posing as bank support. An unauthorized UPI debit of ₹45,000 occurred 3 hours ago from my savings account.");
          break;
        case "consumer":
          setNarrative("Purchased a refrigerator 3 months ago with a 2-year warranty. The cooling system stopped working and the authorized service center refuses to repair or replace it.");
          break;
        case "police":
          setNarrative("Neighbor broke our boundary fence and verbally threatened physical harm in front of witnesses. I need to know how to file a formal complaint.");
          break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTriage(narrative, language, selectedState, role);
      setResult(data);
      onTriageComplete(data, narrative);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze legal situation. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>{t.intakeTitle}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t.intakeSubtitle}
          </p>
        </div>

        {/* Quick Scenarios */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            {t.quickScenarios}
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick legal scenario templates">
            <button
              type="button"
              onClick={() => applyScenario("cheque")}
              aria-label="Load scenario: Cheque Bounce under Section 138 NI Act"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/50 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              💼 {t.scenarioCheque}
            </button>
            <button
              type="button"
              onClick={() => applyScenario("rent")}
              aria-label="Load scenario: Tenancy and Security Deposit Dispute"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-sky-500/50 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              🏠 {t.scenarioRent}
            </button>
            <button
              type="button"
              onClick={() => applyScenario("cyber")}
              aria-label="Load scenario: Cyber Crime and Financial Fraud"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 hover:border-rose-500/50 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              🛡️ {t.scenarioCyber}
            </button>
            <button
              type="button"
              onClick={() => applyScenario("consumer")}
              aria-label="Load scenario: Consumer Protection and Defective Goods"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 hover:border-emerald-500/50 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              🛒 {t.scenarioConsumer}
            </button>
            <button
              type="button"
              onClick={() => applyScenario("police")}
              aria-label="Load scenario: Police Complaint and BNS/BNSS matter"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 hover:border-purple-500/50 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              ⚖️ {t.scenarioPolice}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="grievance-narrative" className="sr-only">
              {t.intakeTitle}
            </label>
            <textarea
              id="grievance-narrative"
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder={t.placeholderNarrative}
              aria-required="true"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm leading-relaxed resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.stateLabel}
              </label>
              <select
                id="state-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="citizen-role" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.roleLabel}
              </label>
              <input
                id="citizen-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !narrative.trim()}
              aria-busy={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>{t.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>{t.triageButton}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Triage Results Display */}
      {result && (
        <div
          aria-live="polite"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in"
        >
          {/* Header & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {result.category}
                </span>
                {result.sub_category && (
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    • {result.sub_category}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-2">
                {result.summary}
              </h3>
              {result.summary_tamil && (
                <p className="text-sm text-amber-200/80 mt-1 font-medium">
                  {result.summary_tamil}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-400">{t.urgency}:</span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  result.urgency_level === "High"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : result.urgency_level === "Medium"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {result.urgency_level} Urgency
              </span>
            </div>
          </div>

          {/* Legal Mapping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-2">
                <BookOpen className="w-4 h-4" />
                <span>{t.statutorySection}</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {result.statutory_info.act_name}
              </p>
              {result.statutory_info.sections?.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Sections: {result.statutory_info.sections.join(", ")}
                </p>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold mb-2">
                <Landmark className="w-4 h-4" />
                <span>{t.recommendedForum}</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {result.recommended_forum}
              </p>
              {result.alternative_resolution && (
                <p className="text-xs text-slate-400 mt-1">
                  Alt: {result.alternative_resolution}
                </p>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold mb-2">
                <Clock className="w-4 h-4" />
                <span>{t.limitationWindow}</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {result.statutory_info.limitation_period || "Standard limitation applies."}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {result.urgency_reason}
              </p>
            </div>
          </div>

          {/* DOs and DONTs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.immediateDos}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.dos.map((d, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
                <XCircle className="w-4 h-4" />
                <span>{t.immediateDonts}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.donts.map((d, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 italic">
              {result.disclaimer}
            </p>
            <button
              onClick={onProceedToChecklist}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-md"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t.nextStepToChecklist}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
