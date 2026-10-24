import os
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Depends, BackgroundTasks
from fastapi.responses import FileResponse, RedirectResponse
from typing import List, Optional, Dict, Any
from app.models.case import DocumentRecord
from app.services.document_service import DocumentService
from app.services.storage_service import get_storage_adapter
from app.api.deps import get_current_user
from app.models.user import UserResponse
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentRecord)
async def upload_document(
    file: UploadFile = File(...),
    case_id: Optional[str] = Form(None),
    async_mode: Optional[bool] = Form(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
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
        new_case = await DocumentService.create_case(
            user_id=user.id,
            title="General Document Inspection",
            purpose="Document Verification"
        )
        target_case_id = new_case.id

    # Determine whether to execute in background or synchronously with fallback
    should_run_async = settings.ASYNC_INGESTION_DEFAULT if async_mode is None else async_mode

    try:
        # Fast non-blocking ingestion
        doc = await DocumentService.initialize_uploaded_document(
            case_id=target_case_id,
            user_id=user.id,
            filename=file.filename,
            content=content,
            storage_dir=settings.UPLOAD_DIR
        )

        if should_run_async:
            # Enqueue multi-page forensics & AI vision in background
            background_tasks.add_task(DocumentService.execute_background_forensics, doc.id)
            return doc
        else:
            # Synchronous fallback execution
            processed_doc = await DocumentService.execute_background_forensics(doc.id)
            return processed_doc

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("/{document_id}/status")
async def get_document_status(document_id: str, user: UserResponse = Depends(get_current_user)):
    doc = await DocumentService.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")
    
    return {
        "id": doc.id,
        "status": doc.status,
        "processing_stage": doc.processing_stage,
        "tamper_detected": doc.tamper_detected,
        "tamper_score": doc.tamper_score,
        "tamper_regions": doc.tamper_regions,
        "page_count": doc.page_count,
        "indicators": doc.indicators,
        "extracted_fields": doc.extracted_fields,
        "updated_at": doc.updated_at,
    }

@router.get("/{document_id}", response_model=DocumentRecord)
async def get_document(document_id: str, user: UserResponse = Depends(get_current_user)):
    doc = await DocumentService.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")
    return doc

@router.get("/{document_id}/file")
async def get_document_file(document_id: str, user: UserResponse = Depends(get_current_user)):
    doc = await DocumentService.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")

    storage = get_storage_adapter()
    access_info = storage.get_access_info(doc.storage_path, doc.original_filename)

    if access_info.get("type") == "s3_presigned" and access_info.get("url"):
        return RedirectResponse(access_info["url"])

    local_path = access_info.get("path") or doc.storage_path
    if not os.path.exists(local_path):
        try:
            # Fallback: pull from storage adapter into local upload cache
            file_bytes = storage.read_file(doc.storage_path)
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            local_path = os.path.join(settings.UPLOAD_DIR, f"{doc.id}_{doc.original_filename}")
            with open(local_path, "wb") as f:
                f.write(file_bytes)
        except Exception:
            raise HTTPException(status_code=404, detail="Document file not found in storage.")

    return FileResponse(local_path, media_type=doc.file_type, filename=doc.original_filename)

@router.patch("/{document_id}/fields", response_model=DocumentRecord)
async def update_document_fields(document_id: str, payload: dict, user: UserResponse = Depends(get_current_user)):
    doc = await DocumentService.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")
    
    updated_doc = await DocumentService.update_document_fields(document_id, payload)
    return updated_doc

@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(document_id: str, user: UserResponse = Depends(get_current_user)):
    doc = await DocumentService.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")
    
    await DocumentService.delete_document(document_id)
    return {"message": "Document deleted successfully in accordance with Data Governance policy."}

@router.post("/{document_id}/reprocess")
async def reprocess_document(
    document_id: str,
    async_mode: Optional[bool] = True,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user: UserResponse = Depends(get_current_user)
):
    """Triggers on-demand re-extraction and forensic re-analysis of an existing document."""
    doc = await DocumentService.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Document belongs to another user.")

    doc.status = "PROCESSING"
    doc.processing_stage = "Re-evaluating document forensics & credential extraction..."
    await DocumentService.save_document(doc)

    should_run_async = settings.ASYNC_INGESTION_DEFAULT if async_mode is None else async_mode

    if should_run_async:
        background_tasks.add_task(DocumentService.execute_background_forensics, doc.id)
        return {
            "message": "AI analysis re-execution enqueued successfully.",
            "document_id": doc.id,
            "status": "PROCESSING",
            "processing_stage": doc.processing_stage
        }
    else:
        processed_doc = await DocumentService.execute_background_forensics(doc.id)
        return processed_doc

