import urllib.parse
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from fastapi.responses import RedirectResponse
import httpx
from app.models.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SendOtpRequest,
    VerifyOtpRequest,
)
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_database
from app.core.security import generate_secure_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    try:
        user = await AuthService.register_user(user_in)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed. Please try again.")

@router.post("/login", response_model=TokenResponse)
async def login(login_in: UserLogin, response: Response):
    try:
        token_resp = await AuthService.authenticate_user(login_in)
        # Set secure HTTP-only session cookie
        response.set_cookie(
            key="LexProof_token",
            value=token_resp.access_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/"
        )
        return token_resp
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Authentication failed.")

@router.post("/logout")
async def logout(response: Response, current_user: UserResponse = Depends(get_current_user)):
    await AuthService.logout_user(current_user.id)
    # Clear HTTP-only session cookie
    response.delete_cookie(
        key="LexProof_token",
        path="/",
        samesite=settings.COOKIE_SAMESITE
    )
    return {"status": "SUCCESS", "message": "Logged out successfully."}

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.post("/send-otp")
async def send_otp(req: SendOtpRequest):
    identifier = req.identifier.strip()
    purpose = req.purpose or "REGISTRATION"

    if not identifier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address or mobile number is required.")

    success, message, meta = await OTPService.send_otp(identifier, purpose=purpose, channel=req.channel)
    if not success:
        status_code = status.HTTP_429_TOO_MANY_REQUESTS if "cooldown_seconds" in meta else status.HTTP_400_BAD_REQUEST
        if "not configured" in message.lower():
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        raise HTTPException(status_code=status_code, detail=message)

    return {
        "status": "SUCCESS",
        "message": message,
        "expires_in_minutes": meta.get("expires_in_minutes", 10),
        "cooldown_seconds": meta.get("cooldown_seconds", 60),
        "channel": meta.get("channel"),
        "delivered_externally": True,
        "delivery_notes": meta.get("delivery_notes")
    }

@router.post("/resend-otp")
async def resend_otp(req: SendOtpRequest):
    identifier = req.identifier.strip()
    purpose = req.purpose or "REGISTRATION"

    if not identifier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address or mobile number is required.")

    success, message, meta = await OTPService.resend_otp(identifier, purpose=purpose)
    if not success:
        status_code = status.HTTP_429_TOO_MANY_REQUESTS if "cooldown_seconds" in meta else status.HTTP_400_BAD_REQUEST
        if "not configured" in message.lower():
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        raise HTTPException(status_code=status_code, detail=message)

    return {
        "status": "SUCCESS",
        "message": message,
        "expires_in_minutes": meta.get("expires_in_minutes", 10),
        "cooldown_seconds": meta.get("cooldown_seconds", 60),
        "channel": meta.get("channel"),
        "delivered_externally": True,
        "delivery_notes": meta.get("delivery_notes")
    }

@router.post("/verify-otp")
async def verify_otp(req: VerifyOtpRequest):
    identifier = req.identifier.strip()
    otp = str(req.otp).strip()

    if not identifier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address or mobile number is required.")
    if not otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please enter your 6-digit verification code.")

    success, message, meta = await OTPService.verify_otp(identifier, otp)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return {
        "status": "SUCCESS",
        "message": message,
        "identifier": identifier,
        "verified": True
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    success, message = await AuthService.request_password_reset(req.email)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"status": "SUCCESS", "message": message}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    success, message = await AuthService.reset_password(req.email, req.otp, req.new_password)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"status": "SUCCESS", "message": message}

# ==============================================================================
# Google OAuth 2.0 / OpenID Connect Endpoints (Real Google Authentication)
# ==============================================================================

@router.get("/google/url")
async def get_google_auth_url(redirect: Optional[str] = "/dashboard"):
    client_id = (settings.GOOGLE_CLIENT_ID or "").strip()
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth credentials are not configured on this server."
        )

    # Generate secure state token
    state = generate_secure_token(32)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=15)

    db = await get_database()
    await db["oauth_states"].insert_one({
        "state": state,
        "target_redirect": redirect or "/dashboard",
        "created_at": now,
        "expires_at": expires_at
    })

    params = {
        "client_id": client_id,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account"
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {"url": auth_url}

@router.get("/google/callback")
async def google_oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None
):
    if error:
        login_err_url = f"{settings.FRONTEND_URL}/login?error={urllib.parse.quote(f'Google authentication failed: {error}')}"
        return RedirectResponse(url=login_err_url)

    if not code or not state:
        login_err_url = f"{settings.FRONTEND_URL}/login?error={urllib.parse.quote('Invalid authorization code or state received from Google.')}"
        return RedirectResponse(url=login_err_url)

    db = await get_database()
    oauth_states_col = db["oauth_states"]
    state_doc = await oauth_states_col.find_one({"state": state})

    if not state_doc:
        login_err_url = f"{settings.FRONTEND_URL}/login?error={urllib.parse.quote('OAuth session expired or invalid state. Please try again.')}"
        return RedirectResponse(url=login_err_url)

    # Consume state token to prevent replay attacks
    await oauth_states_col.delete_one({"_id": state_doc["_id"]})
    target_redirect = state_doc.get("target_redirect", "/dashboard")

    # Exchange authorization code for tokens
    client_id = (settings.GOOGLE_CLIENT_ID or "").strip()
    client_secret = (settings.GOOGLE_CLIENT_SECRET or "").strip()

    if not client_id or not client_secret:
        login_err_url = f"{settings.FRONTEND_URL}/login?error={urllib.parse.quote('Google OAuth credentials not configured on backend.')}"
        return RedirectResponse(url=login_err_url)

    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            token_res = await client.post(token_url, data=token_payload)
            if token_res.status_code != 200:
                err_detail = token_res.text
                login_err_url = f"{settings.FRONTEND_URL}/login?error={urllib.parse.quote(f'Google token exchange failed: {err_detail}')}"
                return RedirectResponse(url=login_err_url)

            token_data = token_res.json()
            access_token_google = token_data.get("access_token")

            # Fetch user profile using Google's userinfo endpoint
            userinfo_res = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token_google}"}
            )
            if userinfo_res.status_code != 200:
                login_err_url = f"{settings.FRONTEND_URL}/login?error={urllib.parse.quote('Could not retrieve user info from Google.')}"
                return RedirectResponse(url=login_err_url)

            google_user_info = userinfo_res.json()

        # Handle user in MongoDB
        app_access_token, user_resp = await AuthService.handle_google_user(google_user_info)

        user_role = (user_resp.role or "INDIVIDUAL").upper()
        if not target_redirect or target_redirect == "/dashboard":
            target_redirect = "/organization" if user_role == "ORGANIZATION" else "/individual"

        # Redirect user to frontend login route with token & intended destination
        login_dest = f"{settings.FRONTEND_URL}/login?token={urllib.parse.quote(app_access_token)}&redirect={urllib.parse.quote(target_redirect)}"
        redirect_response = RedirectResponse(url=login_dest, status_code=status.HTTP_302_FOUND)

        # Set secure HTTP-only cookie
        redirect_response.set_cookie(
            key="LexProof_token",
            value=app_access_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/"
        )
        return redirect_response

    except Exception as e:
        login_err_url = f"{settings.FRONTEND_URL}/login?error={urllib.parse.quote(f'Authentication error: {str(e)}')}"
        return RedirectResponse(url=login_err_url)
