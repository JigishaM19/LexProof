import re
import logging
from datetime import datetime, timezone, timedelta
from typing import Tuple, Optional
from app.core.config import settings
from app.core.security import generate_otp_code, hash_otp, verify_otp_hash
from app.core.database import get_database
from app.services.email_service import EmailService
from app.services.sms_service import SMSService

logger = logging.getLogger("LexProof.OTPService")

class OTPService:
    @classmethod
    def normalize_identifier(cls, identifier: str) -> str:
        ident = identifier.strip().lower()
        if re.match(r"^[\d\+\s\-\(\)]+$", ident):
            ident = re.sub(r"[\s\-\(\)]", "", ident)
        return ident

    @classmethod
    def is_email(cls, identifier: str) -> bool:
        return "@" in identifier and "." in identifier

    @classmethod
    async def send_otp(cls, identifier: str, purpose: str = "REGISTRATION", channel: Optional[str] = None) -> Tuple[bool, str, dict]:
        normalized = cls.normalize_identifier(identifier)
        if not normalized:
            return False, "Recipient email or mobile number is required.", {}

        # Validate format
        is_email_channel = cls.is_email(normalized)
        if is_email_channel:
            if not re.match(r"^[^@]+@[^@]+\.[^@]+$", normalized):
                return False, "Please enter a valid email address.", {}
        else:
            digits_only = re.sub(r"\D", "", normalized)
            if len(digits_only) < 10 or len(digits_only) > 15:
                return False, "Please enter a valid 10-digit mobile number.", {}

        db = await get_database()
        otps_col = db["otps"]

        # Check rate-limit cooldown (60 seconds)
        now = datetime.now(timezone.utc)
        existing = await otps_col.find_one({"identifier": normalized, "purpose": purpose})
        if existing:
            last_sent = existing.get("last_sent_at")
            if last_sent:
                # Ensure timezone aware
                if last_sent.tzinfo is None:
                    last_sent = last_sent.replace(tzinfo=timezone.utc)
                elapsed = (now - last_sent).total_seconds()
                cooldown_remaining = max(0, 60 - int(elapsed))
                if cooldown_remaining > 0:
                    return False, f"A code was recently sent. Please wait {cooldown_remaining}s before requesting a new OTP.", {"cooldown_seconds": cooldown_remaining}

        # Generate cryptographically secure numeric OTP
        plain_code = generate_otp_code(6)
        hashed_code = hash_otp(plain_code)
        expires_at = now + timedelta(minutes=10)

        # Dispatch real notification
        if is_email_channel:
            if purpose == "PASSWORD_RESET":
                success, delivery_msg = await EmailService.send_password_reset_otp(normalized, plain_code)
            else:
                success, delivery_msg = await EmailService.send_verification_otp(normalized, plain_code)
        else:
            success, delivery_msg = await SMSService.send_sms_otp(normalized, plain_code)

        if not success:
            logger.warning(f"OTP dispatch failed for {normalized}: {delivery_msg}")
            return False, delivery_msg, {}

        # Persist ONLY the hash in MongoDB (invalidates any previous OTP for this identifier and purpose)
        otp_doc = {
            "identifier": normalized,
            "purpose": purpose,
            "otp_hash": hashed_code,
            "attempts": 0,
            "max_attempts": 5,
            "expires_at": expires_at,
            "last_sent_at": now,
            "is_verified": False,
            "verified_at": None,
            "channel": "EMAIL" if is_email_channel else "MOBILE_SMS"
        }
        await otps_col.update_one(
            {"identifier": normalized, "purpose": purpose},
            {"$set": otp_doc},
            upsert=True
        )

        logger.info(f"OTP hash recorded in MongoDB for identifier: {normalized} (Purpose: {purpose}). Expires in 10 minutes.")

        return True, f"A 6-digit verification code has been dispatched to {identifier}.", {
            "expires_in_minutes": 10,
            "cooldown_seconds": 60,
            "channel": "EMAIL" if is_email_channel else "MOBILE_SMS",
            "delivered_externally": True,
            "delivery_notes": delivery_msg
        }

    @classmethod
    async def resend_otp(cls, identifier: str, purpose: str = "REGISTRATION") -> Tuple[bool, str, dict]:
        return await cls.send_otp(identifier, purpose=purpose)

    @classmethod
    async def verify_otp(cls, identifier: str, otp: str, purpose: str = "REGISTRATION") -> Tuple[bool, str, dict]:
        normalized = cls.normalize_identifier(identifier)
        clean_otp = str(otp).strip()

        if not clean_otp or len(clean_otp) != 6 or not clean_otp.isdigit():
            return False, "Please enter a valid 6-digit verification code.", {"code": "INVALID_FORMAT"}

        db = await get_database()
        otps_col = db["otps"]

        record = await otps_col.find_one({"identifier": normalized, "purpose": purpose})
        if not record:
            return False, "No active verification code found for this account. Please request a new OTP.", {"code": "NOT_FOUND"}

        # Check maximum failed attempts limit (Brute-force defense)
        current_attempts = record.get("attempts", 0)
        max_attempts = record.get("max_attempts", 5)
        if current_attempts >= max_attempts:
            await otps_col.delete_one({"_id": record["_id"]})
            return False, "Too many failed attempts. This code has been invalidated for security. Please request a new OTP.", {"code": "MAX_ATTEMPTS_EXCEEDED"}

        # Check expiry
        now = datetime.now(timezone.utc)
        expires_at = record.get("expires_at")
        if expires_at:
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if now > expires_at:
                await otps_col.delete_one({"_id": record["_id"]})
                return False, "This verification code has expired. Please request a new OTP.", {"code": "EXPIRED"}

        # Verify hash using constant-time comparison
        is_valid = verify_otp_hash(clean_otp, record["otp_hash"])
        if not is_valid:
            new_attempts = current_attempts + 1
            if new_attempts >= max_attempts:
                await otps_col.delete_one({"_id": record["_id"]})
                return False, "Invalid verification code. Maximum attempts exceeded. Please request a new OTP.", {
                    "code": "MAX_ATTEMPTS_EXCEEDED",
                    "remaining_attempts": 0
                }
            
            await otps_col.update_one({"_id": record["_id"]}, {"$set": {"attempts": new_attempts}})
            remaining = max_attempts - new_attempts
            return False, f"Invalid verification code. {remaining} attempt{'s' if remaining != 1 else ''} remaining.", {
                "code": "INVALID_CODE",
                "remaining_attempts": remaining
            }

        # Verification successful: update status
        await otps_col.update_one(
            {"_id": record["_id"]},
            {"$set": {"is_verified": True, "verified_at": now}}
        )
        logger.info(f"OTP successfully verified in MongoDB for identifier: {normalized}")
        return True, "Identity verified successfully.", {
            "verified": True,
            "identifier": normalized
        }

    @classmethod
    async def is_identifier_verified(cls, identifier: str, purpose: str = "REGISTRATION") -> bool:
        normalized = cls.normalize_identifier(identifier)
        db = await get_database()
        otps_col = db["otps"]
        
        record = await otps_col.find_one({
            "identifier": normalized,
            "purpose": purpose,
            "is_verified": True
        })
        if not record:
            return False

        now = datetime.now(timezone.utc)
        expires_at = record.get("expires_at")
        if expires_at:
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if now > expires_at:
                return False

        return True

    @classmethod
    async def consume_verification(cls, identifier: str, purpose: str = "REGISTRATION") -> bool:
        normalized = cls.normalize_identifier(identifier)
        db = await get_database()
        otps_col = db["otps"]
        res = await otps_col.delete_many({"identifier": normalized, "purpose": purpose})
        return res.deleted_count > 0
