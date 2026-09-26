from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.models.contact import ContactInquiryCreate, ContactInquiryResponse
from app.services.contact_service import ContactService
from app.api.deps import get_optional_user
from app.models.user import UserResponse

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.post(
    "/inquiry",
    response_model=ContactInquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Contact Inquiry",
    description="Submit a support or institutional onboarding inquiry. Validates input and persists record."
)
async def submit_contact_inquiry(
    inquiry_in: ContactInquiryCreate,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    try:
        user_id = current_user.id if current_user else None
        created = ContactService.create_inquiry(inquiry_in, user_id=user_id)
        return created
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to process inquiry: {str(e)}"
        )

@router.get(
    "/inquiries",
    response_model=List[ContactInquiryResponse],
    summary="List Inquiries",
    description="Retrieve list of submitted contact inquiries."
)
async def list_contact_inquiries(
    limit: int = 50,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    return ContactService.list_inquiries(limit=limit)

@router.get(
    "/inquiries/{inquiry_id}",
    response_model=ContactInquiryResponse,
    summary="Get Inquiry Details",
    description="Retrieve a single contact inquiry by ID."
)
async def get_contact_inquiry(
    inquiry_id: str,
    current_user: Optional[UserResponse] = Depends(get_optional_user)
):
    inquiry = ContactService.get_inquiry(inquiry_id)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    return inquiry
