"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { LanguageMode } from "@/types";
import { translations } from "@/lib/translations";

interface Props {
  language: LanguageMode;
}

export function StatutoryBanner({ language }: Props) {
  const t = translations[language];

  return (
    <div
      role="region"
      aria-label="Statutory Disclaimer"
      className="bg-amber-950/40 border-b border-amber-900/40 px-4 py-2.5 text-xs text-amber-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-center">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
        <span className="font-medium tracking-wide">
          {t.disclaimerBanner}
        </span>
      </div>
    </div>
  );
}
