from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List, Callable
from app.core.security import decode_access_token
from app.services.auth_service import AuthService
from app.models.user import UserResponse
from app.core.database import get_database

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> UserResponse:
    token: Optional[str] = None

    # Method 1: Check Authorization header
    if credentials and credentials.credentials:
        token = credentials.credentials
    
    # Method 2: Check HTTP-only cookie (LexProof_token)
    if not token:
        token = request.cookies.get("LexProof_token")

    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if session was revoked in database
    session_id = payload.get("session_id")
    if session_id:
        db = await get_database()
        session_record = await db["sessions"].find_one({"token_id": session_id})
        if session_record and session_record.get("is_revoked"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This session has been revoked. Please sign in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    user = await AuthService.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.account_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Please contact support.",
        )

    return user

async def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[UserResponse]:
    token: Optional[str] = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    if not token:
        token = request.cookies.get("LexProof_token")

    if not token:
        return None

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None

    try:
        user = await AuthService.get_user_by_id(payload["sub"])
        if user and user.account_status == "ACTIVE":
            return user
    except Exception:
        pass
    return None

def require_role(allowed_roles: List[str]) -> Callable:
    """RBAC dependency ensuring the authenticated user possesses an allowed role."""
    async def role_checker(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        user_role = (current_user.role or "").upper()
        normalized_allowed = [r.upper() for r in allowed_roles]
        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}."
            )
        return current_user
    return role_checker

async def require_verified_user(
    current_user: UserResponse = Depends(get_current_user)
) -> UserResponse:
    """Dependency verifying the user has at least one confirmed identity channel."""
    if not current_user.is_email_verified and not current_user.is_mobile_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account identity is not verified. Please complete email or phone verification."
        )
    return current_user
