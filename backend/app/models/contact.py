from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ContactInquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the contact")
    email: EmailStr = Field(..., description="Valid contact email address")
    inquiry_type: str = Field(..., min_length=2, max_length=100, description="Category of the inquiry")
    message: str = Field(..., min_length=5, max_length=3000, description="Message or query content")

class ContactInquiryResponse(BaseModel):
    id: str
    name: str
    email: str
    inquiry_type: str
    message: str
    status: str = "RECEIVED"
    user_id: Optional[str] = None
    created_at: datetime
