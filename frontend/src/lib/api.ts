import {
  TriageResponse,
  ChecklistResponse,
  NoticeAnalysisResponse,
  PrepSheetResponse,
  TimelineEvent,
  SavedCase
} from "@/types";

let dynamicApiUrl = "";

export function setApiBaseUrl(url: string) {
  if (url) {
    dynamicApiUrl = url.replace(/\/$/, "");
  }
}

export function getApiBaseUrl(): string {
  if (dynamicApiUrl) return dynamicApiUrl;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("satta-thozhan-frontend-") && host.includes(".run.app")) {
      return `https://${host.replace("satta-thozhan-frontend-", "satta-thozhan-backend-")}`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export async function fetchTriage(
  narrative: string,
  language: string = "en",
  location_state: string = "Tamil Nadu",
  role: string = "complainant"
): Promise<TriageResponse> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ narrative, language, location_state, role }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to analyze grievance");
  }
  return res.json();
}

export async function fetchChecklist(
  category: string,
  narrative?: string,
  language: string = "en"
): Promise<ChecklistResponse> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, narrative, language }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to generate document checklist");
  }
  return res.json();
}

export async function analyzeNoticeText(text: string): Promise<NoticeAnalysisResponse> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/notice/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to analyze notice text");
  }
  return res.json();
}

export async function uploadNoticeFile(file: File): Promise<NoticeAnalysisResponse> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${baseUrl}/api/notice/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload and analyze document");
  }
  return res.json();
}

export async function generatePrepSheet(payload: {
  user_name: string;
  case_title: string;
  category: string;
  narrative: string;
  relief_sought: string;
  timeline?: TimelineEvent[];
  ready_documents: string[];
  missing_documents: string[];
  language?: string;
}): Promise<PrepSheetResponse> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/prepsheet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to compile advocate prep sheet");
  }
  return res.json();
}

export async function saveCaseToFirestore(payload: {
  id?: string;
  auth_id: string;
  client_name?: string;
  client_email?: string | null;
  category: string;
  narrative: string;
  language?: string;
  triage_result?: TriageResponse;
  evidence_checklist?: {
    ready?: string[];
    missing?: string[];
  };
  prep_sheet?: PrepSheetResponse;
}): Promise<SavedCase> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to save case in Firestore");
  }
  return res.json();
}

export async function fetchUserCases(auth_id: string): Promise<SavedCase[]> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/cases?auth_id=${encodeURIComponent(auth_id)}`, {
    method: "GET",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch user cases from Firestore");
  }
  return res.json();
}
