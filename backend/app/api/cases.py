import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.case import CaseRecord, CaseCreate, CaseResponse
from app.services.document_service import cases_db, documents_db
from app.api.deps import get_current_user
from app.models.user import UserResponse

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("", response_model=CaseRecord, status_code=status.HTTP_201_CREATED)
async def create_case(case_in: CaseCreate, user: UserResponse = Depends(get_current_user)):
    case_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    new_case = CaseRecord(
        id=case_id,
        user_id=user.id,
        title=case_in.title,
        purpose=case_in.purpose,
        target_institution=case_in.target_institution,
        status="ACTIVE",
        document_ids=[],
        missing_documents=["Degree Certificate", "Consolidated Marksheet"],
        contradictions=[],
        duplicate_flags=[],
        created_at=now,
        updated_at=now
    )
    cases_db[case_id] = new_case
    return new_case

@router.get("", response_model=List[CaseRecord])
async def list_cases(user: UserResponse = Depends(get_current_user)):
    # Return cases belonging to the authenticated user
    user_cases = [c for c in cases_db.values() if c.user_id == user.id]
    return user_cases

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str, user: UserResponse = Depends(get_current_user)):
    case = cases_db.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    
    if case.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Case belongs to another user.")
    
    docs = [documents_db[d_id] for d_id in case.document_ids if d_id in documents_db]
    return CaseResponse(case=case, documents=docs, summary_status="READY")

@router.get("/{case_id}/report")
async def get_case_report(case_id: str, user: UserResponse = Depends(get_current_user)):
    case = cases_db.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    
    if case.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Case belongs to another user.")
    
    docs = [documents_db[d_id] for d_id in case.document_ids if d_id in documents_db]
    now = datetime.now(timezone.utc)
    
    # Generate cryptographic dossier metadata
    combined_hash_source = case.id + "".join(d.file_hash_sha256 for d in docs)
    import hashlib
    dossier_hash = hashlib.sha256(combined_hash_source.encode()).hexdigest()

    audit_trail = [
        {"action": "CASE_INITIALIZED", "timestamp": case.created_at.isoformat(), "actor": user.email},
        {"action": "DOCUMENT_INTAKE_COMPLETED", "timestamp": (docs[0].created_at.isoformat() if docs else case.created_at.isoformat()), "actor": "LexProof MagicByte Pipeline"}
    ]
    for d in docs:
        if d.verification_result:
            audit_trail.append({
                "action": f"RAIL_VERIFICATION_{d.verification_result.status}",
                "timestamp": d.verification_result.verification_timestamp.isoformat(),
                "actor": d.verification_result.rail_name
            })

    return {
        "report_id": f"LP-REP-{case_id[:8].upper()}-{now.strftime('%Y%m%d')}",
        "generated_at": now.isoformat(),
        "case": case,
        "documents": docs,
        "dossier_hash": dossier_hash,
        "overall_status": case.overall_status,
        "audit_trail": audit_trail,
        "scope_notice": "Authoritative verification legally confirmed only for supported pilot institutions in Maharashtra and official digital repositories."
    }

@router.delete("/{case_id}", status_code=status.HTTP_200_OK)
async def delete_case(case_id: str, user: UserResponse = Depends(get_current_user)):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found.")
    
    case = cases_db[case_id]
    if case.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Case belongs to another user.")
        
    # Delete associated documents
    for doc_id in list(case.document_ids):
        if doc_id in documents_db:
            doc = documents_db[doc_id]
            import os
            if os.path.exists(doc.storage_path):
                try:
                    os.remove(doc.storage_path)
                except Exception:
                    pass
            del documents_db[doc_id]
            
    del cases_db[case_id]
    return {"message": "Case and related document artifacts purged successfully."}
