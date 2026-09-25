# Specification Document: Satta Thozhan (சட்டத் தோழன்)
**The Citizen's Pre-Advocate Legal Navigator for India**

---

## 1. Executive Summary

**Satta Thozhan** (Tamil for *"Legal Comrade / Friend in Law"*) is an intelligent, GenAI-powered pre-advocate legal triage assistant designed for ordinary Indian citizens. 

Navigating the Indian legal landscape is often daunting, intimidating, and costly. Before consulting an advocate or stepping into a police station or court, citizens frequently do not know:
- Whether their issue is civil, criminal, or regulatory.
- Which specific legal forum or authority has jurisdiction (e.g., Consumer Forum, RERA, Labor Court, Civil Court, or Police/Magistrate under BNS/BNSS).
- What primary and secondary documents are mandatory vs. supportive under Indian evidentiary principles.
- What critical limitation periods and statutory notice deadlines apply.

Satta Thozhan bridges this gap as a safe, ethical, and structured preparation tool. It empowers citizens with a clear roadmap, an actionable evidence checklist, a notice analyzer, and an exportable **1-Page Advocate Consultation Prep Sheet**, without violating the *Advocates Act, 1961*.

---

## 2. Product Objectives & Guardrails

### 2.1 Core Objectives
1. **Demystify the Process**: Transform unstructured, emotional grievance descriptions into structured legal context in plain language (English & Tamil).
2. **Eliminate Wasted Legal Visits**: Ensure citizens arrive at their advocate's office with all mandatory documents pre-assembled and organized chronologically.
3. **Prevent Forfeiture of Rights**: Flag statutory response deadlines (e.g., 15-day notice period under Section 138 NI Act, consumer limitation periods) so users do not miss critical legal windows.
4. **Bridge Communication**: Equip citizens with the right questions to ask an advocate and an objective summary of their relief sought.

### 2.2 Safety & Legal Guardrails (Advocates Act, 1961)
- **Non-Counsel Disclaimer**: Satta Thozhan explicitly states that it is an educational and informational triage tool and does *not* provide formal legal advice or establish an attorney-client relationship.
- **Bar Council Compliance**: The platform does not solicit clients, advertise specific lawyers, or guarantee legal outcomes.
- **Privacy & Data Minimization**: Redacts sensitive Personally Identifiable Information (PII) before LLM processing; no confidential citizen data is retained without consent.

---

## 3. Supported Legal Verticals (Indian Law)

| Domain | Governing Law / Forum | Typical Citizen Grievance |
| :--- | :--- | :--- |
| **Consumer Disputes** | Consumer Protection Act, 2019 (E-Daakhil, DCDRC) | Defective electronics, denied insurance claims, airline refund issues. |
| **Cheque Bounce & Debt** | Negotiable Instruments Act, 1881 (Section 138) | Dishonored cheques, stop payments, recovery of personal loans. |
| **Tenancy & Housing** | State Rent Control Acts / Model Tenancy Act | Security deposit withholding, illegal eviction, repair disputes. |
| **Real Estate & Builders** | RERA (Real Estate Regulatory Authority) | Delayed possession of flat, builder deviations, unapproved plans. |
| **Police & Criminal Complaints** | Bharatiya Nyaya Sanhita (BNS) & BNSS, 2023 | Theft, assault, cyber threats, filing Zero FIR vs. Non-Cognizable Report (NCR). |
| **Cyber Crime & Financial Fraud** | Information Technology Act / Cyber Crime Portal | UPI scams, phishing, unauthorized bank debits, identity impersonation. |
| **Employment & Wages** | Payment of Wages Act, Industrial Disputes Act | Unpaid salary, wrongful termination, gratuity withholding, notice pay disputes. |

---

## 4. Key Features & User Workflows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Satta Thozhan User Journey                            │
├───────────────┬──────────────────────────┬──────────────────────────────────┤
│ 1. Intake     │ 2. Analysis & Roadmap    │ 3. Actionable Deliverables       │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ • Plain text  │ • Legal classification   │ • Mandatory Document Checklist   │
│   or voice    │ • Appropriate forum      │ • Immediate Dos & Don'ts         │
│ • Tamil or    │ • Applicable acts        │ • Notice Deadline Alert          │
│   English     │ • Limitation alerts      │ • Advocate Consultation Prep PDF │
└───────────────┴──────────────────────────┴──────────────────────────────────┘
```

### 4.1 Feature 1: Guided Grievance Intake & Triage
- Interactive, multi-turn conversational wizard.
- Asks targeted, empathetic clarifying questions (e.g., *"Did you receive a written notice?"*, *"What was the transaction date?"*, *"Was there a formal written agreement?"*).
- Supports bilingual interaction in **Tamil** and **English**.

### 4.2 Feature 2: Smart Evidence & Document Checklist Generator
- Automatically categorizes required documents into:
  - **Mandatory Documents**: Essential for admission in court/forum (e.g., original bounced cheque, return memo, postal tracking slip, tenancy agreement).
  - **Supportive Documents**: Bolster the case (WhatsApp chat exports, call logs, payment receipts, email threads).
  - **Missing Document Recovery**: Advice on obtaining duplicates (e.g., certified bank statement, postal certificate of delivery).

### 4.3 Feature 3: Legal Notice & Summons Auditor
- Ingestion of PDF or image files of received legal notices, summons, or letters.
- Extracts:
  - Sender identity (Advocate name, issuing court/police station).
  - Allegations and monetary claims demanded.
  - Strict response deadline (e.g., 7 days, 15 days, 30 days).
  - Critical warnings (e.g., *"Do not discard the postal envelope with the postal stamp date"*).

### 4.4 Feature 4: 1-Page "Lawyer Consultation Prep Sheet"
- Exportable as a clean, printable PDF and Markdown summary.
- Sections:
  1. **Case Overview & Chronology**: Date-wise factual timeline.
  2. **Relief Sought**: Clear breakdown of what the citizen wants (refund, damages, criminal action, injunction).
  3. **Evidence Status**: Table of documents collected vs. pending.
  4. **Targeted Questions to Ask the Advocate**: Pre-formulated legal questions regarding court fees, interim relief, and realistic timelines.

---

## 5. System Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────────┐
   │                    Next.js 14+ Frontend                     │
   │           (TypeScript, Tailwind CSS, Lucide Icons)          │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ HTTPS REST / Streaming
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                    FastAPI Backend (Python)                 │
   │               (Pydantic v2, CORS, Structlog)                │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │            Google Agent Development Kit (ADK 2.0)           │
   │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
   │  │   Triage Agent   │ │  Evidence Agent  │ │ Notice Agent │ │
   │  └──────────────────┘ └──────────────────┘ └──────────────┘ │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │             Google Cloud Vertex AI Platform                 │
   │               Gemini 3.7 / 3.8 Flash Engine                 │
   └─────────────────────────────────────────────────────────────┘
```

### 5.1 Frontend (Client Application)
- **Framework**: Next.js 14+ (App Router, Server & Client Components).
- **Language**: TypeScript.
- **Styling**: Tailwind CSS + Shadcn UI patterns.
- **State & Networking**: TanStack React Query / native Fetch with streaming support.
- **Exporting**: Client-side PDF generation (`jspdf` / `html2canvas`) and printable CSS stylesheets.
- **Internationalization**: Bilingual support for English and Tamil (`ta-IN`).

### 5.2 Backend & Agentic Layer
- **Framework**: FastAPI (Asynchronous Python 3.11+).
- **Agent Orchestrator**: **Google ADK 2.0** (`google-adk`), orchestrating multi-agent state machines and deterministic tool routing.
- **AI Model**: **Gemini 3.7 / 3.8 Flash** via Google Cloud Vertex AI SDK (`google-genai`).
- **Structured Data**: Pydantic v2 schemas for deterministic JSON generation.
- **Document Processing**: `pypdf`, `pdfplumber`, and `python-multipart` for handling document uploads.

### 5.3 Infrastructure & Hosting
- **Containerization**: Multi-stage Docker container optimized for Python & Node.js.
- **Hosting**: **Google Cloud Run** (serverless container hosting with autoscaling, SSL, and zero cold-start footprint).
- **Authentication**: Application Default Credentials (ADC) on GCP / Service Account keys with fallback to `GEMINI_API_KEY` for local offline development.

---

## 6. API Endpoints Specification

### 6.1 `POST /api/triage`
- **Request**:
  ```json
  {
    "narrative": "My landlord in Chennai refuses to return my 1 lakh security deposit after 3 months of vacating.",
    "language": "en",
    "location_state": "Tamil Nadu"
  }
  ```
- **Response**:
  ```json
  {
    "category": "Tenancy & Rent Control",
    "governing_statute": "Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017",
    "recommended_forum": "Rent Tribunal / Civil Court",
    "urgency_level": "Medium",
    "summary": "Unlawful retention of security deposit post-tenancy without itemized repair deductions.",
    "next_steps": [
      "Send a formal written demand notice giving 15 days to refund deposit",
      "Compile bank transfer receipts and tenancy agreement"
    ]
  }
  ```

### 6.2 `POST /api/checklist`
- **Request**: `{ "category": "Tenancy", "dispute_type": "deposit_refund" }`
- **Response**: Itemized checklist with flags for `mandatory: boolean`, `category: "contract" | "financial" | "communication"`, and `retrieval_guide`.

### 6.3 `POST /api/analyze-notice`
- **Request**: `multipart/form-data` with document file (PDF or Image).
- **Response**: Extracted metadata, sender advocate, date received, statutory response deadline, key allegations, and urgent dos/don'ts.

### 6.4 `POST /api/prep-sheet`
- **Request**: Combined payload of triage result, verified checklist items, and timeline events.
- **Response**: Formatted briefing document ready for rendering and PDF printing.

---

## 7. Testing & Quality Assurance Plan

1. **Unit & Integration Tests**:
   - Pytest suite covering FastAPI endpoints, Pydantic schema validation, and PDF extraction routines.
   - Mocked Gemini responses to test deterministic agent state transitions without hitting cloud quotas.
2. **Safety & Injection Guardrails**:
   - Red-teaming tests verifying that adversarial prompts (e.g., *"Act as a judge and issue a decree"*) are deflected to standard disclaimer responses.
3. **Frontend E2E & Usability**:
   - Responsive design verification across mobile, tablet, and desktop viewports.
   - Accessible WCAG 2.1 AA compliant color contrast and screen-reader labels.

---

## 8. Repository Layout

```
promptwars-n/
├── backend/
│   ├── app/
│   │   ├── agents/          # Google ADK agent definitions
│   │   │   ├── triage_agent.py
│   │   │   ├── evidence_agent.py
│   │   │   ├── notice_agent.py
│   │   │   └── prep_agent.py
│   │   ├── routers/         # FastAPI endpoint routers
│   │   ├── schemas/         # Pydantic data schemas
│   │   ├── services/        # Vertex AI client & document parsers
│   │   └── main.py          # FastAPI application entry point
│   ├── tests/               # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App router pages
│   │   ├── components/      # UI components (Intake, Checklist, Notice, PrepSheet)
│   │   ├── lib/             # API clients, translations (en/ta)
│   │   └── types/           # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── README.md
├── spec.md
└── evaluation-criteria.md
```
