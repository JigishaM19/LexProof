const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name: string;
  country_code?: string;
  mobile?: string;
  role: "ADMIN" | "USER" | string;
  user_type: string;
  country_id?: string;
  country_name?: string;
  state_id?: string;
  state_name?: string;
  district_id?: string;
  district_name?: string;
  subdistrict_id?: string;
  subdistrict_name?: string;
  city_id?: string;
  city_name?: string;
  pincode?: string;
  masked_aadhaar?: string;
  masked_abha?: string;
  student_id_type?: string;
  student_id_type_other?: string;
  student_id_number?: string;
  institution_id?: string;
  institution_name?: string;
  custom_institution_name?: string;
  institution?: string;
  course_id?: string;
  course_name?: string;
  custom_course_name?: string;
  course?: string;
  branch_id?: string;
  branch_name?: string;
  custom_branch_name?: string;
  branch?: string;
  academic_year?: string;
  academic_semester?: string;
  academic_status?: string;
  academic_status_other?: string;
  enrollment_id?: string;
  is_email_verified?: boolean;
  is_mobile_verified?: boolean;
  is_verified: boolean;
  is_demo_account?: boolean;
  auth_provider?: string;
  account_status?: string;
  created_at: string;
  last_login?: string;
}

export interface Country {
  id: string;
  name: string;
  calling_code: string;
  iso3?: string;
  has_states: boolean;
  postal_label: string;
  postal_regex?: string;
}

export interface State {
  id: string;
  country_id: string;
  name: string;
  code?: string;
  lgd_code?: number;
  admin_type: string;
}

export interface District {
  id: string;
  state_id: string;
  country_id: string;
  name: string;
  headquarters?: string;
  lgd_code?: number;
}

export interface Subdistrict {
  id: string;
  code: number;
  version?: number;
  name: string;
  name_local?: string | null;
  district_id: string;
  district_code: number;
  district_name: string;
  state_id: string;
  state_code?: number;
  country_id: string;
  census_2001_code?: string | null;
  census_2011_code?: string | null;
  admin_type?: string;
}

export interface City {
  id: string;
  district_id: string;
  state_id: string;
  country_id: string;
  name: string;
  taluka?: string;
  default_pincode?: string;
  admin_type: string;
}

export interface PostalCodeValidation {
  pincode: string;
  is_valid: boolean;
  state_id?: string;
  state_name?: string;
  district_id?: string;
  district_name?: string;
  city_name?: string;
  office_name?: string;
  offices?: Array<{ office_name?: string; office_type?: string }>;
  message: string;
}

export interface Institution {
  id: string;
  name: string;
  country_id: string;
  state_id: string;
  district_id?: string;
  city_id?: string;
  institution_type: string;
  aishe_code?: string;
  is_autonomous: boolean;
  supported_course_ids?: string[];
}

export interface Course {
  id: string;
  name: string;
  short_name?: string;
  category: string;
  duration_years: number;
  total_semesters: number;
  is_annual_system: boolean;
  year_options: string[];
  semester_options: string[];
  branches?: Branch[];
}

export interface Branch {
  id: string;
  course_id: string;
  name: string;
  short_name?: string;
  code?: string;
}

export interface AcademicStructure {
  course_id: string;
  course_name: string;
  duration_years: number;
  is_annual_system: boolean;
  year_options: string[];
  semester_options: string[];
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

export interface TamperRegion {
  id: string;
  page: number;
  bbox: [number, number, number, number]; // [x, y, width, height] in percentage (0 to 100)
  label: string;
  description: string;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
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
  status: "PENDING" | "PROCESSING" | "PROCESSED" | "ERROR" | string;
  processing_stage?: string;
  page_count?: number;
  tamper_detected?: boolean;
  tamper_score?: number;
  tamper_regions?: TamperRegion[];
  storage_backend?: string;
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

export interface ContactInquiryCreate {
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
}

export interface ContactInquiryResponse {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  status: string;
  user_id?: string;
  created_at: string;
}

export interface CandidateEntry {
  candidate_name: string;
  roll_number: string;
  degree?: string;
  passing_year?: string;
  status: string;
  rail_source?: string;
  notes?: string;
}

export interface BatchVerificationCreate {
  batch_title: string;
  target_institution: string;
  purpose?: string;
  candidates: CandidateEntry[];
}

export interface BatchVerificationRecord {
  id: string;
  user_id: string;
  organization_name: string;
  batch_title: string;
  target_institution: string;
  purpose: string;
  status: string;
  total_candidates: number;
  verified_candidates: number;
  candidates: CandidateEntry[];
  created_at: string;
  updated_at: string;
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
  async uploadDocument(file: File, caseId?: string, asyncMode?: boolean): Promise<DocumentRecord> {
    const formData = new FormData();
    formData.append("file", file);
    if (caseId) {
      formData.append("case_id", caseId);
    }
    if (asyncMode !== undefined) {
      formData.append("async_mode", String(asyncMode));
    }
    return this.request<DocumentRecord>("/documents/upload", {
      method: "POST",
      body: formData,
    });
  }

  async getDocument(docId: string): Promise<DocumentRecord> {
    return this.request<DocumentRecord>(`/documents/${docId}`);
  }

  async getDocumentStatus(docId: string): Promise<{
    id: string;
    status: string;
    processing_stage: string;
    tamper_detected: boolean;
    tamper_score: number;
    tamper_regions: TamperRegion[];
    page_count: number;
    indicators: VerificationIndicator[];
    extracted_fields: Record<string, ExtractedField>;
    updated_at: string;
  }> {
    return this.request(`/documents/${docId}/status`);
  }

  async reprocessDocument(docId: string, asyncMode: boolean = true): Promise<{
    message: string;
    document_id: string;
    status: string;
    processing_stage?: string;
  }> {
    return this.request(`/documents/${docId}/reprocess?async_mode=${asyncMode}`, {
      method: "POST",
    });
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

  // Demo Login
  async demoLogin(role: string = "USER"): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    this.setToken(data.access_token);
    this.setCurrentUser(data.user);
    return data;
  }

  // Location APIs
  async getCountries(): Promise<Country[]> {
    return this.request<Country[]>("/locations/countries");
  }

  async getStates(countryId: string = "IN"): Promise<State[]> {
    return this.request<State[]>(`/locations/states?countryId=${encodeURIComponent(countryId)}`);
  }

  async getDistricts(stateId: string): Promise<District[]> {
    return this.request<District[]>(`/locations/districts?stateId=${encodeURIComponent(stateId)}`);
  }

  async getSubdistricts(districtId: string): Promise<Subdistrict[]> {
    return this.request<Subdistrict[]>(`/locations/subdistricts?districtId=${encodeURIComponent(districtId)}`);
  }

  async getCities(districtId: string): Promise<City[]> {
    return this.request<City[]>(`/locations/cities?districtId=${encodeURIComponent(districtId)}`);
  }

  async validatePostalCode(pincode: string, countryId: string = "IN"): Promise<PostalCodeValidation> {
    return this.request<PostalCodeValidation>(
      `/locations/postal-codes?pincode=${encodeURIComponent(pincode)}&countryId=${encodeURIComponent(countryId)}`
    );
  }

  // Academic APIs
  async getInstitutions(params?: {
    stateId?: string;
    districtId?: string;
    cityId?: string;
    countryId?: string;
    q?: string;
    limit?: number;
  }): Promise<{ institutions: Institution[]; allow_custom: boolean; custom_label: string }> {
    const qp = new URLSearchParams();
    if (params?.stateId) qp.set("stateId", params.stateId);
    if (params?.districtId) qp.set("districtId", params.districtId);
    if (params?.cityId) qp.set("cityId", params.cityId);
    if (params?.countryId) qp.set("countryId", params.countryId);
    if (params?.q) qp.set("q", params.q);
    if (params?.limit) qp.set("limit", String(params.limit));
    const qs = qp.toString() ? `?${qp.toString()}` : "";
    return this.request<{ institutions: Institution[]; allow_custom: boolean; custom_label: string }>(
      `/academic/institutions${qs}`
    );
  }

  async getCourses(params?: {
    institutionId?: string;
    q?: string;
    limit?: number;
  }): Promise<{ courses: Course[]; allow_custom: boolean; custom_label: string }> {
    const qp = new URLSearchParams();
    if (params?.institutionId) qp.set("institutionId", params.institutionId);
    if (params?.q) qp.set("q", params.q);
    if (params?.limit) qp.set("limit", String(params.limit));
    const qs = qp.toString() ? `?${qp.toString()}` : "";
    return this.request<{ courses: Course[]; allow_custom: boolean; custom_label: string }>(
      `/academic/courses${qs}`
    );
  }

  async getBranches(params: {
    courseId: string;
    institutionId?: string;
    q?: string;
    limit?: number;
  }): Promise<{ branches: Branch[]; allow_custom: boolean; custom_label: string }> {
    const qp = new URLSearchParams();
    qp.set("courseId", params.courseId);
    if (params.institutionId) qp.set("institutionId", params.institutionId);
    if (params.q) qp.set("q", params.q);
    if (params.limit) qp.set("limit", String(params.limit));
    return this.request<{ branches: Branch[]; allow_custom: boolean; custom_label: string }>(
      `/academic/branches?${qp.toString()}`
    );
  }

  async getAcademicStructure(params: {
    courseId: string;
    institutionId?: string;
  }): Promise<AcademicStructure> {
    const qp = new URLSearchParams();
    qp.set("courseId", params.courseId);
    if (params.institutionId) qp.set("institutionId", params.institutionId);
    return this.request<AcademicStructure>(`/academic/structure?${qp.toString()}`);
  }

  // Contact Inquiries
  async submitContactInquiry(inquiry: ContactInquiryCreate): Promise<ContactInquiryResponse> {
    return this.request<ContactInquiryResponse>("/contact/inquiry", {
      method: "POST",
      body: JSON.stringify(inquiry),
    });
  }

  async listContactInquiries(limit: number = 50): Promise<ContactInquiryResponse[]> {
    return this.request<ContactInquiryResponse[]>(`/contact/inquiries?limit=${limit}`);
  }

  // Organization Batch Verifications
  async createBatchVerification(batch: BatchVerificationCreate): Promise<BatchVerificationRecord> {
    return this.request<BatchVerificationRecord>("/verification/batches", {
      method: "POST",
      body: JSON.stringify(batch),
    });
  }

  async listBatchVerifications(): Promise<BatchVerificationRecord[]> {
    return this.request<BatchVerificationRecord[]>("/verification/batches");
  }

  async getBatchVerification(batchId: string): Promise<BatchVerificationRecord> {
    return this.request<BatchVerificationRecord>(`/verification/batches/${batchId}`);
  }
}

export const api = new ApiClient();


