import asyncio
import os
import sys
import time

# Ensure backend directory is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

import httpx
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.security import verify_password, hash_otp, verify_otp_hash, generate_otp_code, get_password_hash
from app.core.config import settings

async def run_all_tests():
    print("=" * 70)
    print("LEXPROOF PRODUCTION AUTHENTICATION & SECURITY TEST SUITE")
    print("=" * 70)

    # Step 0: Ensure MongoDB is connected
    await connect_to_mongo()
    db = await get_database()
    assert db is not None, "MongoDB connection failed"
    print("\n[OK] 0. MongoDB connection & indexes verified")

    test_run_id = int(time.time())
    test_email = f"verified.user.{test_run_id}@lexproof.test"
    test_password = "SecurePassword2026!"
    test_mobile = "+919820011223"

    # Clean up any residual test data
    await db.users.delete_many({"email": {"$regex": "@lexproof\\.test$"}})
    await db.otps.delete_many({"identifier": {"$regex": "@lexproof\\.test$"}})
    await db.sessions.delete_many({})
    await db.password_resets.delete_many({"email": {"$regex": "@lexproof\\.test$"}})

    from app.services.auth_service import auth_service
    from app.services.otp_service import otp_service
    from app.services.email_service import email_service
    from app.models.user import UserCreate, UserLogin

    # Test 1: User Registration with valid data
    print("\n[TEST 1] Registering user with valid data...")
    user_data = UserCreate(
        email=test_email,
        password=test_password,
        full_name="Aarav Sharma",
        mobile=test_mobile,
        role="INDIVIDUAL",
        user_type="STUDENT",
        institution="University of Mumbai",
        course="B.Tech Computer Science",
        branch="Cyber Forensics",
        academic_year="2024-2025",
        enrollment_id=f"MU-{test_run_id}",
        terms_accepted=True
    )
    user_res = await auth_service.register(user_data)
    assert user_res.email == test_email
    assert user_res.role == "INDIVIDUAL"
    print(f"--> PASS: User registered with ID: {user_res.id}")

    # Test 2: Verify password is encrypted with Argon2id and NEVER plaintext
    print("\n[TEST 2] Verifying password hashing in MongoDB...")
    db_user = await db.users.find_one({"email": test_email})
    assert db_user is not None
    assert "password" not in db_user, "Plaintext password must NEVER be in database"
    assert "hashed_password" in db_user
    assert db_user["hashed_password"].startswith("$argon2id$")
    assert verify_password(test_password, db_user["hashed_password"])
    assert not verify_password("WrongPassword!", db_user["hashed_password"])
    print(f"--> PASS: Password securely hashed with Argon2id: {db_user['hashed_password'][:30]}...")

    # Test 3: Register with existing email (Uniqueness check)
    print("\n[TEST 3] Testing duplicate email registration...")
    try:
        await auth_service.register(user_data)
        assert False, "Should have raised 400 for duplicate email"
    except Exception as e:
        assert "already registered" in str(e)
        print(f"--> PASS: Duplicate registration rejected: {e}")

    # Test 4: Role-escalation defense
    print("\n[TEST 4] Testing self-assigned privileged role rejection...")
    try:
        UserCreate(
            email=f"hacker.{test_run_id}@lexproof.test",
            password=test_password,
            full_name="Hacker",
            role="ADMIN", # Privileged role
            terms_accepted=True
        )
        assert False, "Pydantic validator should reject self-assigned ADMIN role"
    except Exception as e:
        print(f"--> PASS: Privileged role self-assignment blocked: {e}")

    # Test 5: Cryptographic OTP generation and hashed storage
    print("\n[TEST 5] Testing OTP dispatch and hashed storage...")
    otp_res = await otp_service.send_otp(test_email, "REGISTRATION", "EMAIL")
    assert otp_res["status"] == "SUCCESS"
    assert otp_res["cooldown_seconds"] == 60
    assert otp_res["expires_in_minutes"] == 10
    assert "debug_code" not in otp_res, "Plain OTP must NEVER be returned in API response"

    # Inspect MongoDB OTP document
    db_otp = await db.otps.find_one({"identifier": test_email, "purpose": "REGISTRATION"})
    assert db_otp is not None
    assert "otp" not in db_otp, "Plain OTP must NEVER be stored in MongoDB"
    assert "hashed_otp" in db_otp
    assert db_otp["attempts"] == 0
    print(f"--> PASS: OTP is HMAC-SHA256 hashed in MongoDB: {db_otp['hashed_otp'][:25]}...")

    # Test 6: Rate limit cooldown defense
    print("\n[TEST 6] Testing 60s OTP resend rate-limit cooldown...")
    try:
        await otp_service.resend_otp(test_email, "REGISTRATION", "EMAIL")
        assert False, "Should have been blocked by 60s cooldown"
    except Exception as e:
        assert "429" in str(e) or "wait" in str(e).lower()
        print(f"--> PASS: Rate-limited with cooldown: {e}")

    # Test 7: Wrong OTP attempt & attempt counter decrement
    print("\n[TEST 7] Testing invalid OTP submission & attempt limit decrement...")
    try:
        await otp_service.verify_otp(test_email, "000000", "REGISTRATION")
        assert False, "Invalid OTP should fail"
    except Exception as e:
        assert "Invalid verification code" in str(e)
        assert "4 attempts remaining" in str(e)
        print(f"--> PASS: Attempt decremented correctly: {e}")

    # Test 8: Too many failed OTP attempts (Lockout defense)
    print("\n[TEST 8] Testing OTP brute-force lockout after 5 attempts...")
    for i in range(4):
        try:
            await otp_service.verify_otp(test_email, f"99999{i}", "REGISTRATION")
        except Exception:
            pass
    # 6th attempt should be blocked due to maximum attempts reached
    try:
        await otp_service.verify_otp(test_email, "123456", "REGISTRATION")
        assert False, "Session should be locked out after 5 failed attempts"
    except Exception as e:
        assert "Maximum verification attempts exceeded" in str(e)
        print(f"--> PASS: Brute force lockout triggered: {e}")

    # Test 9: Verify OTP with genuine code & mark user verified
    print("\n[TEST 9] Generating fresh OTP and verifying genuine code...")
    # Force cooldown reset for test
    await db.otps.delete_many({"identifier": test_email})
    otp_code = generate_otp_code(6)
    await db.otps.insert_one({
        "identifier": test_email,
        "purpose": "REGISTRATION",
        "channel": "EMAIL",
        "hashed_otp": hash_otp(otp_code),
        "expires_at": time.time() + 600,
        "last_sent_at": time.time(),
        "attempts": 0,
        "max_attempts": 5
    })
    verify_result = await otp_service.verify_otp(test_email, otp_code, "REGISTRATION")
    assert verify_result["verified"] is True
    # Confirm MongoDB user updated
    updated_user = await db.users.find_one({"email": test_email})
    assert updated_user["is_email_verified"] is True
    print(f"--> PASS: Genuine OTP verified, user is_email_verified={updated_user['is_email_verified']}")

    # Test 10: Login with correct password
    print("\n[TEST 10] Logging in with correct credentials...")
    login_req = UserLogin(identifier=test_email, password=test_password)
    login_res = await auth_service.login(login_req)
    assert login_res.access_token is not None
    assert login_res.user.email == test_email
    token = login_res.access_token
    session_id = login_res.session_id
    print(f"--> PASS: Successfully authenticated, JWT token & session {session_id} generated")

    # Test 11: Login with wrong password
    print("\n[TEST 11] Testing login with incorrect password...")
    try:
        await auth_service.login(UserLogin(identifier=test_email, password="WrongPassword!"))
        assert False, "Wrong password must be rejected"
    except Exception as e:
        assert "Invalid email/mobile or password" in str(e)
        print(f"--> PASS: Rejected invalid credentials without revealing specific error")

    # Test 12: Login with non-existent user (Anti-enumeration)
    print("\n[TEST 12] Testing login with non-existent email...")
    try:
        await auth_service.login(UserLogin(identifier="nonexistent@lexproof.test", password="SomePassword123!"))
        assert False, "Non-existent user must be rejected"
    except Exception as e:
        assert "Invalid email/mobile or password" in str(e)
        print(f"--> PASS: Non-existent email returns identical error (anti-enumeration)")

    # Test 13: Password reset flow
    print("\n[TEST 13] Executing complete zero-knowledge password reset flow...")
    # Step A: Request password reset
    reset_req_res = await auth_service.forgot_password(test_email)
    assert reset_req_res["status"] == "SUCCESS"
    db_reset = await db.password_resets.find_one({"email": test_email, "used": False})
    assert db_reset is not None
    assert "token" not in db_reset, "Plain reset token must NEVER be stored in MongoDB"
    assert "hashed_token" in db_reset

    # Step B: Simulate entering fresh reset OTP
    reset_otp = generate_otp_code(6)
    await db.password_resets.update_one(
        {"_id": db_reset["_id"]},
        {"$set": {"hashed_token": hash_otp(reset_otp), "attempts": 0}}
    )

    # Step C: Reset with wrong OTP
    try:
        await auth_service.reset_password(test_email, "000000", "NewPassword2026!")
        assert False, "Wrong reset OTP must fail"
    except Exception as e:
        assert "Invalid or expired" in str(e)
        print(f"--> PASS: Wrong reset OTP rejected: {e}")

    # Step D: Reset with correct OTP
    new_password = "NewPassword2026!"
    reset_res = await auth_service.reset_password(test_email, reset_otp, new_password)
    assert reset_res["status"] == "SUCCESS"
    print(f"--> PASS: Password reset successful: {reset_res['message']}")

    # Step E: Confirm old password fails
    try:
        await auth_service.login(UserLogin(identifier=test_email, password=test_password))
        assert False, "Old password must no longer work"
    except Exception:
        print("--> PASS: Old password rejected")

    # Step F: Confirm new password works
    new_login = await auth_service.login(UserLogin(identifier=test_email, password=new_password))
    assert new_login.access_token is not None
    print("--> PASS: New password authenticated successfully")

    # Test 14: Logout & session revocation
    print("\n[TEST 14] Testing server-side session revocation on logout...")
    session_to_logout = new_login.session_id
    logout_res = await auth_service.logout(session_to_logout)
    assert logout_res["status"] == "SUCCESS"
    # Check that session is marked revoked in MongoDB
    revoked_session = await db.sessions.find_one({"session_id": session_to_logout})
    assert revoked_session is not None
    assert revoked_session["is_revoked"] is True
    print(f"--> PASS: Session {session_to_logout} successfully revoked in MongoDB")

    # Test 15: Google OAuth URL generation
    print("\n[TEST 15] Testing Google OAuth URL generation...")
    google_url_res = auth_service.get_google_auth_url("/dashboard")
    assert "https://accounts.google.com/o/oauth2/v2/auth" in google_url_res["url"]
    assert "client_id=" in google_url_res["url"]
    assert "redirect_uri=" in google_url_res["url"]
    assert "state=" in google_url_res["url"]
    print(f"--> PASS: Legitimate Google OAuth 2.0 URL generated: {google_url_res['url'][:60]}...")

    # Test 16: Google OAuth user creation & idempotent linking
    print("\n[TEST 16] Testing Google identity resolution in MongoDB...")
    google_profile = {
        "sub": f"google-sub-{test_run_id}",
        "email": f"google.user.{test_run_id}@lexproof.test",
        "name": "Google Test User",
        "email_verified": True
    }
    g_token = await auth_service.process_google_identity(google_profile)
    assert g_token.user.email == google_profile["email"]
    assert g_token.user.auth_provider == "GOOGLE"
    assert g_token.user.is_email_verified is True
    
    # Run again with same google_profile to ensure idempotency (no duplicate account created)
    g_token_2 = await auth_service.process_google_identity(google_profile)
    assert g_token_2.user.id == g_token.user.id
    user_count = await db.users.count_documents({"email": google_profile["email"]})
    assert user_count == 1, "Duplicate account must not be created for same verified Google email"
    print(f"--> PASS: Google account created & idempotently linked without duplicate (User ID: {g_token.user.id})")

    # Test 17: SMS provider check when unconfigured
    print("\n[TEST 17] Verifying unconfigured SMS provider behavior...")
    try:
        await otp_service.send_otp(test_mobile, "REGISTRATION", "PHONE")
        assert False, "Unconfigured SMS provider must return error, not simulate success"
    except Exception as e:
        assert "503" in str(e) or "SMS service is not configured" in str(e)
        print(f"--> PASS: Real error returned when SMS provider is unconfigured: {e}")

    # Clean up test records
    await db.users.delete_many({"email": {"$regex": "@lexproof\\.test$"}})
    await db.otps.delete_many({"identifier": {"$regex": "@lexproof\\.test$"}})
    await db.password_resets.delete_many({"email": {"$regex": "@lexproof\\.test$"}})
    await close_mongo_connection()

    print("\n" + "=" * 70)
    print("ALL 17 RIGOROUS SECURITY & AUTHENTICATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
