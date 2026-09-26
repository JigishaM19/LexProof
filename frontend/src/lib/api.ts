const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface User {
  id: string;
  email: string;
  full_name: string;
  mobile?: string;
  role: string;
  user_type: string;
  institution?: string;
  course?: string;
  branch?: string;
  academic_year?: string;
  enrollment_id?: string;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface OtpResponse {
  status: string;
  message: string;
  expires_in_minutes?: number;
  cooldown_seconds?: number;
  channel?: string;
  delivered_externally?: boolean;
  delivery_notes?: string;
  debug_code?: string;
  identifier?: string;
  verified?: boolean;
}

export interface VerificationRailResult {
  document_id: string;
  rail_name: string;
  status: string;
  status_code: string;
  verification_timestamp: string;
  source_details: string;
  matched_fields: Record<string, string>;
  discrepancies: string[];
  notes: string;
}

export interface ExtractedField {
  field_name: string;
  extracted_value?: string;
  confidence: number;
  mismatch_detected?: boolean;
  is_user_confirmed?: boolean;
}

export interface VerificationIndicator {
  category: string;
  status: string;
  summary: string;
  evidence_details: string[];
  source: string;
}

export interface DocumentRecord {
  id: string;
  case_id: string;
  user_id: string;
  original_filename: string;
  file_type: string;
  file_size_bytes: number;
  file_hash_sha256: string;
  doc_category: string;
  status: string;
  extracted_fields: Record<string, ExtractedField>;
  indicators: VerificationIndicator[];
  verification_result?: VerificationRailResult;
  forensic_notes: string[];
  created_at: string;
  updated_at: string;
}

export interface CaseRecord {
  id: string;
  user_id: string;
  title: string;
  purpose: string;
  target_institution?: string;
  status: string;
  document_ids: string[];
  missing_documents: string[];
  contradictions: string[];
  duplicate_flags: string[];
  overall_status: string;
  created_at: string;
  updated_at: string;
}

export interface CaseDetailResponse {
  case: CaseRecord;
  documents: DocumentRecord[];
  summary_status: string;
}

export interface CaseReportResponse {
  report_id: string;
  generated_at: string;
  case: CaseRecord;
  documents: DocumentRecord[];
  dossier_hash: string;
  overall_status: string;
  audit_trail: Array<{ action: string; timestamp: string; actor: string }>;
  scope_notice: string;
}

class ApiClient {
  public baseUrl = API_BASE;

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("LexProof_token");
    }
    return null;
  }

  public isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("LexProof_token");
      return !!token && token.trim().length > 0;
    }
    return false;
  }

  public syncCookie() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("LexProof_token");
      if (token && !document.cookie.includes("LexProof_token=")) {
        document.cookie = `LexProof_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
      }
    }
  }

  public setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("LexProof_token", token);
      document.cookie = `LexProof_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
      window.dispatchEvent(new Event("lexproof-auth-change"));
    }
  }

  public clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("LexProof_token");
      localStorage.removeItem("LexProof_user");
      document.cookie = "LexProof_token=; path=/; max-age=0; SameSite=Lax";
      window.dispatchEvent(new Event("lexproof-auth-change"));
    }
  }

  public getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("LexProof_user");
      if (u) {
        try {
          return JSON.parse(u);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  public setCurrentUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("LexProof_user", JSON.stringify(user));
      window.dispatchEvent(new Event("lexproof-auth-change"));
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = "An error occurred";
      try {
        const errData = await res.json();
        errorMsg = errData.detail || errData.message || errorMsg;
      } catch {
        errorMsg = `Server returned status ${res.status}`;
      }
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  }

  // Auth Methods
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    this.setToken(data.access_token);
    this.setCurrentUser(data.user);
    return data;
  }

  async logout(): Promise<{ status: string; message: string }> {
    try {
      const res = await this.request<{ status: string; message: string }>("/auth/logout", {
        method: "POST",
      });
      return res;
    } finally {
      this.clearToken();
    }
  }

  async register(userData: Record<string, any>): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async sendOtp(identifier: string, purpose: string = "REGISTRATION", channel?: string): Promise<OtpResponse> {
    return this.request<OtpResponse>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ identifier, purpose, channel }),
    });
  }

  async resendOtp(identifier: string, purpose: string = "REGISTRATION", channel?: string): Promise<OtpResponse> {
    return this.request<OtpResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ identifier, purpose, channel }),
    });
  }

  async verifyOtp(identifier: string, otp: string, purpose: string = "REGISTRATION"): Promise<OtpResponse> {
    return this.request<OtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ identifier, otp, purpose }),
    });
  }

  async forgotPassword(email: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, otp: string, new_password: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, new_password }),
    });
  }

  async getGoogleAuthUrl(redirect: string = "/dashboard"): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/auth/google/url?redirect=${encodeURIComponent(redirect)}`);
  }

  async getMe(): Promise<User> {
    const user = await this.request<User>("/auth/me");
    this.setCurrentUser(user);
    return user;
  }

  // Cases Methods
  async listCases(): Promise<CaseRecord[]> {
    return this.request<CaseRecord[]>("/cases");
  }

  async createCase(title: string, purpose: string, target_institution?: string): Promise<CaseRecord> {
    return this.request<CaseRecord>("/cases", {
      method: "POST",
      body: JSON.stringify({ title, purpose, target_institution }),
    });
  }

  async getCase(caseId: string): Promise<CaseDetailResponse> {
    return this.request<CaseDetailResponse>(`/cases/${caseId}`);
  }

  async deleteCase(caseId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cases/${caseId}`, {
      method: "DELETE",
    });
  }

  async getCaseReport(caseId: string): Promise<CaseReportResponse> {
    return this.request<CaseReportResponse>(`/cases/${caseId}/report`);
  }

  // Document Upload & Operations
  async uploadDocument(file: File, caseId?: string): Promise<DocumentRecord> {
    const formData = new FormData();
    formData.append("file", file);
    if (caseId) {
      formData.append("case_id", caseId);
    }
    return this.request<DocumentRecord>("/documents/upload", {
      method: "POST",
      body: formData,
    });
  }

  async getDocument(docId: string): Promise<DocumentRecord> {
    return this.request<DocumentRecord>(`/documents/${docId}`);
  }

  getDocumentFileUrl(docId: string): string {
    return `${API_BASE}/documents/${docId}/file`;
  }

  async deleteDocument(docId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/documents/${docId}`, {
      method: "DELETE",
    });
  }

  async updateDocumentFields(docId: string, fields: Record<string, string>): Promise<DocumentRecord> {
    return this.request<DocumentRecord>(`/documents/${docId}/fields`, {
      method: "PATCH",
      body: JSON.stringify(fields),
    });
  }

  // Authoritative Verification Rail Trigger
  async verifyDocument(params: {
    document_id: string;
    institution_name?: string;
    roll_number?: string;
    candidate_name?: string;
    passing_year?: string;
  }): Promise<DocumentRecord> {
    return this.request<DocumentRecord>("/verification/verify-document", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Verification Coverage & Requests
  async getCoverage(query?: string): Promise<any> {
    const qs = query ? `?query=${encodeURIComponent(query)}` : "";
    return this.request(`/verification/coverage${qs}`);
  }

  async requestInstitution(payload: {
    institution_name: string;
    state: string;
    applicant_email: string;
    notes?: string;
  }): Promise<{ message: string; request_id: number }> {
    return this.request<{ message: string; request_id: number }>("/verification/request-institution", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();


