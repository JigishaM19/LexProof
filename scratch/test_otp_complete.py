import httpx
import sys
import time

BASE_URL = "http://127.0.0.1:8000/api/v1/auth"

def run_tests():
    client = httpx.Client(timeout=10.0)
    print("==================================================")
    print("LEGALLENS END-TO-END OTP & AUTH REGISTRATION TEST")
    print("==================================================")

    # Test 1: Empty identifier
    print("\n[TEST 1] Sending OTP with empty identifier...")
    r = client.post(f"{BASE_URL}/send-otp", json={"identifier": ""})
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
    print(f"--> PASS: Rejection verified with: '{r.json().get('detail')}'")

    # Test 2: Malformed email
    print("\n[TEST 2] Sending OTP with malformed email...")
    r = client.post(f"{BASE_URL}/send-otp", json={"identifier": "not-an-email"})
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
    print(f"--> PASS: Rejection verified with: '{r.json().get('detail')}'")

    # Test 3: Valid email OTP dispatch
    test_email = f"verified.student.{int(time.time())}@legallens.io"
    print(f"\n[TEST 3] Dispatching OTP to {test_email}...")
    r = client.post(f"{BASE_URL}/send-otp", json={"identifier": test_email})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    assert data["status"] == "SUCCESS"
    assert data["cooldown_seconds"] == 60
    assert data["expires_in_minutes"] == 10
    debug_code = data.get("debug_code")
    print(f"--> PASS: Dispatched via {data.get('channel')}. Delivery external: {data.get('delivered_externally')}")
    print(f"    Delivery notes: {data.get('delivery_notes')}")
    print(f"    Cryptographic OTP Code: {debug_code}")

    # Test 4: Rate limit cooldown defense (Immediate resend attempt)
    print("\n[TEST 4] Testing 60s rate limit cooldown on immediate resend...")
    r = client.post(f"{BASE_URL}/resend-otp", json={"identifier": test_email})
    assert r.status_code == 429, f"Expected 429, got {r.status_code}: {r.text}"
    print(f"--> PASS: Rate-limited with 429: '{r.json().get('detail')}'")

    # Test 5: Verify with invalid 6-digit code
    print("\n[TEST 5] Testing invalid verification code submission...")
    r = client.post(f"{BASE_URL}/verify-otp", json={"identifier": test_email, "otp": "000000"})
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
    print(f"--> PASS: Proper error displayed: '{r.json().get('detail')}'")

    # Test 6: Verify second invalid code (attempt counter tracking)
    print("\n[TEST 6] Testing attempt counter decrement...")
    r = client.post(f"{BASE_URL}/verify-otp", json={"identifier": test_email, "otp": "111111"})
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
    assert "3 attempts remaining" in r.json().get("detail", ""), f"Unexpected response: {r.text}"
    print(f"--> PASS: Attempt tracking verified: '{r.json().get('detail')}'")

    # Test 7: Verify with correct code
    print("\n[TEST 7] Verifying with genuine cryptographic code...")
    r = client.post(f"{BASE_URL}/verify-otp", json={"identifier": test_email, "otp": debug_code})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    assert r.json()["verified"] is True
    print(f"--> PASS: Identity verified successfully: {r.json()}")

    # Test 8: Register account with verified email
    print(f"\n[TEST 8] Finalizing registration for {test_email}...")
    reg_payload = {
        "email": test_email,
        "password": "SecurePassword2026!",
        "full_name": "Devansh Mehta",
        "user_type": "STUDENT",
        "role": "INDIVIDUAL",
        "institution": "University of Mumbai",
        "course": "B.Tech Computer Science",
        "branch": "Cyber Forensics",
        "academic_year": "2024-2025",
        "enrollment_id": "MU-CF-2024-8841",
        "terms_accepted": True
    }
    r = client.post(f"{BASE_URL}/register", json=reg_payload)
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
    created_user = r.json()
    print(f"--> PASS: User registered with ID: {created_user['id']}")

    # Test 9: Login with newly registered credentials
    print("\n[TEST 9] Logging in with new account credentials...")
    login_payload = {
        "identifier": test_email,
        "password": "SecurePassword2026!"
    }
    r = client.post(f"{BASE_URL}/login", json=login_payload)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    token_data = r.json()
    token = token_data["access_token"]
    print(f"--> PASS: Authenticated successfully! JWT Access Token received.")

    # Test 10: Authenticated /me endpoint
    print("\n[TEST 10] Fetching user profile via authenticated session...")
    r = client.get(f"{BASE_URL}/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    user_me = r.json()
    assert user_me["email"] == test_email
    print(f"--> PASS: Profile confirmed for: {user_me['full_name']} ({user_me['institution']})")

    print("\n==================================================")
    print("ALL 10 END-TO-END TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
