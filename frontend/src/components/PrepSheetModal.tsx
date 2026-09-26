"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Scale
} from "lucide-react";
import { LanguageMode, PrepSheetResponse } from "@/types";
import { translations } from "@/lib/translations";
import { generatePrepSheet } from "@/lib/api";

interface Props {
  language: LanguageMode;
  category: string;
  narrative: string;
  readyDocs: string[];
  missingDocs: string[];
  onClose: () => void;
}

export function PrepSheetModal({
  language,
  category,
  narrative,
  readyDocs,
  missingDocs,
  onClose
}: Props) {
  const t = translations[language];

  const [prepSheet, setPrepSheet] = useState<PrepSheetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("Citizen Client");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await generatePrepSheet({
          user_name: clientName,
          case_title: `${category} Grievance Briefing`,
          category: category || "General Dispute",
          narrative: narrative || "Standard dispute details provided by citizen.",
          relief_sought: "Full restoration of legal rights, financial recovery, and compensation for harassment.",
          ready_documents: readyDocs,
          missing_documents: missingDocs,
          language: language
        });
        setPrepSheet(data);
      } catch (err) {
        console.error("Failed to generate prep sheet", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, narrative, readyDocs, missingDocs, language, clientName]);

  // Close on Escape key press for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prep-sheet-dialog-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Modal Controls */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h2 id="prep-sheet-dialog-title" className="font-bold text-white text-base">
              {t.step4} (1-Page Briefing)
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              aria-label="Print advocate briefing sheet"
              className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.printPrepSheet}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close prep sheet dialog"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Content / Printable Document Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-200 print:text-black print:bg-white print:p-4 print:space-y-4">
          {/* Printable name edit control */}
          <div className="print:hidden flex items-center space-x-2 bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <label htmlFor="prepsheet-client-name" className="text-xs font-semibold text-slate-300">
              Client Name on Sheet:
            </label>
            <input
              id="prepsheet-client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {loading ? (
            <div className="py-16 text-center" aria-live="polite">
              <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" aria-hidden="true" />
              <p className="text-sm text-slate-400">Compiling Advocate Consultation Prep Sheet...</p>
            </div>
          ) : prepSheet ? (
            <div className="border border-slate-800 print:border-black rounded-xl p-6 print:p-4 bg-slate-950/60 print:bg-white space-y-6 print:space-y-4">
              {/* Official Header */}
              <div className="border-b border-slate-700 print:border-black pb-4 text-center">
                <div className="text-[10px] uppercase tracking-widest font-bold text-amber-400 print:text-black">
                  Confidential • Client Legal Consultation Brief
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white print:text-black mt-1">
                  {prepSheet.title}
                </h1>
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-slate-400 print:text-black mt-2">
                  <span><strong>Client:</strong> {prepSheet.client_name}</span>
                  <span>•</span>
                  <span><strong>Category:</strong> {prepSheet.category}</span>
                  <span>•</span>
                  <span><strong>Forum:</strong> {prepSheet.estimated_forum_and_process}</span>
                </div>
              </div>

              {/* Factual Synopsis */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black mb-1">
                  1. Factual Synopsis
                </h2>
                <p className="text-xs leading-relaxed text-slate-300 print:text-black">
                  {prepSheet.factual_synopsis}
                </p>
                {prepSheet.factual_synopsis_tamil && (
                  <p className="text-xs leading-relaxed text-amber-300/80 print:text-black mt-1 font-medium">
                    {prepSheet.factual_synopsis_tamil}
                  </p>
                )}
              </div>

              {/* Chronological Timeline */}
              {prepSheet.chronological_timeline?.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black mb-2">
                    2. Chronological Sequence of Events
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-800 print:border-black">
                      <thead className="bg-slate-900 print:bg-slate-200 text-slate-300 print:text-black">
                        <tr>
                          <th className="p-2 border-b border-slate-800 print:border-black w-1/4">Date / Period</th>
                          <th className="p-2 border-b border-slate-800 print:border-black">Event / Fact</th>
                          <th className="p-2 border-b border-slate-800 print:border-black w-1/4">Supporting Doc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 print:divide-black">
                        {prepSheet.chronological_timeline.map((ev, i) => (
                          <tr key={i} className="hover:bg-slate-900/30">
                            <td className="p-2 font-semibold text-slate-200 print:text-black">{ev.date_or_period}</td>
                            <td className="p-2 text-slate-300 print:text-black">{ev.event_description}</td>
                            <td className="p-2 text-slate-400 print:text-black">{ev.supporting_document_ref || "None"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Evidence Status */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black mb-2">
                  3. Document Readiness Audit
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-950/20 print:bg-slate-50 border border-emerald-900/30 print:border-black p-3 rounded-lg">
                    <span className="font-bold text-emerald-400 print:text-black block mb-1">
                      Ready Documents ({prepSheet.evidence_readiness_status.ready_count}):
                    </span>
                    <ul className="space-y-1 text-slate-300 print:text-black">
                      {prepSheet.evidence_readiness_status.ready.length > 0 ? (
                        prepSheet.evidence_readiness_status.ready.map((doc, idx) => (
                          <li key={idx} className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 print:text-black shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500">None marked ready</li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-amber-950/20 print:bg-slate-50 border border-amber-900/30 print:border-black p-3 rounded-lg">
                    <span className="font-bold text-amber-400 print:text-black block mb-1">
                      Pending / Missing Documents ({prepSheet.evidence_readiness_status.missing_count}):
                    </span>
                    <ul className="space-y-1 text-slate-300 print:text-black">
                      {prepSheet.evidence_readiness_status.missing.length > 0 ? (
                        prepSheet.evidence_readiness_status.missing.map((doc, idx) => (
                          <li key={idx} className="flex items-center space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 print:text-black shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500">All key documents collected</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 5 Strategic Questions to Ask Your Advocate */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black mb-2">
                  4. {t.questionsToAskAdvocate}
                </h2>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 print:text-black">
                  {prepSheet.top_questions_for_advocate.map((q, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {q}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Advocate Notes Box */}
              <div className="border-2 border-dashed border-slate-700 print:border-black p-4 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-slate-400 print:text-black block mb-1">
                  5. For Advocate&apos;s Office Use Only (Counsel Notes, Court Fees, Limitation Check)
                </span>
                <div className="h-16 print:h-24 bg-transparent" />
              </div>

              {/* Disclaimer footer */}
              <div className="text-[10px] text-slate-500 print:text-black border-t border-slate-800 print:border-black pt-2 text-center">
                {prepSheet.disclaimer}
              </div>
            </div>
          ) : (
            <p className="text-sm text-rose-400">Failed to load prep sheet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
