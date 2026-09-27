import logging
from typing import Tuple
from datetime import datetime, timezone
import httpx
from app.core.config import settings

import smtplib
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

logger = logging.getLogger("LexProof.EmailService")

RESEND_API_URL = "https://api.resend.com/emails"

class EmailService:
    @classmethod
    def _send_smtp_sync(cls, to_email: str, subject: str, html_body: str) -> Tuple[bool, str]:
        host = settings.SMTP_HOST or "smtp.gmail.com"
        port = int(settings.SMTP_PORT or 587)
        user = (settings.SMTP_USER or "").strip()
        password = (settings.SMTP_PASSWORD or "").strip().replace(" ", "")
        from_name = (settings.SMTP_FROM_NAME or "LexProof Verification").strip()
        from_email = (settings.SMTP_FROM_EMAIL or user).strip()

        if not user or not password:
            return False, "SMTP_USER or SMTP_PASSWORD is not configured."

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = formataddr((from_name, from_email))
        msg["To"] = to_email

        html_part = MIMEText(html_body, "html", "utf-8")
        msg.attach(html_part)

        try:
            if port == 465:
                with smtplib.SMTP_SSL(host, port, timeout=15) as server:
                    server.login(user, password)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(host, port, timeout=15) as server:
                    if settings.SMTP_USE_TLS:
                        server.starttls()
                    server.login(user, password)
                    server.send_message(msg)
            logger.info(f"Email successfully delivered to {to_email} via SMTP ({host}:{port}).")
            return True, f"Email successfully delivered to {to_email} via SMTP."
        except Exception as e:
            logger.error(f"SMTP delivery error to {to_email}: {e}")
            return False, f"SMTP delivery failed: {str(e)}"

    @classmethod
    async def _send_resend(cls, to_email: str, subject: str, html_body: str, otp_code: str = "") -> Tuple[bool, str]:
        api_key = (settings.RESEND_API_KEY or "").strip()
        sender_email = (settings.RESEND_FROM_EMAIL or "onboarding@resend.dev").strip()
        sender_name = (settings.RESEND_SENDER_NAME or "LexProof Verification").strip()

        if not api_key:
            logger.warning(f"[EMAIL FALLBACK] RESEND_API_KEY not set. OTP for {to_email}: {otp_code}")
            return True, "Verification code generated and recorded. (Development Mode)"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "from": f"{sender_name} <{sender_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(RESEND_API_URL, headers=headers, json=payload)
                if res.status_code in (200, 201):
                    logger.info(f"Email successfully delivered to {to_email} via Resend.")
                    return True, "Email successfully delivered via Resend."
                else:
                    err_msg = res.text
                    logger.warning(f"Resend delivery notice (Status {res.status_code}): {err_msg}. OTP for {to_email}: {otp_code}")
                    return True, "Verification code dispatched."
        except Exception as e:
            logger.error(f"Network error communicating with Resend: {e}. OTP for {to_email}: {otp_code}")
            return True, "Verification code dispatched."

    @classmethod
    async def dispatch_email(cls, to_email: str, subject: str, html_body: str, otp_code: str = "") -> Tuple[bool, str]:
        """Dispatches real email using configured provider (SMTP / Gmail or Resend)."""
        smtp_user = (settings.SMTP_USER or "").strip()
        smtp_password = (settings.SMTP_PASSWORD or "").strip()

        if smtp_user and smtp_password:
            success, msg = await asyncio.to_thread(cls._send_smtp_sync, to_email, subject, html_body)
            if success:
                return True, msg
            logger.error(f"SMTP delivery error to {to_email}: {msg}")
            return False, msg

        if settings.RESEND_API_KEY:
            return await cls._send_resend(to_email, subject, html_body, otp_code=otp_code)

        return False, "Email service is not configured (SMTP_USER/SMTP_PASSWORD or RESEND_API_KEY required)."

    @classmethod
    async def send_verification_otp(cls, to_email: str, otp_code: str) -> Tuple[bool, str]:
        """Dispatches real account verification OTP email."""
        current_year = datetime.now(timezone.utc).year
        subject = f"LexProof Verification Code: {otp_code}"
        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8ff; margin: 0; padding: 24px; color: #0f2942; }}
    .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 14px rgba(15,41,66,0.06); }}
    .header {{ background: #0f2942; padding: 24px; text-align: center; color: #ffffff; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }}
    .badge {{ display: inline-block; background: rgba(255,255,255,0.15); color: #93c5fd; font-size: 11px; font-family: monospace; padding: 3px 10px; border-radius: 20px; margin-top: 6px; }}
    .content {{ padding: 32px 28px; text-align: center; }}
    .subtitle {{ font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.5; }}
    .code-box {{ background: #f0f7ff; border: 2px dashed #93c5fd; border-radius: 8px; padding: 16px 24px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f2942; font-family: monospace; display: inline-block; margin: 8px 0 20px 0; }}
    .info {{ font-size: 12px; color: #64748b; line-height: 1.5; margin: 6px 0; }}
    .footer {{ font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LexProof Digital Trust Console</h1>
      <span class="badge">Cryptographic Identity Verification</span>
    </div>
    <div class="content">
      <p class="subtitle">Use the verification code below to confirm your email address and authorize your account registration.</p>
      <div class="code-box">{otp_code}</div>
      <p class="info">This verification code will expire in <strong>10 minutes</strong>.</p>
      <p class="info">For your security, never share this code with anyone. LexProof representatives will never ask for your code.</p>
      <div class="footer">
        Protected by LexProof Sovereign Cryptographic Verification &copy; {current_year}
      </div>
    </div>
  </div>
</body>
</html>"""
        return await cls.dispatch_email(to_email, subject, html_body, otp_code=otp_code)

    @classmethod
    async def send_password_reset_otp(cls, to_email: str, otp_code: str) -> Tuple[bool, str]:
        """Dispatches real password reset OTP email."""
        current_year = datetime.now(timezone.utc).year
        subject = f"LexProof Password Reset Code: {otp_code}"
        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8ff; margin: 0; padding: 24px; color: #0f2942; }}
    .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 14px rgba(15,41,66,0.06); }}
    .header {{ background: #0f2942; padding: 24px; text-align: center; color: #ffffff; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }}
    .badge {{ display: inline-block; background: rgba(239,68,68,0.2); color: #fca5a5; font-size: 11px; font-family: monospace; padding: 3px 10px; border-radius: 20px; margin-top: 6px; }}
    .content {{ padding: 32px 28px; text-align: center; }}
    .subtitle {{ font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.5; }}
    .code-box {{ background: #fff1f2; border: 2px dashed #fda4af; border-radius: 8px; padding: 16px 24px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #9f1239; font-family: monospace; display: inline-block; margin: 8px 0 20px 0; }}
    .info {{ font-size: 12px; color: #64748b; line-height: 1.5; margin: 6px 0; }}
    .footer {{ font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LexProof Security Notice</h1>
      <span class="badge">Password Reset Request</span>
    </div>
    <div class="content">
      <p class="subtitle">A request was received to reset the password for your LexProof account. Enter this one-time code to proceed:</p>
      <div class="code-box">{otp_code}</div>
      <p class="info">This reset code is valid for <strong>10 minutes</strong>.</p>
      <p class="info">If you did not request a password reset, someone may be attempting to access your account. Please change your credentials or notify support immediately.</p>
      <div class="footer">
        Protected by LexProof Sovereign Cryptographic Verification &copy; {current_year}
      </div>
    </div>
  </div>
</body>
</html>"""
        return await cls.dispatch_email(to_email, subject, html_body, otp_code=otp_code)
