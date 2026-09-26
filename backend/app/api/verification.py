from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any, Optional
from app.models.case import VerifyDocumentRequest, InstitutionRequest, DocumentRecord
from app.services.document_service import DocumentService, documents_db

router = APIRouter(prefix="/verification", tags=["Verification"])

institution_requests_db: List[Dict[str, Any]] = []

@router.get("/coverage")
async def get_verification_coverage(query: Optional[str] = None) -> Dict[str, Any]:
    all_issuers = [
        {
            "id": "sppu-mh",
            "name": "Savitribai Phule Pune University (SPPU)",
            "state": "Maharashtra",
            "status": "Supported",
            "rail_type": "Direct Digital Ledger Rail Available",
            "supported_documents": ["Degree Certificate", "Passing Certificate", "Marksheet"]
        },
        {
            "id": "uom-mh",
            "name": "University of Mumbai (Engineering & Science)",
            "state": "Maharashtra",
            "status": "Supported",
            "rail_type": "Degree Registry Connected",
            "supported_documents": ["Degree Certificate", "Provisional Certificate", "Transcript"]
        },
        {
            "id": "msbte-mh",
            "name": "Maharashtra State Board of Technical Education (MSBTE)",
            "state": "Maharashtra",
            "status": "Supported",
            "rail_type": "Polytechnic Verification Active",
            "supported_documents": ["Polytechnic Diploma", "Provisional Passing Certificate"]
        },
        {
            "id": "rtmnu-mh",
            "name": "Rashtrasant Tukadoji Maharaj Nagpur University",
            "state": "Maharashtra",
            "status": "Supported",
            "rail_type": "Roll Concurrence Active",
            "supported_documents": ["Degree Certificate", "Grade Card"]
        },
        {
            "id": "msbshse-mh",
            "name": "Maharashtra State Board of Secondary and Higher Secondary Education",
            "state": "Maharashtra",
            "status": "Supported",
            "rail_type": "DigiLocker Central Rail Active",
            "supported_documents": ["SSC Marksheet", "HSC Marksheet", "Migration Certificate"]
        },
        {
            "id": "du-delhi",
            "name": "University of Delhi (DU)",
            "state": "Delhi",
            "status": "Analysis Only",
            "rail_type": "Verification Unavailable (Roadmap Q4)",
            "supported_documents": ["Degree Certificate", "Marksheet"]
        },
        {
            "id": "anna-tn",
            "name": "Anna University",
            "state": "Tamil Nadu",
            "status": "Analysis Only",
            "rail_type": "Verification Unavailable (Roadmap Q4)",
            "supported_documents": ["Degree Certificate", "Consolidated Grade Sheet"]
        },
        {
            "id": "auto-tech-x",
            "name": "Autonomous Tech Institute X",
            "state": "Unknown",
            "status": "Not Supported",
            "rail_type": "No Digital Verification Rail Registered",
            "supported_documents": ["Unofficial Transcript"]
        }
    ]

    filtered = all_issuers
    if query:
        q = query.lower().strip()
        filtered = [item for item in all_issuers if q in item["name"].lower() or q in item["state"].lower()]

    return {
        "pilot_scope": "Selected Maharashtra Institutions & DigiLocker Rails",
        "issuers": filtered,
        "total_active_pilot": len([i for i in all_issuers if i["status"] == "Supported"]),
        "digilocker_status": {
            "configured": False,
            "message": "Official DigiLocker / API Setu integration is configured in production environment with government partner credentials."
        }
    }

@router.post("/verify-document", response_model=DocumentRecord)
async def verify_document(payload: VerifyDocumentRequest):
    if payload.document_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    try:
        updated_doc = DocumentService.verify_document_rail(
            doc_id=payload.document_id,
            req_inst=payload.institution_name
        )
        return updated_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/request-institution", status_code=status.HTTP_201_CREATED)
async def request_institution(payload: InstitutionRequest):
    from datetime import datetime, timezone
    req = {
        "id": len(institution_requests_db) + 1,
        "institution_name": payload.institution_name,
        "state": payload.state,
        "applicant_email": payload.applicant_email,
        "notes": payload.notes,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    institution_requests_db.append(req)
    return {"message": "Institution expansion request logged successfully.", "request_id": req["id"]}

