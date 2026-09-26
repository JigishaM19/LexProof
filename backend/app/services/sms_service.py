import logging
from typing import Tuple
import httpx
from app.core.config import settings

logger = logging.getLogger("LexProof.SMSService")

class SMSService:
    @classmethod
    async def send_sms_otp(cls, to_mobile: str, otp_code: str) -> Tuple[bool, str]:
        """
        Dispatches real SMS OTP via configured SMS provider.
        If no provider is configured, returns a clear error instead of faking delivery.
        """
        provider = (settings.SMS_PROVIDER or "").strip().lower()

        if not provider:
            msg = "SMS gateway is not configured on this server. Please choose Email OTP verification."
            logger.info(f"SMS dispatch skipped: {msg}")
            return False, msg

        if provider == "twilio":
            account_sid = (settings.TWILIO_ACCOUNT_SID or "").strip()
            auth_token = (settings.TWILIO_AUTH_TOKEN or "").strip()
            from_number = (settings.TWILIO_FROM_NUMBER or "").strip()

            if not account_sid or not auth_token or not from_number:
                msg = "Twilio credentials are incomplete (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_FROM_NUMBER missing)."
                logger.error(msg)
                return False, msg

            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            body_text = f"Your LexProof verification code is {otp_code}. Valid for 10 minutes. Do not share this code."
            
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(
                        url,
                        data={"To": to_mobile, "From": from_number, "Body": body_text},
                        auth=(account_sid, auth_token),
                    )
                    if res.status_code in (200, 201):
                        logger.info("SMS successfully dispatched via Twilio.")
                        return True, "SMS dispatched via Twilio."
                    else:
                        err = f"Twilio returned status {res.status_code}: {res.text}"
                        logger.error(err)
                        return False, err
            except Exception as e:
                logger.error(f"Network error communicating with Twilio: {e}")
                return False, f"SMS delivery failed: {str(e)}"

        return False, f"Unsupported SMS provider: '{provider}'. Please configure a supported provider or use Email OTP."
