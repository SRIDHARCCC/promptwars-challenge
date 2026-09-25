"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StatutoryBanner } from "@/components/StatutoryBanner";
import { TriageWizard } from "@/components/TriageWizard";
import { ChecklistViewer } from "@/components/ChecklistViewer";
import { NoticeAuditor } from "@/components/NoticeAuditor";
import { PrepSheetModal } from "@/components/PrepSheetModal";
import { SavedCasesViewer } from "@/components/SavedCasesViewer";
import { LanguageMode, TriageResponse, SavedCase } from "@/types";
import { translations } from "@/lib/translations";
import { useAuth } from "@/context/AuthContext";
import { saveCaseToFirestore } from "@/lib/api";
import {
  Sparkles,
  FileCheck2,
  ShieldAlert,
  FolderClock
} from "lucide-react";

export default function Home() {
  const [language, setLanguage] = useState<LanguageMode>("en");
  const [currentStep, setCurrentStep] = useState<"triage" | "checklist" | "notice" | "saved_cases">("triage");
  
  // Cross-step State
  const [currentCaseId, setCurrentCaseId] = useState<string | undefined>(undefined);
  const [triageData, setTriageData] = useState<TriageResponse | null>(null);
  const [narrative, setNarrative] = useState<string>("");
  const [readyDocs, setReadyDocs] = useState<string[]>([]);
  const [missingDocs, setMissingDocs] = useState<string[]>([]);
  const [isPrepSheetOpen, setIsPrepSheetOpen] = useState(false);

  const { authId, userName, userEmail } = useAuth();
  const t = translations[language];

  const handleTriageComplete = async (data: TriageResponse, text: string) => {
    setTriageData(data);
    setNarrative(text);

    // Persist to Google Cloud Firestore linked to Firebase Auth ID
    try {
      const saved = await saveCaseToFirestore({
        id: currentCaseId,
        auth_id: authId,
        client_name: userName,
        client_email: userEmail,
        category: data.category,
        narrative: text,
        language: language,
        triage_result: data
      });
      if (saved?.id) {
        setCurrentCaseId(saved.id);
      }
    } catch (err) {
      console.warn("Auto-saving to Firestore notice:", err);
    }
  };

  const handleOpenPrepSheet = async (ready: string[], missing: string[]) => {
    setReadyDocs(ready);
    setMissingDocs(missing);
    setIsPrepSheetOpen(true);

    // Update Firestore with document evidence status
    if (triageData) {
      try {
        await saveCaseToFirestore({
          id: currentCaseId,
          auth_id: authId,
          client_name: userName,
          client_email: userEmail,
          category: triageData.category,
          narrative: narrative,
          language: language,
          triage_result: triageData,
          evidence_checklist: { ready, missing }
        });
      } catch (err) {
        console.warn("Updating checklist in Firestore notice:", err);
      }
    }
  };

  const handleSelectCaseFromHistory = (caseItem: SavedCase) => {
    setCurrentCaseId(caseItem.id);
    setNarrative(caseItem.narrative || "");
    if (caseItem.triage_result) {
      setTriageData(caseItem.triage_result);
    }
    if (caseItem.evidence_checklist?.ready) {
      setReadyDocs(caseItem.evidence_checklist.ready);
    }
    if (caseItem.evidence_checklist?.missing) {
      setMissingDocs(caseItem.evidence_checklist.missing);
    }
    setCurrentStep("checklist");
  };

  const handleViewPrepSheetFromHistory = (caseItem: SavedCase) => {
    setCurrentCaseId(caseItem.id);
    setNarrative(caseItem.narrative || "");
    if (caseItem.triage_result) {
      setTriageData(caseItem.triage_result);
    }
    if (caseItem.evidence_checklist?.ready) {
      setReadyDocs(caseItem.evidence_checklist.ready);
    }
    if (caseItem.evidence_checklist?.missing) {
      setMissingDocs(caseItem.evidence_checklist.missing);
    }
    setIsPrepSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar language={language} onLanguageChange={setLanguage} />
      <StatutoryBanner language={language} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Step Tabs */}
        <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none pb-px space-x-2 sm:space-x-4">
          <button
            onClick={() => setCurrentStep("triage")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              currentStep === "triage"
                ? "border-amber-500 text-amber-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t.step1}</span>
          </button>

          <button
            onClick={() => setCurrentStep("checklist")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              currentStep === "checklist"
                ? "border-amber-500 text-amber-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck2 className="w-4 h-4 shrink-0" />
            <span>{t.step2}</span>
          </button>

          <button
            onClick={() => setCurrentStep("notice")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              currentStep === "notice"
                ? "border-amber-500 text-amber-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{t.step3}</span>
          </button>

          <button
            onClick={() => setCurrentStep("saved_cases")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              currentStep === "saved_cases"
                ? "border-amber-500 text-amber-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderClock className="w-4 h-4 shrink-0" />
            <span>{language === "ta" ? "என் வழக்குகள் (Firestore)" : "My Cases (Firestore)"}</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        {currentStep === "triage" && (
          <TriageWizard
            language={language}
            onTriageComplete={handleTriageComplete}
            onProceedToChecklist={() => setCurrentStep("checklist")}
          />
        )}

        {currentStep === "checklist" && (
          <ChecklistViewer
            language={language}
            category={triageData?.category || "Consumer Protection"}
            narrative={narrative}
            onOpenPrepSheet={handleOpenPrepSheet}
          />
        )}

        {currentStep === "notice" && (
          <NoticeAuditor language={language} />
        )}

        {currentStep === "saved_cases" && (
          <SavedCasesViewer
            language={language}
            onSelectCase={handleSelectCaseFromHistory}
            onViewPrepSheet={handleViewPrepSheetFromHistory}
          />
        )}
      </main>

      {/* Modal for Step 4: 1-Page Prep Sheet */}
      {isPrepSheetOpen && (
        <PrepSheetModal
          language={language}
          category={triageData?.category || "Civil/Consumer Matter"}
          narrative={narrative}
          readyDocs={readyDocs}
          missingDocs={missingDocs}
          onClose={() => setIsPrepSheetOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            <strong>Satta Thozhan (சட்டத் தோழன்)</strong> • Indian Pre-Advocate Legal Triage Platform
          </p>
          <p className="text-[11px] text-slate-500">
            Powered by Google ADK 2.0 & Gemini Flash • Firebase Auth & Google Cloud Firestore Vault
          </p>
        </div>
      </footer>
    </div>
  );
}
