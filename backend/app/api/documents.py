from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Depends
from typing import List, Optional
from app.models.case import DocumentRecord
from app.services.document_service import DocumentService, documents_db, cases_db
from app.api.deps import get_current_user
from app.models.user import UserResponse
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentRecord)
async def upload_document(
    file: UploadFile = File(...),
    case_id: Optional[str] = Form(None),
    user: UserResponse = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename cannot be empty.")

    # Read content
    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Ensure a case exists if not specified
    target_case_id = case_id
    if not target_case_id:
        # Create a default active case for this user
        import uuid
        from datetime import datetime, timezone
        from app.models.case import CaseRecord
        target_case_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        cases_db[target_case_id] = CaseRecord(
            id=target_case_id,
            user_id=user.id,
            title="General Document Inspection",
            purpose="Document Verification",
            status="ACTIVE",
            document_ids=[],
            missing_documents=[],
            contradictions=[],
            duplicate_flags=[],
            created_at=now,
            updated_at=now
        )

    try:
        doc = DocumentService.process_uploaded_document(
            case_id=target_case_id,
            user_id=user.id,
            filename=file.filename,
            content=content,
            storage_dir=settings.UPLOAD_DIR
        )
        return doc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("/{document_id}", response_model=DocumentRecord)
async def get_document(document_id: str, user: UserResponse = Depends(get_current_user)):
    doc = documents_db.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")
    return doc

@router.get("/{document_id}/file")
async def get_document_file(document_id: str, user: UserResponse = Depends(get_current_user)):
    from fastapi.responses import FileResponse
    import os
    doc = documents_db.get(document_id)
    if not doc or not os.path.exists(doc.storage_path):
        raise HTTPException(status_code=404, detail="Document file not found on disk.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")
    return FileResponse(doc.storage_path, media_type=doc.file_type, filename=doc.original_filename)

@router.patch("/{document_id}/fields", response_model=DocumentRecord)
async def update_document_fields(document_id: str, payload: dict, user: UserResponse = Depends(get_current_user)):
    from datetime import datetime, timezone
    doc = documents_db.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")
    
    for k, v in payload.items():
        if k in doc.extracted_fields:
            doc.extracted_fields[k].extracted_value = str(v)
            doc.extracted_fields[k].is_user_confirmed = True
        else:
            from app.models.case import ExtractedField
            doc.extracted_fields[k] = ExtractedField(
                field_name=k.replace("_", " ").title(),
                extracted_value=str(v),
                confidence=1.0,
                is_user_confirmed=True
            )
    doc.updated_at = datetime.now(timezone.utc)
    DocumentService.recalculate_case_state(doc.case_id)
    return doc

@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(document_id: str, user: UserResponse = Depends(get_current_user)):
    import os
    doc = documents_db.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")
    
    # Remove file from disk
    if os.path.exists(doc.storage_path):
        try:
            os.remove(doc.storage_path)
        except Exception:
            pass

    # Remove from parent case
    if doc.case_id in cases_db:
        case = cases_db[doc.case_id]
        if document_id in case.document_ids:
            case.document_ids.remove(document_id)
        DocumentService.recalculate_case_state(doc.case_id)

    del documents_db[document_id]
    return {"message": "Document deleted successfully in accordance with Data Governance policy."}
