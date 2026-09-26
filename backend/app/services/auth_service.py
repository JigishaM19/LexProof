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
        return UserResponse(
            id=doc["id"],
            email=doc["email"],
            full_name=doc["full_name"],
            mobile=doc.get("mobile"),
            role=doc.get("role", "INDIVIDUAL"),
            user_type=doc.get("user_type", "STUDENT"),
            institution=doc.get("institution"),
            course=doc.get("course"),
            branch=doc.get("branch"),
            academic_year=doc.get("academic_year"),
            enrollment_id=doc.get("enrollment_id"),
            is_email_verified=doc.get("is_email_verified", False),
            is_mobile_verified=doc.get("is_mobile_verified", False),
            is_verified=doc.get("is_email_verified", False) or doc.get("is_mobile_verified", False),
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

        # Assign default role, prevent self-assigning privileged roles
        role = "ORGANIZATION" if user_in.role == "ORGANIZATION" else "INDIVIDUAL"

        user_record = {
            "id": user_id,
            "email": clean_email,
            "full_name": user_in.full_name.strip(),
            "mobile": clean_mobile,
            "password_hash": hashed_pwd,
            "role": role,
            "user_type": user_in.user_type,
            "institution": user_in.institution,
            "course": user_in.course,
            "branch": user_in.branch,
            "academic_year": user_in.academic_year,
            "enrollment_id": user_in.enrollment_id,
            "is_email_verified": email_verified,
            "is_mobile_verified": mobile_verified,
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

        # Generate JWT access token
        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "role": user.get("role", "INDIVIDUAL"),
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
                "role": "INDIVIDUAL",
                "user_type": "STUDENT",
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
            "role": user.get("role", "INDIVIDUAL"),
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
