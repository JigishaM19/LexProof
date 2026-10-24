from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ExtractedField(BaseModel):
    field_name: str
    extracted_value: Optional[str] = None
    confidence: float = 0.0
    bounding_box: Optional[List[float]] = None
    verified_value: Optional[str] = None
    mismatch_detected: bool = False
    is_user_confirmed: bool = False

class VerificationIndicator(BaseModel):
    category: str  # OCR, STRUCTURE, FORENSICS, QR_CODE, ISSUER
    status: str    # "VERIFIED", "POTENTIAL_ISSUE", "NEEDS_REVIEW", "UNABLE_TO_VERIFY", "NOT_CHECKED"
    summary: str
    evidence_details: List[str] = []
    source: str = "AI / Forensic Pipeline"

class VerificationRailResult(BaseModel):
    document_id: str
    rail_name: str
    status: str  # "VERIFIED", "ANALYSIS_COMPLETE", "PENDING", "NEEDS_REVIEW", "VERIFICATION_FAILED", "UNAVAILABLE"
    status_code: str  # "VERIFIED_ORIGIN_OK", "REGISTRY_OUT_OF_SCOPE", etc.
    verification_timestamp: datetime
    source_details: str
    matched_fields: Dict[str, str] = {}
    discrepancies: List[str] = []
    notes: str

class TamperRegion(BaseModel):
    id: str
    page: int = 1
    # Normalized bounding box [x, y, width, height] as percentage (0 to 100)
    bbox: List[float] = [0.0, 0.0, 0.0, 0.0]
    label: str  # e.g., "Font Inconsistency", "Pixel Splicing Artifact", "Metadata Doctoring", "Signature Anomaly"
    description: str
    confidence: float = 0.85
    severity: str = "HIGH"  # "LOW", "MEDIUM", "HIGH"

class DocumentRecord(BaseModel):
    id: str
    case_id: str
    user_id: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    file_hash_sha256: str
    storage_path: str
    doc_category: str = "EDUCATIONAL_CREDENTIAL"  # Degree, Transcript, Marksheet, Certificate
    status: str = "PROCESSED"  # PENDING, PROCESSING, PROCESSED, ERROR
    processing_stage: Optional[str] = "Completed"
    page_count: int = 1
    tamper_detected: bool = False
    tamper_score: float = 0.0  # 0.0 (Clean) to 1.0 (Highly Altered)
    tamper_regions: List[TamperRegion] = []
    storage_backend: str = "local"
    extracted_fields: Dict[str, ExtractedField] = {}
    indicators: List[VerificationIndicator] = []
    verification_result: Optional[VerificationRailResult] = None
    qr_data: Optional[Dict[str, Any]] = None
    forensic_notes: List[str] = []
    created_at: datetime
    updated_at: datetime


class CaseRecord(BaseModel):
    id: str
    user_id: str
    title: str
    purpose: str = "College Admission" # College Admission, Job Screening, Scholarship
    target_institution: Optional[str] = None
    status: str = "ACTIVE"
    document_ids: List[str] = []
    missing_documents: List[str] = []
    contradictions: List[str] = []
    duplicate_flags: List[str] = []
    overall_status: str = "ANALYSIS_COMPLETE" # One of 6 states
    created_at: datetime
    updated_at: datetime

class CaseCreate(BaseModel):
    title: str
    purpose: str = "College Admission"
    target_institution: Optional[str] = None

class CaseResponse(BaseModel):
    case: CaseRecord
    documents: List[DocumentRecord] = []
    summary_status: str = "READY"

class VerifyDocumentRequest(BaseModel):
    document_id: str
    institution_name: Optional[str] = None
    roll_number: Optional[str] = None
    candidate_name: Optional[str] = None
    passing_year: Optional[str] = None

class InstitutionRequest(BaseModel):
    institution_name: str
    state: str
    applicant_email: str
    notes: Optional[str] = None

class UpdateFieldsRequest(BaseModel):
    fields: Dict[str, str]

class CandidateEntry(BaseModel):
    candidate_name: str
    roll_number: str
    degree: Optional[str] = None
    passing_year: Optional[str] = None
    status: str = "PENDING"  # PENDING, VERIFIED, UNAVAILABLE
    rail_source: Optional[str] = None
    notes: Optional[str] = None

class BatchVerificationCreate(BaseModel):
    batch_title: str
    target_institution: str
    purpose: str = "Employment Verification"
    candidates: List[CandidateEntry] = []

class BatchVerificationRecord(BaseModel):
    id: str
    user_id: str
    organization_name: str
    batch_title: str
    target_institution: str
    purpose: str
    status: str = "IN_PROGRESS"  # IN_PROGRESS, COMPLETED, AUDITED
    total_candidates: int = 0
    verified_candidates: int = 0
    candidates: List[CandidateEntry] = []
    created_at: datetime
    updated_at: datetime


