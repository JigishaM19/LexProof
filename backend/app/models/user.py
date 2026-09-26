from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
import re

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=120)
    password: str = Field(..., min_length=8, max_length=128)
    mobile: Optional[str] = None
    role: str = "INDIVIDUAL"
    user_type: str = "STUDENT"
    institution: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    enrollment_id: Optional[str] = None
    terms_accepted: bool = True

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        clean = (v or "").strip().upper()
        # Prevent self-assigning privileged roles
        if clean not in ["INDIVIDUAL", "ORGANIZATION"]:
            return "INDIVIDUAL"
        return clean

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        cleaned = re.sub(r"[\s\-\(\)]", "", v.strip())
        digits_only = re.sub(r"\D", "", cleaned)
        if len(digits_only) < 10 or len(digits_only) > 15:
            raise ValueError("Mobile number must contain between 10 and 15 digits.")
        return cleaned

class UserLogin(BaseModel):
    identifier: str  # Email or Mobile
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    mobile: Optional[str] = None
    role: str
    user_type: str
    institution: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    enrollment_id: Optional[str] = None
    is_email_verified: bool = False
    is_mobile_verified: bool = False
    is_verified: bool = False  # Unified frontend flag
    auth_provider: str = "local"
    account_status: str = "ACTIVE"
    created_at: datetime
    last_login: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400  # seconds
    user: UserResponse

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)

class SendOtpRequest(BaseModel):
    identifier: str
    purpose: str = "REGISTRATION"
    channel: Optional[str] = None  # EMAIL or PHONE

class VerifyOtpRequest(BaseModel):
    identifier: str
    otp: str
