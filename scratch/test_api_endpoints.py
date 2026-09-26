import httpx
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"

def run_tests():
    print("=" * 70)
    print("LEXPROOF LIVE FASTAPI HTTP ENDPOINT & SESSION SECURITY TEST")
    print("=" * 70)

    client = httpx.Client(timeout=15.0)
    timestamp = int(time.time())

    # 1. Health check
    print("\n[TEST 1] Testing /health endpoint...")
    r = client.get("http://localhost:8000/health")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    health_data = r.json()
    assert health_data["status"] == "healthy"
    assert "MongoDB connected" in health_data["database"]
    print(f"--> PASS: Health check: {health_data}")

    # 2. Register new user
    test_email = f"http.tester.{timestamp}@lexproof.org"
    test_mobile = f"+9198{str(timestamp)[-8:]}"
    test_password = "LiveHttpPassword2026!"

    print(f"\n[TEST 2] Registering user {test_email} via HTTP POST /auth/register...")
    reg_payload = {
        "email": test_email,
        "password": test_password,
        "full_name": "Divya Kulkarni",
        "mobile": test_mobile,
        "role": "INDIVIDUAL",
        "user_type": "STUDENT",
        "institution": "University of Mumbai",
        "course": "B.Tech Computer Science",
        "academic_year": "2024-2025",
        "terms_accepted": True
    }
    r = client.post(f"{BASE_URL}/auth/register", json=reg_payload)
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
    user_res = r.json()
    assert user_res["email"] == test_email
    assert user_res["role"] == "INDIVIDUAL"
    print(f"--> PASS: Registered successfully with ID: {user_res['id']}")

    # 3. Duplicate registration rejection
    print("\n[TEST 3] Testing duplicate registration rejection...")
    r = client.post(f"{BASE_URL}/auth/register", json=reg_payload)
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
    assert "already exists" in r.text
    print(f"--> PASS: Duplicate email rejected: {r.json().get('detail')}")

    # 4. Weak password validation
    print("\n[TEST 4] Testing password length validation (< 8 chars)...")
    weak_payload = {**reg_payload, "email": f"weak.{timestamp}@lexproof.org", "password": "short"}
    r = client.post(f"{BASE_URL}/auth/register", json=weak_payload)
    assert r.status_code == 422, f"Expected 422, got {r.status_code}"
    print(f"--> PASS: Rejected weak password with 422 Unprocessable Entity")

    # 5. Login with correct credentials
    print(f"\n[TEST 5] Logging in via POST /auth/login with password...")
    login_payload = {"identifier": test_email, "password": test_password}
    r = client.post(f"{BASE_URL}/auth/login", json=login_payload)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    login_data = r.json()
    assert "access_token" in login_data
    token = login_data["access_token"]
    
    # Check that HTTP-only cookie was set
    set_cookie_header = r.headers.get("set-cookie", "")
    assert "LexProof_token=" in set_cookie_header
    assert "HttpOnly" in set_cookie_header or "httponly" in set_cookie_header
    print(f"--> PASS: Authenticated successfully! Token received, Set-Cookie present with HttpOnly.")

    # 6. Login with wrong password
    print("\n[TEST 6] Testing login with wrong password...")
    r = client.post(f"{BASE_URL}/auth/login", json={"identifier": test_email, "password": "WrongPassword!"})
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    assert r.json().get("detail") == "Invalid email/mobile or password."
    print("--> PASS: Wrong password rejected with 401 (Generic error message)")

    # 7. Authenticated /auth/me with Bearer token
    print("\n[TEST 7] Testing GET /auth/me with Bearer token...")
    r = client.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    assert r.json()["email"] == test_email
    print(f"--> PASS: Bearer authentication verified for: {r.json()['full_name']}")

    # 8. Authenticated /auth/me with LexProof_token Cookie
    print("\n[TEST 8] Testing GET /auth/me using HTTP Cookie without Authorization header...")
    r = client.get(f"{BASE_URL}/auth/me", cookies={"LexProof_token": token})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    assert r.json()["email"] == test_email
    print(f"--> PASS: HTTP Cookie authentication verified!")

    # 9. Protected routes without token
    print("\n[TEST 9] Testing unauthenticated access to protected APIs...")
    unauth_client = httpx.Client(timeout=10.0)
    r = unauth_client.get(f"{BASE_URL}/auth/me")
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    r_cases = unauth_client.get(f"{BASE_URL}/cases")
    assert r_cases.status_code == 401, f"Expected 401, got {r_cases.status_code}"
    print("--> PASS: Protected routes correctly reject unauthenticated requests with 401")

    # 10. Protected routes with token
    print("\n[TEST 10] Testing authenticated access to /cases with Bearer token...")
    r_cases_auth = client.get(f"{BASE_URL}/cases", headers={"Authorization": f"Bearer {token}"})
    assert r_cases_auth.status_code == 200
    print(f"--> PASS: Protected /cases endpoint accessible: {len(r_cases_auth.json())} cases returned")

    # 11. OTP Dispatch (Email via Resend)
    print(f"\n[TEST 11] Testing POST /auth/send-otp (Email channel via Resend to account owner)...")
    resend_target = "techtitans2426@gmail.com"
    r = client.post(f"{BASE_URL}/auth/send-otp", json={"identifier": resend_target, "purpose": "REGISTRATION", "channel": "EMAIL"})
    if r.status_code == 429:
        print(f"--> PASS: Rate limiter active from previous test: {r.json().get('detail')}")
    else:
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        otp_data = r.json()
        assert otp_data["status"] == "SUCCESS"
        assert "debug_code" not in otp_data, "Plain OTP must NEVER be exposed in response!"
        print(f"--> PASS: Email OTP dispatched via Resend: {otp_data['message']}")

    # 12. Rate-limit cooldown on resend
    print("\n[TEST 12] Testing POST /auth/resend-otp cooldown rate limit...")
    r = client.post(f"{BASE_URL}/auth/resend-otp", json={"identifier": resend_target, "purpose": "REGISTRATION", "channel": "EMAIL"})
    assert r.status_code == 429
    print(f"--> PASS: Cooldown enforced with 429: {r.json().get('detail')}")

    # 13. SMS Provider check (unconfigured)
    print("\n[TEST 13] Testing SMS provider check when unconfigured...")
    r = client.post(f"{BASE_URL}/auth/send-otp", json={"identifier": test_mobile, "purpose": "REGISTRATION", "channel": "PHONE"})
    assert r.status_code == 503, f"Expected 503, got {r.status_code}"
    print(f"--> PASS: Real error returned for unconfigured SMS provider: {r.json().get('detail')}")

    # 14. Wrong OTP verification attempt
    print("\n[TEST 14] Testing POST /auth/verify-otp with wrong code...")
    r = client.post(f"{BASE_URL}/auth/verify-otp", json={"identifier": resend_target, "otp": "999999", "purpose": "REGISTRATION"})
    assert r.status_code == 400
    assert "4 attempts remaining" in r.text
    print(f"--> PASS: Wrong OTP attempt tracked & rejected: {r.json().get('detail')}")

    # 15. Password Reset Request (Anti-enumeration)
    print("\n[TEST 15] Testing POST /auth/forgot-password with arbitrary email...")
    r = client.post(f"{BASE_URL}/auth/forgot-password", json={"email": "nonexistent@lexproof.org"})
    assert r.status_code == 200
    assert "password reset code has been dispatched" in r.json().get("message")
    print(f"--> PASS: Anti-enumeration preserved for arbitrary email: {r.json().get('message')}")

    # 16. Google OAuth URL Generation
    print("\n[TEST 16] Testing GET /auth/google/url...")
    r = client.get(f"{BASE_URL}/auth/google/url?redirect=/dashboard")
    assert r.status_code == 200
    url_data = r.json()
    assert "accounts.google.com" in url_data["url"]
    assert "client_id=" in url_data["url"]
    assert "state=" in url_data["url"]
    print(f"--> PASS: Google OAuth 2.0 authorization URL created: {url_data['url'][:55]}...")

    # 17. Google OAuth Callback with invalid state
    print("\n[TEST 17] Testing Google callback with invalid state parameter...")
    r = client.get(f"{BASE_URL}/auth/google/callback?code=mock_code&state=invalid_state_123", follow_redirects=False)
    assert r.status_code in [302, 307]
    redirect_location = r.headers.get("location", "")
    assert "error=" in redirect_location
    print(f"--> PASS: Invalid OAuth state safely rejected, redirected to: {redirect_location}")

    # 18. Logout and session invalidation
    print("\n[TEST 18] Testing POST /auth/logout and session invalidation...")
    r = client.post(f"{BASE_URL}/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert "Logged out successfully" in r.json().get("message")
    
    # Check that the cookie is cleared
    cleared_cookie = r.headers.get("set-cookie", "")
    assert 'LexProof_token=""' in cleared_cookie or "Max-Age=0" in cleared_cookie
    print("--> PASS: Logout successful! Server-side session revoked and cookie expired.")

    # Subsequent request with revoked token
    r_after = client.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r_after.status_code == 401, f"Expected 401 after logout, got {r_after.status_code}"
    print(f"--> PASS: Revoked token rejected with 401: {r_after.json().get('detail')}")

    print("\n" + "=" * 70)
    print("ALL 18 LIVE HTTP ENDPOINT & SESSION SECURITY TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
