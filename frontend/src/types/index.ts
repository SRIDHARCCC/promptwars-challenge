export interface StatutoryInfo {
  act_name: string;
  sections: string[];
  limitation_period?: string;
}

export interface TriageResponse {
  category: string;
  sub_category?: string;
  summary: string;
  summary_tamil?: string;
  urgency_level: "High" | "Medium" | "Low";
  urgency_reason: string;
  recommended_forum: string;
  alternative_resolution?: string;
  statutory_info: StatutoryInfo;
  immediate_next_steps: string[];
  dos: string[];
  donts: string[];
  questions_to_clarify: string[];
  disclaimer: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  name_tamil?: string;
  is_mandatory: boolean;
  category: "Identification" | "Contractual" | "Financial" | "Communication" | "Official/Court" | string;
  purpose: string;
  how_to_obtain: string;
  evidentiary_value: string;
}

export interface ChecklistResponse {
  category: string;
  total_mandatory: number;
  total_supportive: number;
  documents: DocumentItem[];
  evidence_golden_rules: string[];
  disclaimer: string;
}

export interface NoticeAnalysisResponse {
  document_type: string;
  sender_name?: string;
  sender_role?: string;
  recipient_name?: string;
  date_of_notice?: string;
  response_deadline_days?: number;
  deadline_urgency: "Critical" | "High" | "Moderate" | "Informational" | string;
  monetary_claim?: string;
  key_allegations: string[];
  relevant_statutes_cited: string[];
  immediate_dos: string[];
  immediate_donts: string[];
  recommended_advocate_action: string;
  disclaimer: string;
}

export interface TimelineEvent {
  date_or_period: string;
  event_description: string;
  supporting_document_ref?: string;
}

export interface PrepSheetResponse {
  title: string;
  client_name: string;
  category: string;
  governing_laws: string[];
  factual_synopsis: string;
  factual_synopsis_tamil?: string;
  chronological_timeline: TimelineEvent[];
  relief_sought_breakdown: string[];
  evidence_readiness_status: {
    ready_count: number;
    missing_count: number;
    ready: string[];
    missing: string[];
  };
  top_questions_for_advocate: string[];
  estimated_forum_and_process: string;
  advocate_notes_section: string;
  disclaimer: string;
}

export type LanguageMode = "en" | "ta";

export interface SavedCase {
  id: string;
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
  created_at?: string;
  updated_at?: string;
}

