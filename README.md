# LexProof — AI-Powered Educational Document Intelligence & Verification

> **Authoritative Educational Verification & Non-Custodial Document Forensics Platform**  
> Verifying academic credentials, certificates, and institutional records using authoritative rails and AI document forensics.

---

## 1. Project Overview

**LexProof** is an educational document intelligence and verification platform engineered for students, educational institutions, universities, and verification agencies. It provides cryptographic validation, multi-modal OCR extraction, and authoritative registry queries to establish trust in educational credentials while ensuring non-custodial data protection and compliance with institutional standards.

The platform bridges document forensics with official verification rails (including DigiLocker and direct university registries such as Savitribai Phule Pune University) to automate the verification of degrees, marksheet transcripts, and provisional certificates.

---

## 2. Key Features

- **Multi-Role Workspaces**:
  - **Individual Workspace**: For students and candidates to manage document dossiers, review extracted fields, track verification statuses, and download verification dossiers.
  - **Organization Workspace**: For universities, colleges, and verification agencies to perform batch audits, manage candidate records, and view analytical fraud detection insights.
- **Robust Multi-Modal Authentication**:
  - Secure Email/Password registration with Argon2id cryptographic password hashing.
  - 6-digit Time-Based and HMAC-verified OTP delivery via Resend (Email) and Twilio (SMS).
  - Production-grade Google OAuth 2.0 / OpenID Connect single sign-on.
  - Role-based access control (RBAC) enforced via Next.js Edge middleware and FastAPI dependency injection.
  - Session revocation and cryptographic token invalidation.
- **Document Forensics & AI Extraction**:
  - High-precision text and tabular data extraction from PDF marksheets, scanned diplomas, and docx certificates.
  - Integration with Google Gemini Vision intelligence and PyMuPDF / OpenCV document processing pipelines.
  - Discrepancy detection, name mismatch heuristics, roll number validation, and cross-field consistency checks.
- **Authoritative Verification Rails**:
  - Integration framework for official government verification rails (DigiLocker / API Setu).
  - Automated issuer registry query simulations for institutional verification.
  - Tamper-evident dossier hashing (SHA-256) for audit trails and verification receipts.
- **Multilingual Localization**:
  - Complete internationalization (i18n) supporting **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

---

## 3. Technology Stack

### Frontend Architecture
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: `next-themes` (Dark / Light mode support)
- **Client Networking**: Custom typed API client with JWT storage and Cookie synchronization

### Backend Architecture
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Async driver via `motor` and `pymongo`)
- **Password Hashing**: `argon2-cffi` (Argon2id)
- **Token Security**: `pyjwt` (HS256 with cryptographic payload signing)
- **AI & Document Intelligence**: `google-genai` (Gemini API), `pymupdf` (PyMuPDF), `opencv-python-headless`, `Pillow`
- **Email & Communications**: [Resend](https://resend.com/) API client, Twilio SDK

---

## 4. Project Structure

```
lexProof/
├── .env.example              # Centralized environment variable template
├── .gitignore                # Comprehensive Git ignore rules (secrets, venvs, builds)
├── README.md                 # Complete project documentation
├── backend/                  # FastAPI Application
│   ├── .env.example          # Backend-specific environment template
│   ├── main.py               # Application entrypoint & CORS configuration
│   ├── requirements.txt      # Python dependencies
│   ├── storage/              # Local file storage (uploads ignored in git)
│   │   └── uploads/
│   │       └── .gitkeep
│   └── app/
│       ├── api/              # API route handlers
│       │   ├── auth.py       # Authentication & OAuth endpoints
│       │   ├── cases.py      # Verification dossiers / cases
│       │   ├── contact.py    # Inquiries and contact forms
│       │   ├── deps.py       # Security dependencies & RBAC checkers
│       │   ├── documents.py  # Upload, OCR parsing & file deletion
│       │   └── verification.py # Verification rails execution
│       ├── core/             # Application core modules
│       │   ├── config.py     # Pydantic BaseSettings management
│       │   ├── database.py   # Motor Async MongoDB client & indexes
│       │   └── security.py   # Argon2id, JWT encode/decode, HMAC OTP hashing
│       ├── models/           # Pydantic schemas and database models
│       │   ├── case.py
│       │   ├── document.py
│       │   └── user.py
│       └── services/         # Business logic services
│           ├── auth_service.py # User registration, login, Google identity
│           ├── extractor_service.py # OCR, PDF extraction, Gemini intelligence
│           ├── otp_service.py  # OTP dispatch, cooldowns, and verification
│           └── verification_service.py # Rail validation logic
└── frontend/                 # Next.js Application
    ├── package.json          # Node dependencies and scripts
    ├── next.config.ts        # Next.js configuration
    ├── tsconfig.json         # TypeScript compiler configuration
    └── src/
        ├── middleware.ts     # Edge routing & JWT authorization checks
        ├── app/              # Next.js App Router pages
        │   ├── layout.tsx    # Root layout & theme providers
        │   ├── page.tsx      # Landing page
        │   ├── login/        # Sign in & Google OAuth handler
        │   ├── register/     # Registration & OTP verification flow
        │   ├── forgot-password/ # Password recovery
        │   ├── individual/   # Student / Individual workspace
        │   ├── organization/ # Institutional audit workspace
        │   └── verification/ # Verification rail explorer & coverage
        ├── components/       # Shared UI components & navigation bars
        │   ├── layout/       # Navbar, Footer
        │   └── workspace/    # IndividualNavbar, OrganizationNavbar
        ├── lib/              # Core client libraries
        │   ├── api.ts        # Type-safe API client
        │   └── i18n.tsx      # Multi-language internationalization context
        └── locales/          # Translation dictionaries (en, hi, mr)
```

---

## 5. Authentication Architecture

LexProof enforces defense-in-depth security:
1. **Password Authentication**: Passwords hashed with `Argon2id` (memory-hard, resistant to GPU attacks).
2. **OTP Verification**: Dispatched via Resend or SMS; hashed using `HMAC-SHA256` with salt before database persistence. Plaintext OTPs are never stored.
3. **Google OAuth 2.0**: Implements full PKCE/State-verified authorization code flow. Exchanged tokens retrieve verified Google profile metadata to automatically provision or link user accounts.
4. **JWT Session Management**: Tokens signed with HS256Application secrets, containing claims (`sub`, `email`, `role`, `session_id`, `exp`). Active session IDs are verifiable against database revocation lists.
5. **Next.js Middleware**: Edge-runtime middleware validates JWT claims and enforces strict route boundaries between Individual and Organization workspaces.

---

## 6. Document Analysis & Verification Workflow

1. **Upload & Ingestion**: Educational documents (PDF/JPG/PNG) are validated for MIME type and file size limits (default: 25MB max).
2. **Pre-Processing & Extraction**: PyMuPDF and OCR pipelines extract text layers, marks, roll numbers, institutions, and candidate identities.
3. **AI Forensics**: Google Gemini intelligence inspects structural integrity, checks for conflicting or tampered fields, and normalizes marks.
4. **Authoritative Rails**: The document metadata is mapped against connected registry rails (or mock rail engines in sandbox mode) to verify legitimacy.
5. **Dossier & Audit Trail**: A SHA-256 hash of the verification payload is recorded in the permanent audit trail.

---

## 7. Environment Setup

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **Python**: v3.10+ (Python 3.11 / 3.12 recommended)
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI
- **Redis** *(Optional)*: Local Redis (`redis://localhost:6379`) or Upstash Redis

### Environment Variables
1. Copy the template in the root directory or respective subdirectories:
   ```bash
   # In backend directory
   cp .env.example .env

   # In frontend directory
   cp .env.example .env.local
   ```
2. Configure your credentials in `backend/.env` (Google OAuth Client ID/Secret, Gemini API Key, Resend API Key).

---

## 8. How to Run Locally

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
# Windows (Service or executable)
net start MongoDB
# Or via mongod CLI
mongod --dbpath <data-path>
```

### 2. Setup & Run Backend (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# (Linux / macOS: source venv/bin/activate)

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will be available at [http://localhost:8000](http://localhost:8000) (Interactive Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)).

### 3. Setup & Run Frontend (Next.js)
```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```
The Next.js frontend will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 9. Important Security Notes

- **Secrets Management**: Never commit `.env` or configuration files containing live API keys or database connection strings. All `.env` and credential files are strictly ignored via `.gitignore`.
- **Session Revocation**: Logging out revokes active session records in the database, invalidating the session ID immediately.
- **Upload Isolation**: Uploaded candidate documents are stored in designated local upload directories or cloud object storage and are excluded from version control.
- **Non-Custodial Design**: Government gateway credentials (such as DigiLocker PINs or Aadhaar numbers) are never stored or logged on LexProof servers.

---

## 10. License

This project is developed and maintained for educational document integrity and verification. All rights reserved.
