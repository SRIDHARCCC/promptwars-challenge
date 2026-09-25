# ⚖️ Satta Thozhan (சட்டத் தோழன்)
### *The Citizen's Pre-Advocate Legal Navigator for India*

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2+-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Google ADK 2.0](https://img.shields.io/badge/Agent_Framework-Google_ADK_2.0-4285F4?logo=google&logoColor=white)](https://pypi.org/project/google-adk/)
[![Gemini Flash](https://img.shields.io/badge/LLM-Gemini_Flash-FF6F00?logo=google-cloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Executive Summary

Before approaching an advocate or police station, the average Indian citizen is typically intimidated by complex legalese, unaware of strict statutory limitation periods (e.g. 30 days under Section 138 NI Act), unprepared with mandatory evidence, and vulnerable to extortion or delayed justice.

**Satta Thozhan (சட்டத் தோழன்)** — meaning *"Legal Comrade / Friend in Law"* — is an AI-powered legal triage, evidence preparation, and notice audit platform. It empowers citizens to understand their rights under Indian Law, organize court-admissible evidence according to the **Bharatiya Sakshya Adhiniyam, 2023 (BSA)**, audit notices received from opponents, and generate a structured **1-Page Advocate Consultation Briefing** before their first legal appointment.

> **Statutory Disclaimer (Advocates Act, 1961):**
> *Satta Thozhan is an informational and triage utility designed to assist citizens in preparing for legal consultations. It does NOT provide certified legal representation or establish an advocate-client relationship.*

---

## 🏗️ Architecture & Technology Stack

```mermaid
graph TD
    User["Citizen / Common Man (Web / Mobile)"] --> NextJS["Next.js 14 UI (Bilingual: English / தமிழ்)"]
    NextJS --> FastAPI["FastAPI Gateway (Port 8000)"]
    
    subgraph "Backend Intelligence Core"
        FastAPI --> ADK["Google Agent Development Kit (ADK 2.0)"]
        FastAPI --> DocParser["PDF/Notice Parser & PII Anonymizer"]
        
        ADK --> TriageAgent["Legal Triage Agent<br/>(BNS, BNSS, Consumer, 138 NI Act, Tenancy)"]
        ADK --> EvidenceAgent["Evidence Checklist Agent<br/>(BSA 2023 Rules, Primary vs Secondary)"]
        ADK --> NoticeAgent["Notice & Summons Auditor<br/>(Strict Deadlines, Claim Extraction)"]
        ADK --> PrepSheetAgent["1-Page Briefing Sheet Compiler<br/>(Chronology, Relief, 5 Strategic Questions)"]
        
        TriageAgent --> Gemini["Gemini Flash (Vertex AI / GenAI API)"]
        EvidenceAgent --> Gemini
        NoticeAgent --> Gemini
        PrepSheetAgent --> Gemini
    end
    
    subgraph "Deployment (Google Cloud)"
        CloudRun["Google Cloud Run (Serverless Containers)"]
    end
```

### Stack Highlights
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Print-friendly CSS.
- **Backend API**: FastAPI, Pydantic v2, Python 3.11+.
- **AI Agent Framework**: **Google ADK 2.0** (`google-adk==2.10.0`).
- **Foundation LLM**: **Gemini 3.8 / 3.7 / 2.5 Flash** via Google GenAI SDK and Google Cloud Vertex AI with graceful resilient fallbacks.
- **Privacy & Security**: Automated PII masking for Indian identity artifacts (Aadhaar 12-digit, PAN card, Credit/Debit cards, Phone numbers).
- **Deployment**: Multi-stage Docker containers configured for **Google Cloud Run**.

---

## 🚀 Key Features

### 1. 🔍 Grievance Triage & Forum Navigator
- Ingests citizen grievances in conversational English or Tamil.
- Classifies into Indian legal domains:
  - **Consumer Disputes** (Consumer Protection Act, 2019 / E-Daakhil)
  - **Cheque Bounce & Debt Recovery** (Section 138 Negotiable Instruments Act)
  - **Tenancy & Housing** (State Rent Control Acts / Model Tenancy Act)
  - **Cyber Crime & Financial Fraud** (IT Act / 1930 Helpline / cybercrime.gov.in)
  - **Police & Criminal Complaints** (Bharatiya Nyaya Sanhita - BNS & BNSS, 2023)
  - **Employment & Wages** (Payment of Wages Act, Industrial Disputes Act)
- Highlights **Statutory Limitation Deadlines** and gives actionable **DOs and DON'Ts**.

### 2. 📋 Interactive Evidence Checklist (BSA 2023 Grounded)
- Classifies documents into **Mandatory** (required for admission) vs. **Supportive**.
- Tags evidentiary value under the **Bharatiya Sakshya Adhiniyam, 2023 (BSA)**.
- Informs citizens about **Section 63 BSA Certificates** required for electronic evidence (WhatsApp chats, emails, PDFs).
- Real-time Document Readiness Tracker (% progress).

### 3. 📜 Notice & Court Summons Auditor
- Ingests uploaded PDF legal notices or pasted text.
- Extracts sender details, monetary demands, and **statutory response deadlines** (e.g. 15-day Section 138 notice, 30-day court summons).
- Provides urgent dos and don'ts (e.g., retaining the postal envelope for date-stamp proof of service).

### 4. 📄 1-Page Advocate Consultation Prep Sheet
- Compiles an executive summary for the citizen to carry into their advocate's office.
- Contains:
  - Factual synopsis (in English & Tamil)
  - Chronological sequence of events
  - Precise relief sought
  - Document readiness status
  - **Top 5 Strategic Questions** to ask the advocate (limitation, jurisdiction, court fees, interim relief)
  - Advocate's office notes box
- One-click print / PDF export (`@media print` optimized).

---

## 🏆 Evaluation Criteria Alignment

| Evaluation Dimension | Weight / Impact | How Satta Thozhan Addresses It |
|---|---|---|
| **Technical Innovation** | **High** | Built using **Google ADK 2.0** multi-agent architecture; leverages **Gemini Flash** with structured Pydantic output schemas; incorporates dual-mode Vertex AI / GenAI client with zero-downtime offline fallbacks; Indian Evidence law (BSA 2023) procedural rule modeling. |
| **Potential Impact** | **High** | Targets 1.4 billion Indian citizens; bridges the intimidating gap between grievance occurrence and legal consultation; prevents loss of legal rights due to expired limitation periods. |
| **Execution Quality** | **High** | End-to-end working system; bilingual support (English & Tamil); clean modular code with 100% passing test coverage; built-in automated PII redaction for Aadhaar and PAN numbers. |
| **Business Feasibility** | **High** | Serverless containerized deployment on Google Cloud Run with zero idle cost; low token consumption using Gemini Flash; highly responsive API. |

---

## 💻 Local Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ (Node 20 or 24 recommended)
- Git

### 1. Clone & Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend unit tests
pytest ../backend/tests

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 2. Set Up & Run Frontend

In a new terminal:
```bash
cd frontend

# Install packages
npm install

# Build for production (verifies TypeScript & ESLint)
npm run build

# Start the local development server
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**.

---

## 🐳 Docker & Container Deployment

### Running locally with Docker Compose:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

### Deploying to Google Cloud Run:
```bash
# Set your Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# Deploy Backend to Cloud Run
gcloud run deploy satta-thozhan-backend \
    --source ./backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="DEFAULT_MODEL=gemini-2.5-flash,GOOGLE_CLOUD_LOCATION=us-central1"

# Deploy Frontend to Cloud Run
gcloud run deploy satta-thozhan-frontend \
    --source ./frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="NEXT_PUBLIC_API_URL=https://satta-thozhan-backend-[hash].run.app"
```

---

## 🔒 Security & Privacy Features
- **No PII Transmission**: Automated regex masking of 12-digit Indian Aadhaar numbers, 10-character PAN identifiers, and 16-digit financial cards before any prompt leaves the application boundary.
- **Statutory Guardrails**: Clear, persistent disclaimers ensuring compliance with the *Advocates Act, 1961* and Bar Council of India guidelines.
- **CORS & Environment Controls**: Strictly configured origin headers and credential management.

---

## 📜 License
Released under the [MIT License](LICENSE). Built for the AI Hackathon 2026.
