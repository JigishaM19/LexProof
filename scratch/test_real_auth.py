import asyncio
import time
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.models.user import UserCreate, UserLogin
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService
from app.core.security import verify_password, hash_otp, verify_otp_hash

async def run_auth_verification():
    print("=" * 60)
    print("STARTING LEXPROOF REAL AUTHENTICATION & MONGODB VERIFICATION")
    print("=" * 60)

    # 1. Connect to MongoDB
    await connect_to_mongo()
    db = await get_database()
    print("[PASS] 1. Connected to MongoDB database:", db.name)

    # Clean test collections
    test_email = "techtitans2426@gmail.com"
    test_mobile = "9876543210"
    test_password = "StrongPassword2026!"

    await db["users"].delete_many({"$or": [{"email": test_email}, {"mobile": test_mobile}]})
    await db["otps"].delete_many({"identifier": test_email})
    await db["sessions"].delete_many({})
    await db["password_resets"].delete_many({"identifier": test_email})

    # 2. OTP Generation & Secure Hash Storage
    print("\n[TEST 2] Testing OTP generation and secure hashing...")
    success, msg, meta = await OTPService.send_otp(test_email, purpose="REGISTRATION", channel="EMAIL")
    assert success, f"Failed to send OTP: {msg}"
    print(f"[PASS] 2. OTP dispatch returned: {msg}")

    # Verify that MongoDB stores ONLY the hash, NOT plain code
    otp_doc = await db["otps"].find_one({"identifier": test_email, "purpose": "REGISTRATION"})
    assert otp_doc is not None, "OTP document not found in MongoDB"
    assert "otp_hash" in otp_doc, "otp_hash missing from OTP document"
    assert "code" not in otp_doc, "SECURITY FAILURE: Plain code found in OTP document!"
    assert len(otp_doc["otp_hash"]) == 64, "otp_hash should be 64-char hex SHA-256"
    print("[PASS] 2b. Verified: Raw OTP is NOT in MongoDB; only 64-character hash is persisted.")

    # 3. Rate-limit cooldown test
    print("\n[TEST 3] Testing 60-second cooldown rate limit on resend...")
    resend_success, resend_msg, resend_meta = await OTPService.resend_otp(test_email, purpose="REGISTRATION")
    assert not resend_success, "Expected resend to fail during cooldown"
    assert "cooldown_seconds" in resend_meta, "Cooldown seconds missing from meta"
    print(f"[PASS] 3. Cooldown rate limit enforced: '{resend_msg}'")

    # 4. Brute-force protection test
    print("\n[TEST 4] Testing invalid OTP attempts...")
    v_succ, v_msg, v_meta = await OTPService.verify_otp(test_email, "000000", purpose="REGISTRATION")
    assert not v_succ, "Invalid OTP was accepted!"
    assert "4 attempts remaining" in v_msg, f"Expected 4 attempts remaining, got: {v_msg}"
    print(f"[PASS] 4. Failed attempt counted: '{v_msg}'")

    # 5. Correct OTP Verification using stored hash
    # To verify the genuine verification pathway: find what code hashes to the stored hash
    # We test the verification logic directly with a known test code:
    print("\n[TEST 5] Testing valid OTP hash verification...")
    known_code = "654321"
    known_hash = hash_otp(known_code)
    await db["otps"].update_one(
        {"identifier": test_email, "purpose": "REGISTRATION"},
        {"$set": {"otp_hash": known_hash, "attempts": 0}}
    )
    v_succ, v_msg, v_meta = await OTPService.verify_otp(test_email, known_code, purpose="REGISTRATION")
    assert v_succ, f"Verification failed with genuine code: {v_msg}"
    assert await OTPService.is_identifier_verified(test_email, purpose="REGISTRATION"), "Identifier not marked verified"
    print(f"[PASS] 5. Genuine OTP verified in MongoDB: '{v_msg}'")

    # 6. User Registration in MongoDB
    print("\n[TEST 6] Registering user in MongoDB...")
    user_in = UserCreate(
        email=test_email,
        full_name="Vikramaditya Sharma",
        password=test_password,
        mobile=test_mobile,
        role="INDIVIDUAL",
        user_type="STUDENT",
        institution="University of Mumbai",
        course="B.Tech Computer Engineering",
        academic_year="2025"
    )
    user_resp = await AuthService.register_user(user_in)
    assert user_resp.email == test_email
    assert user_resp.is_email_verified is True
    print(f"[PASS] 6. User successfully registered in MongoDB with ID: {user_resp.id}")

    # Check MongoDB document directly
    db_user = await db["users"].find_one({"email": test_email})
    assert db_user is not None
    assert db_user["password_hash"] != test_password, "SECURITY FAILURE: Password stored in plaintext!"
    assert verify_password(test_password, db_user["password_hash"]), "Argon2 password verification failed!"
    print("[PASS] 6b. Password securely hashed with Argon2id; plain password verified.")

    # 7. Duplicate Registration Rejection
    print("\n[TEST 7] Testing duplicate registration rejection...")
    try:
        await AuthService.register_user(user_in)
        assert False, "Duplicate registration should have raised an exception!"
    except ValueError as e:
        print(f"[PASS] 7. Duplicate registration correctly blocked: '{e}'")

    # 8. User Login with Correct Password
    print("\n[TEST 8] Logging in with genuine credentials...")
    login_in = UserLogin(identifier=test_email, password=test_password)
    token_resp = await AuthService.authenticate_user(login_in)
    assert token_resp.access_token is not None
    token = token_resp.access_token
    print(f"[PASS] 8. Login successful! JWT Access Token generated.")

    # 9. User Login with Incorrect Password
    print("\n[TEST 9] Logging in with wrong password...")
    try:
        await AuthService.authenticate_user(UserLogin(identifier=test_email, password="WrongPassword!"))
        assert False, "Login with wrong password should have failed!"
    except ValueError as e:
        print(f"[PASS] 9. Rejected invalid credentials: '{e}'")

    # 10. Login with Mobile Number
    print("\n[TEST 10] Logging in with mobile number identifier...")
    token_resp_mobile = await AuthService.authenticate_user(UserLogin(identifier=test_mobile, password=test_password))
    assert token_resp_mobile.access_token is not None
    assert token_resp_mobile.user.email == test_email
    print(f"[PASS] 10. Login with mobile number succeeded!")

    # 11. Password Reset Flow
    print("\n[TEST 11] Testing password reset flow...")
    req_succ, req_msg = await AuthService.request_password_reset(test_email)
    assert req_succ
    print(f"[PASS] 11a. Password reset requested: '{req_msg}'")

    # Set known reset OTP hash
    reset_code = "789012"
    reset_hash = hash_otp(reset_code)
    await db["otps"].update_one(
        {"identifier": test_email, "purpose": "PASSWORD_RESET"},
        {"$set": {"otp_hash": reset_hash, "attempts": 0}}
    )
    new_password = "NewSecurePassword2026!"
    reset_succ, reset_msg = await AuthService.reset_password(test_email, reset_code, new_password)
    assert reset_succ
    print(f"[PASS] 11b. Password reset completed: '{reset_msg}'")

    # Verify old password no longer works
    try:
        await AuthService.authenticate_user(UserLogin(identifier=test_email, password=test_password))
        assert False, "Old password should no longer work!"
    except ValueError:
        print("[PASS] 11c. Old password successfully invalidated.")

    # Verify new password works
    token_resp_new = await AuthService.authenticate_user(UserLogin(identifier=test_email, password=new_password))
    assert token_resp_new.access_token is not None
    print("[PASS] 11d. Login with new password succeeded!")

    # 12. Google OAuth User Handling
    print("\n[TEST 12] Testing Google OAuth identity linking & user creation...")
    google_test_payload = {
        "email": f"google.user.{int(time.time())}@example.com",
        "name": "Google Verified Tester",
        "sub": "google-oauth2|98765432109876",
        "email_verified": True
    }
    g_token, g_user = await AuthService.handle_google_user(google_test_payload)
    assert g_user.auth_provider == "google"
    assert g_user.is_email_verified is True
    print(f"[PASS] 12. Google OAuth account created & authenticated in MongoDB for: {g_user.email}")

    # Clean up test accounts
    await db["users"].delete_many({"email": {"$in": [test_email, google_test_payload["email"]]}})
    await db["otps"].delete_many({"identifier": {"$in": [test_email, google_test_payload["email"]]}})

    await close_mongo_connection()
    print("\n" + "=" * 60)
    print("ALL 12 CORE AUTHENTICATION & MONGODB TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_auth_verification())
