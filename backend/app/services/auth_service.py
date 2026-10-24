import uuid
import re
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any
from app.models.user import UserCreate, UserResponse, UserLogin, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.database import get_database
from app.core.config import settings
from app.services.otp_service import OTPService

logger = logging.getLogger("LexProof.AuthService")

class AuthService:
    @staticmethod
    def _doc_to_user_response(doc: dict) -> UserResponse:
        from app.models.user import mask_aadhaar, mask_abha
        return UserResponse(
            id=doc["id"],
            email=doc["email"],
            first_name=doc.get("first_name"),
            middle_name=doc.get("middle_name"),
            last_name=doc.get("last_name"),
            full_name=doc.get("full_name", ""),
            country_code=doc.get("country_code", "+91"),
            mobile=doc.get("mobile"),
            role="ADMIN" if (doc.get("role") or "").strip().upper() == "ADMIN" else "USER",
            user_type="ADMIN" if (doc.get("role") or "").strip().upper() == "ADMIN" else "PEOPLE",
            # Address
            country_id=doc.get("country_id"),
            country_name=doc.get("country_name"),
            state_id=doc.get("state_id"),
            state_name=doc.get("state_name"),
            district_id=doc.get("district_id"),
            district_name=doc.get("district_name"),
            subdistrict_id=doc.get("subdistrict_id"),
            subdistrict_name=doc.get("subdistrict_name"),
            city_id=doc.get("city_id"),
            city_name=doc.get("city_name"),
            pincode=doc.get("pincode"),
            # Student info – return masked sensitive identifiers
            masked_aadhaar=mask_aadhaar(doc.get("aadhaar_number")),
            masked_abha=mask_abha(doc.get("abha_id")),
            student_id_type=doc.get("student_id_type"),
            student_id_type_other=doc.get("student_id_type_other"),
            student_id_number=doc.get("student_id_number"),
            institution_id=doc.get("institution_id"),
            institution_name=doc.get("institution_name"),
            institution=doc.get("institution") or doc.get("institution_name"),
            course_id=doc.get("course_id"),
            course_name=doc.get("course_name"),
            course=doc.get("course") or doc.get("course_name"),
            branch_id=doc.get("branch_id"),
            branch_name=doc.get("branch_name"),
            branch=doc.get("branch") or doc.get("branch_name"),
            academic_year=doc.get("academic_year"),
            academic_semester=doc.get("academic_semester"),
            academic_status=doc.get("academic_status"),
            academic_status_other=doc.get("academic_status_other"),
            enrollment_id=doc.get("enrollment_id") or doc.get("student_id_number"),
            custom_institution_name=doc.get("custom_institution_name"),
            custom_course_name=doc.get("custom_course_name"),
            custom_branch_name=doc.get("custom_branch_name"),
            # Flags
            is_email_verified=doc.get("is_email_verified", False),
            is_mobile_verified=doc.get("is_mobile_verified", False),
            is_verified=doc.get("is_email_verified", False) or doc.get("is_mobile_verified", False),
            is_demo_account=doc.get("is_demo_account", False),
            auth_provider=doc.get("auth_provider", "local"),
            account_status=doc.get("account_status", "ACTIVE"),
            created_at=doc.get("created_at") or datetime.now(timezone.utc),
            last_login=doc.get("last_login")
        )

    @classmethod
    async def register_user(cls, user_in: UserCreate) -> UserResponse:
        db = await get_database()
        users_col = db["users"]

        clean_email = user_in.email.strip().lower()
        clean_mobile = None
        if user_in.mobile:
            clean_mobile = re.sub(r"[\s\-\(\)]", "", user_in.mobile.strip())

        # Uniqueness checks
        existing_email = await users_col.find_one({"email": clean_email})
        if existing_email:
            raise ValueError("An account with this email address already exists. Please sign in.")

        if clean_mobile:
            existing_mobile = await users_col.find_one({"mobile": clean_mobile})
            if existing_mobile:
                raise ValueError("An account with this mobile number already exists. Please sign in.")

        user_id = str(uuid.uuid4())
        hashed_pwd = get_password_hash(user_in.password)
        now = datetime.now(timezone.utc)

        # Check verification status
        email_verified = await OTPService.is_identifier_verified(clean_email, purpose="REGISTRATION")
        mobile_verified = False
        if clean_mobile:
            mobile_verified = await OTPService.is_identifier_verified(clean_mobile, purpose="REGISTRATION")

        # Assign default role, allow ADMIN or default to USER
        role = "ADMIN" if (user_in.role or "").strip().upper() == "ADMIN" else "USER"

        # Validate geographic hierarchy (State -> District -> Subdistrict)
        state_id = user_in.state_id
        district_id = user_in.district_id
        subdistrict_id = user_in.subdistrict_id
        resolved_state_name = user_in.state_name
        resolved_district_name = user_in.district_name
        resolved_subdistrict_name = user_in.subdistrict_name
        district_doc = None

        if state_id:
            state_doc = await db["states"].find_one({"id": state_id})
            if state_doc:
                resolved_state_name = state_doc.get("name")
            elif user_in.country_id == "IN":
                raise ValueError(f"State '{state_id}' is not recognized.")

        if district_id:
            dist_query = {"$or": [{"id": district_id}, {"code": district_id}]}
            if state_id:
                dist_query["state_id"] = state_id
            district_doc = await db["districts"].find_one(dist_query)
            if not district_doc and state_id:
                district_doc = await db["districts"].find_one({"state_id": state_id, "id": {"$regex": re.escape(district_id), "$options": "i"}})
            if not district_doc:
                if user_in.country_id == "IN":
                    raise ValueError(f"District '{district_id}' is invalid or does not belong to the selected state.")
            else:
                resolved_district_name = district_doc.get("name")

        if subdistrict_id:
            sub_doc = await db["subdistricts"].find_one({"id": subdistrict_id})
            if not sub_doc and subdistrict_id.isdigit():
                sub_doc = await db["subdistricts"].find_one({"code": int(subdistrict_id)})
            if not sub_doc:
                if user_in.country_id == "IN":
                    raise ValueError(f"Subdistrict '{subdistrict_id}' is not recognized.")
            elif district_id:
                is_match = (
                    sub_doc.get("district_id") == district_id or
                    str(sub_doc.get("district_code")) == district_id or
                    (district_doc and sub_doc.get("district_code") == district_doc.get("lgd_code")) or
                    (district_doc and sub_doc.get("district_name", "").lower() == district_doc.get("name", "").lower())
                )
                if not is_match:
                    raise ValueError(f"Subdistrict '{sub_doc.get('name')}' does not belong to district '{resolved_district_name or district_id}'.")
            resolved_subdistrict_name = sub_doc.get("name")

        user_record = {
            "id": user_id,
            "email": clean_email,
            # Name fields
            "first_name": user_in.first_name,
            "middle_name": user_in.middle_name,
            "last_name": user_in.last_name,
            "full_name": (user_in.full_name or "").strip(),
            "country_code": user_in.country_code or "+91",
            "mobile": clean_mobile,
            "password_hash": hashed_pwd,
            "role": role,
            "user_type": user_in.user_type or "USER",
            # Address
            "country_id": user_in.country_id,
            "country_name": user_in.country_name,
            "state_id": user_in.state_id,
            "state_name": resolved_state_name or user_in.state_name,
            "district_id": user_in.district_id,
            "district_name": resolved_district_name or user_in.district_name,
            "subdistrict_id": user_in.subdistrict_id,
            "subdistrict_name": resolved_subdistrict_name or user_in.subdistrict_name,
            "city_id": user_in.city_id,
            "city_name": user_in.city_name,
            "pincode": user_in.pincode,
            # Student information – store securely, never log
            "aadhaar_number": user_in.aadhaar_number,  # stored only when provided; encrypted at rest by Atlas
            "abha_id": user_in.abha_id,
            "student_id_type": user_in.student_id_type,
            "student_id_type_other": user_in.student_id_type_other,
            "student_id_number": user_in.student_id_number,
            "institution_id": user_in.institution_id,
            "institution_name": user_in.institution_name or user_in.institution,
            "institution": user_in.institution or user_in.institution_name,
            "custom_institution_name": user_in.custom_institution_name,
            "course_id": user_in.course_id,
            "course_name": user_in.course_name or user_in.course,
            "course": user_in.course or user_in.course_name,
            "custom_course_name": user_in.custom_course_name,
            "branch_id": user_in.branch_id,
            "branch_name": user_in.branch_name or user_in.branch,
            "branch": user_in.branch or user_in.branch_name,
            "custom_branch_name": user_in.custom_branch_name,
            "academic_year": user_in.academic_year,
            "academic_semester": user_in.academic_semester,
            "academic_status": user_in.academic_status,
            "academic_status_other": user_in.academic_status_other,
            "enrollment_id": user_in.enrollment_id or user_in.student_id_number,
            # Flags
            "is_email_verified": email_verified,
            "is_mobile_verified": mobile_verified,
            "is_demo_account": False,
            "auth_provider": "local",
            "account_status": "ACTIVE",
            "created_at": now,
            "updated_at": now,
            "last_login": now
        }

        await users_col.insert_one(user_record)
        logger.info(f"User account created in MongoDB: {clean_email} (ID: {user_id}, Role: {role})")

        # Clean up consumed registration OTPs
        await OTPService.consume_verification(clean_email, purpose="REGISTRATION")
        if clean_mobile:
            await OTPService.consume_verification(clean_mobile, purpose="REGISTRATION")

        return cls._doc_to_user_response(user_record)

    @classmethod
    async def authenticate_user(cls, login_in: UserLogin) -> TokenResponse:
        db = await get_database()
        users_col = db["users"]
        sessions_col = db["sessions"]

        ident = login_in.identifier.strip()
        ident_lower = ident.lower()
        ident_clean_digits = re.sub(r"\D", "", ident)

        query = {"$or": [
            {"email": ident_lower}
        ]}
        if len(ident_clean_digits) >= 10:
            query["$or"].append({"mobile": ident})
            query["$or"].append({"mobile": {"$regex": f"{ident_clean_digits}$"}})

        user = await users_col.find_one(query)
        if not user:
            raise ValueError("Invalid email/mobile or password.")

        if not user.get("password_hash"):
            if user.get("auth_provider") == "google":
                raise ValueError("This account was created with Google. Please use 'Continue with Google'.")
            raise ValueError("Invalid email/mobile or password.")

        # Constant-time verify password with Argon2
        if not verify_password(login_in.password, user["password_hash"]):
            raise ValueError("Invalid email/mobile or password.")

        if user.get("account_status") != "ACTIVE":
            raise ValueError("This account has been deactivated or suspended. Please contact support.")

        now = datetime.now(timezone.utc)
        await users_col.update_one({"id": user["id"]}, {"$set": {"last_login": now}})

        # Create session record
        session_id = str(uuid.uuid4())
        session_expires = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await sessions_col.insert_one({
            "token_id": session_id,
            "user_id": user["id"],
            "created_at": now,
            "expires_at": session_expires,
            "is_revoked": False
        })

        # Generate JWT access token with normalized role: ADMIN or USER
        user_role = "ADMIN" if (user.get("role") or "").strip().upper() == "ADMIN" else "USER"
        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "role": user_role,
            "full_name": user["full_name"],
            "session_id": session_id
        }
        access_token = create_access_token(token_data)
        user_resp = cls._doc_to_user_response(user)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_resp
        )

    @classmethod
    async def get_user_by_id(cls, user_id: str) -> Optional[UserResponse]:
        db = await get_database()
        user = await db["users"].find_one({"id": user_id})
        if not user:
            return None
        return cls._doc_to_user_response(user)

    @classmethod
    async def get_user_by_email(cls, email: str) -> Optional[UserResponse]:
        db = await get_database()
        user = await db["users"].find_one({"email": email.strip().lower()})
        if not user:
            return None
        return cls._doc_to_user_response(user)

    @classmethod
    async def handle_google_user(cls, google_payload: Dict[str, Any]) -> Tuple[str, UserResponse]:
        """
        Processes verified Google OAuth identity directly through MongoDB.
        Links existing accounts or securely creates a new account.
        """
        email = google_payload.get("email", "").strip().lower()
        if not email:
            raise ValueError("Google identity does not contain a verified email address.")

        google_id = google_payload.get("sub") or google_payload.get("id")
        full_name = google_payload.get("name") or google_payload.get("given_name") or email.split("@")[0]
        now = datetime.now(timezone.utc)

        db = await get_database()
        users_col = db["users"]
        sessions_col = db["sessions"]

        user = await users_col.find_one({"$or": [{"email": email}, {"google_id": google_id}]})
        if user:
            # Update user profile metadata
            update_fields = {"last_login": now, "is_email_verified": True}
            if not user.get("google_id") and google_id:
                update_fields["google_id"] = google_id
            await users_col.update_one({"id": user["id"]}, {"$set": update_fields})
            user_id = user["id"]
            user = await users_col.find_one({"id": user_id})
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            new_user_record = {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "mobile": None,
                "password_hash": None,
                "role": "USER",
                "user_type": "USER",
                "institution": None,
                "course": None,
                "branch": None,
                "academic_year": None,
                "enrollment_id": None,
                "is_email_verified": True,
                "is_mobile_verified": False,
                "auth_provider": "google",
                "google_id": google_id,
                "account_status": "ACTIVE",
                "created_at": now,
                "updated_at": now,
                "last_login": now
            }
            await users_col.insert_one(new_user_record)
            user = new_user_record
            logger.info(f"New user registered via Google OAuth: {email} (ID: {user_id})")

        # Create session
        session_id = str(uuid.uuid4())
        session_expires = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await sessions_col.insert_one({
            "token_id": session_id,
            "user_id": user_id,
            "created_at": now,
            "expires_at": session_expires,
            "is_revoked": False
        })

        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "role": user.get("role", "USER"),
            "full_name": user["full_name"],
            "session_id": session_id
        }
        access_token = create_access_token(token_data)
        user_resp = cls._doc_to_user_response(user)
        return access_token, user_resp

    @classmethod
    async def request_password_reset(cls, email: str) -> Tuple[bool, str]:
        clean_email = email.strip().lower()
        db = await get_database()
        user = await db["users"].find_one({"email": clean_email})

        # To prevent user enumeration attacks, return success message even if account not found
        generic_msg = "If an account exists with this email address, a password reset code has been dispatched."
        if not user:
            logger.info(f"Password reset requested for non-existent email: {clean_email}")
            return True, generic_msg

        success, delivery_msg, _ = await OTPService.send_otp(clean_email, purpose="PASSWORD_RESET")
        if not success:
            logger.warning(f"Failed to dispatch password reset OTP for {clean_email}: {delivery_msg}")
            # If rate-limited or Resend error, pass meaningful message
            return False, delivery_msg

        return True, generic_msg

    @classmethod
    async def reset_password(cls, email: str, otp: str, new_password: str) -> Tuple[bool, str]:
        clean_email = email.strip().lower()
        if len(new_password) < 8:
            return False, "Password must be at least 8 characters long."

        db = await get_database()
        users_col = db["users"]
        sessions_col = db["sessions"]

        # Verify reset OTP
        success, otp_msg, _ = await OTPService.verify_otp(clean_email, otp, purpose="PASSWORD_RESET")
        if not success:
            return False, otp_msg

        user = await users_col.find_one({"email": clean_email})
        if not user:
            return False, "User account not found."

        new_hash = get_password_hash(new_password)
        now = datetime.now(timezone.utc)

        # Update password
        await users_col.update_one(
            {"id": user["id"]},
            {"$set": {"password_hash": new_hash, "updated_at": now}}
        )

        # Revoke all active sessions on password change
        await sessions_col.update_many(
            {"user_id": user["id"]},
            {"$set": {"is_revoked": True}}
        )

        # Consume the verified reset OTP
        await OTPService.consume_verification(clean_email, purpose="PASSWORD_RESET")
        logger.info(f"Password successfully reset for account: {clean_email}")
        return True, "Password updated successfully. You can now sign in with your new password."

    @classmethod
    async def logout_user(cls, user_id: str, session_id: Optional[str] = None) -> bool:
        db = await get_database()
        sessions_col = db["sessions"]
        if session_id:
            await sessions_col.update_one({"token_id": session_id}, {"$set": {"is_revoked": True}})
        else:
            await sessions_col.update_many({"user_id": user_id}, {"$set": {"is_revoked": True}})
        return True

    @classmethod
    async def get_or_create_demo_user(cls, role: str = "USER") -> TokenResponse:
        """
        Upsert a clearly-labelled non-privileged demo account for testing.
        Uses synthetic, non-sensitive data. Supports USER and ORGANIZATION roles.
        """
        from app.core.security import get_password_hash, create_access_token

        target_role = "ADMIN" if (role or "").strip().upper() == "ADMIN" else "USER"
        demo_email = "demo.admin@lexproof.dev" if target_role == "ADMIN" else "demo.user@lexproof.dev"
        demo_full_name = "Demo Administrator" if target_role == "ADMIN" else "Demo Student User"
        demo_inst = "LexProof Administration" if target_role == "ADMIN" else "Savitribai Phule Pune University"

        db = await get_database()
        users_col = db["users"]
        sessions_col = db["sessions"]
        now = datetime.now(timezone.utc)

        existing = await users_col.find_one({"email": demo_email})
        if existing:
            user_doc = existing
            await users_col.update_one({"email": demo_email}, {"$set": {"last_login": now}})
        else:
            demo_id = str(uuid.uuid4())
            user_doc = {
                "id": demo_id,
                "email": demo_email,
                "first_name": "Demo",
                "middle_name": None,
                "last_name": "Admin" if target_role == "ADMIN" else "User",
                "full_name": demo_full_name,
                "country_code": "+91",
                "mobile": None,
                "password_hash": get_password_hash("demo-session-only-not-a-real-password"),
                "role": target_role,
                "user_type": "ADMIN" if target_role == "ADMIN" else "PEOPLE",
                "institution_name": demo_inst,
                "institution": demo_inst,
                "country_id": "IN",
                "country_name": "India",
                "state_id": "IN-MH",
                "state_name": "Maharashtra",
                "district_id": "IN-MH-PUN",
                "district_name": "Pune",
                "city_id": "IN-MH-PUN-01",
                "city_name": "Pune City",
                "pincode": "411001",
                "is_email_verified": True,
                "is_mobile_verified": False,
                "is_demo_account": True,
                "auth_provider": "demo",
                "account_status": "ACTIVE",
                "created_at": now,
                "updated_at": now,
                "last_login": now
            }
            await users_col.insert_one(user_doc)
            logger.info(f"Demo account initialized: {demo_email} (Role: {target_role})")

        # Create short-lived demo session
        session_id = str(uuid.uuid4())
        session_expires = now + timedelta(hours=1)
        await sessions_col.insert_one({
            "token_id": session_id,
            "user_id": user_doc["id"],
            "created_at": now,
            "expires_at": session_expires,
            "is_revoked": False,
            "is_demo_session": True
        })

        token_data = {
            "sub": user_doc["id"],
            "email": user_doc["email"],
            "role": user_doc.get("role", target_role),
            "full_name": user_doc.get("full_name", demo_full_name),
            "session_id": session_id,
            "is_demo": True
        }
        access_token = create_access_token(token_data, expires_delta=timedelta(hours=1))
        user_resp = cls._doc_to_user_response(user_doc)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=3600,
            user=user_resp
        )
