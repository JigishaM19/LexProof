from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, Literal, List
from datetime import datetime
import re

# ==============================================================================
# Verhoeff Algorithm for Official Aadhaar Checksum Validation
# ==============================================================================
VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]
VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

def validate_verhoeff(num_str: str) -> bool:
    """Verifies that num_str satisfies the Verhoeff checksum."""
    if not num_str.isdigit():
        return False
    c = 0
    reversed_digits = [int(d) for d in reversed(num_str)]
    for i, d in enumerate(reversed_digits):
        c = VERHOEFF_D[c][VERHOEFF_P[i % 8][d]]
    return c == 0

def mask_aadhaar(aadhaar: Optional[str]) -> Optional[str]:
    """Masks 12-digit Aadhaar to XXXX-XXXX-1234."""
    if not aadhaar:
        return None
    cleaned = re.sub(r"\D", "", aadhaar)
    if len(cleaned) == 12:
        return f"XXXX-XXXX-{cleaned[-4:]}"
    return "XXXX-XXXX-XXXX"

def mask_abha(abha: Optional[str]) -> Optional[str]:
    """Masks 14-digit ABHA to XX-XXXX-XXXX-1234."""
    if not abha:
        return None
    cleaned = re.sub(r"\D", "", abha)
    if len(cleaned) == 14:
        return f"XX-XXXX-XXXX-{cleaned[-4:]}"
    return "XX-XXXX-XXXX-XXXX"


class UserCreate(BaseModel):
    # Personal Details
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    email: EmailStr
    country_code: str = "+91"
    mobile: Optional[str] = None
    password: str = Field(..., min_length=8, max_length=128)

    # Address Information
    country_id: Optional[str] = "IN"
    country_name: Optional[str] = "India"
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
    subdistrict_id: Optional[str] = None
    subdistrict_name: Optional[str] = None
    city_id: Optional[str] = None
    city_name: Optional[str] = None
    pincode: Optional[str] = None

    # Student Information (Optional)
    aadhaar_number: Optional[str] = None
    abha_id: Optional[str] = None
    student_id_type: Optional[str] = None
    student_id_type_other: Optional[str] = None
    student_id_number: Optional[str] = None
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None
    custom_institution_name: Optional[str] = None
    institution: Optional[str] = None  # backward compatibility alias
    course_id: Optional[str] = None
    course_name: Optional[str] = None
    custom_course_name: Optional[str] = None
    course: Optional[str] = None  # backward compatibility alias
    branch_id: Optional[str] = None
    branch_name: Optional[str] = None
    custom_branch_name: Optional[str] = None
    branch: Optional[str] = None  # backward compatibility alias
    academic_year: Optional[str] = None
    academic_semester: Optional[str] = None
    academic_status: Optional[str] = None
    academic_status_other: Optional[str] = None
    enrollment_id: Optional[str] = None

    # Account metadata
    role: str = "USER"
    user_type: str = "USER"
    terms_accepted: bool = True

    @model_validator(mode="before")
    @classmethod
    def process_and_validate_names(cls, data: dict):
        if not isinstance(data, dict):
            return data

        first = (data.get("first_name") or "").strip()
        middle = (data.get("middle_name") or "").strip() or None
        last = (data.get("last_name") or "").strip()
        full = (data.get("full_name") or "").strip()

        # If first and last name provided, construct full_name
        if first and last:
            parts = [first]
            if middle:
                parts.append(middle)
            parts.append(last)
            data["full_name"] = " ".join(parts)
            data["first_name"] = first
            data["middle_name"] = middle
            data["last_name"] = last
        elif full:
            # If full_name provided but first/last not split, split intelligently
            name_parts = full.split()
            if len(name_parts) == 1:
                data["first_name"] = name_parts[0]
                data["last_name"] = name_parts[0]
            elif len(name_parts) == 2:
                data["first_name"] = name_parts[0]
                data["last_name"] = name_parts[1]
            else:
                data["first_name"] = name_parts[0]
                data["middle_name"] = " ".join(name_parts[1:-1])
                data["last_name"] = name_parts[-1]
            data["full_name"] = full
        else:
            raise ValueError("First name and last name are required.")

        # Validate name characters
        name_regex = r"^[a-zA-Z\s\.\'\-]+$"
        if not re.match(name_regex, data["first_name"]):
            raise ValueError("First name contains invalid characters. Use letters, spaces, hyphens, or periods.")
        if data.get("last_name") and not re.match(name_regex, data["last_name"]):
            raise ValueError("Last name contains invalid characters.")
        if data.get("middle_name") and not re.match(name_regex, data["middle_name"]):
            raise ValueError("Middle name contains invalid characters.")

        # Sync institution/course/branch backward compatibility aliases
        if data.get("institution_name") and not data.get("institution"):
            data["institution"] = data["institution_name"]
        elif data.get("institution") and not data.get("institution_name"):
            data["institution_name"] = data["institution"]

        if data.get("course_name") and not data.get("course"):
            data["course"] = data["course_name"]
        elif data.get("course") and not data.get("course_name"):
            data["course_name"] = data["course"]

        if data.get("branch_name") and not data.get("branch"):
            data["branch"] = data["branch_name"]
        elif data.get("branch") and not data.get("branch_name"):
            data["branch_name"] = data["branch"]

        if data.get("student_id_number") and not data.get("enrollment_id"):
            data["enrollment_id"] = data["student_id_number"]
        elif data.get("enrollment_id") and not data.get("student_id_number"):
            data["student_id_number"] = data["enrollment_id"]

        # Enforce two distinct roles: ADMIN and USER (Peoples / Students)
        raw_role = str(data.get("role") or "USER").strip().upper()
        data["role"] = "ADMIN" if raw_role == "ADMIN" else "USER"
        data["user_type"] = "ADMIN" if data["role"] == "ADMIN" else "PEOPLE"

        return data

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        clean = (v or "").strip().lower()
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", clean):
            raise ValueError("Please provide a valid email address.")
        return clean

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        cleaned = re.sub(r"[\s\-\(\)]", "", v.strip())
        digits_only = re.sub(r"\D", "", cleaned)
        if len(digits_only) < 10 or len(digits_only) > 15:
            raise ValueError("Phone number must contain between 10 and 15 digits.")
        return cleaned

    @field_validator("pincode")
    @classmethod
    def validate_pincode_format(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        clean = v.strip()
        # For India PIN codes, standard 6-digit format:
        if clean.isdigit() and len(clean) == 6:
            if clean.startswith("0"):
                raise ValueError("Indian PIN code cannot start with 0.")
            return clean
        # For other country postal codes, allow 3-10 alphanumeric
        if re.match(r"^[A-Za-z0-9\s\-]{3,10}$", clean):
            return clean
        raise ValueError("Invalid postal / PIN code format.")

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        clean_digits = re.sub(r"[\s\-]", "", v.strip())
        if len(clean_digits) != 12 or not clean_digits.isdigit():
            raise ValueError("Aadhaar Number must be exactly 12 digits.")
        if clean_digits.startswith("0") or clean_digits.startswith("1"):
            raise ValueError("Invalid Aadhaar Number: cannot start with 0 or 1.")
        # Verhoeff Checksum Check
        if not validate_verhoeff(clean_digits):
            raise ValueError("Invalid Aadhaar Number checksum.")
        return clean_digits

    @field_validator("abha_id")
    @classmethod
    def validate_abha(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        clean = re.sub(r"[\s\-]", "", v.strip())
        if len(clean) != 14 or not clean.isdigit():
            raise ValueError("ABHA ID must be a valid 14-digit identifier.")
        # Normalized formatted representation: XX-XXXX-XXXX-XXXX
        return f"{clean[0:2]}-{clean[2:6]}-{clean[6:10]}-{clean[10:14]}"


class UserLogin(BaseModel):
    identifier: str  # Email or Mobile
    password: str


class DemoLoginRequest(BaseModel):
    role: str = "USER"


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: str
    country_code: str = "+91"
    mobile: Optional[str] = None
    role: str
    user_type: str

    # Address Details
    country_id: Optional[str] = None
    country_name: Optional[str] = None
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
    subdistrict_id: Optional[str] = None
    subdistrict_name: Optional[str] = None
    city_id: Optional[str] = None
    city_name: Optional[str] = None
    pincode: Optional[str] = None

    # Student Details (Protected / Masked)
    masked_aadhaar: Optional[str] = None
    masked_abha: Optional[str] = None
    student_id_type: Optional[str] = None
    student_id_type_other: Optional[str] = None
    student_id_number: Optional[str] = None
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None
    custom_institution_name: Optional[str] = None
    institution: Optional[str] = None
    course_id: Optional[str] = None
    course_name: Optional[str] = None
    custom_course_name: Optional[str] = None
    course: Optional[str] = None
    branch_id: Optional[str] = None
    branch_name: Optional[str] = None
    custom_branch_name: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    academic_semester: Optional[str] = None
    academic_status: Optional[str] = None
    academic_status_other: Optional[str] = None
    enrollment_id: Optional[str] = None

    # Status flags
    is_email_verified: bool = False
    is_mobile_verified: bool = False
    is_verified: bool = False
    is_demo_account: bool = False
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
    purpose: Optional[str] = "REGISTRATION"
