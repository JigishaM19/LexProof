import asyncio
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.models.user import UserCreate, UserLogin
from app.services.auth_service import AuthService
from app.core.security import verify_password, decode_access_token

async def test_multi_role_auth():
    print("=" * 60)
    print("TESTING 2-ROLE ARCHITECTURE: ADMIN & PEOPLES (USER)")
    print("=" * 60)

    await connect_to_mongo()
    db = await get_database()
    users_col = db["users"]

    # 1. Test Demo User (Peoples / Students)
    print("\n[TEST 1] Testing Demo User (Peoples/Students)...")
    demo_user_res = await AuthService.get_or_create_demo_user("USER")
    assert demo_user_res.user.role == "USER", f"Expected role USER, got {demo_user_res.user.role}"
    assert demo_user_res.user.user_type == "PEOPLE", f"Expected user_type PEOPLE, got {demo_user_res.user.user_type}"
    payload_user = decode_access_token(demo_user_res.access_token)
    assert payload_user["role"] == "USER", f"Expected token role USER, got {payload_user['role']}"
    print(f"[PASS] Demo User created with email: {demo_user_res.user.email}, role: {demo_user_res.user.role}, token role: {payload_user['role']}")

    # 2. Test Demo Admin
    print("\n[TEST 2] Testing Demo Admin...")
    demo_admin_res = await AuthService.get_or_create_demo_user("ADMIN")
    assert demo_admin_res.user.role == "ADMIN", f"Expected role ADMIN, got {demo_admin_res.user.role}"
    assert demo_admin_res.user.user_type == "ADMIN", f"Expected user_type ADMIN, got {demo_admin_res.user.user_type}"
    payload_admin = decode_access_token(demo_admin_res.access_token)
    assert payload_admin["role"] == "ADMIN", f"Expected token role ADMIN, got {payload_admin['role']}"
    print(f"[PASS] Demo Admin created with email: {demo_admin_res.user.email}, role: {demo_admin_res.user.role}, token role: {payload_admin['role']}")

    # 3. Test Student / People Registration (Standard role = USER)
    print("\n[TEST 3] Testing Standard Registration (Peoples/Students)...")
    test_student_email = "student.test.2026@lexproof.dev"
    await users_col.delete_one({"email": test_student_email})

    student_in = UserCreate(
        first_name="Rohan",
        last_name="Deshmukh",
        email=test_student_email,
        password="ValidPassword2026!",
        mobile="9823012345",
        role="USER",
        institution_name="Savitribai Phule Pune University",
        course_name="B.E. Computer Engineering"
    )
    student_res = await AuthService.register_user(student_in)
    assert student_res.role == "USER", f"Expected role USER, got {student_res.role}"
    assert student_res.user_type == "PEOPLE", f"Expected user_type PEOPLE, got {student_res.user_type}"
    print(f"[PASS] Student registered with role: {student_res.role}, user_type: {student_res.user_type}")

    # 4. Test Legacy Role Normalization (e.g., passing 'INDIVIDUAL' or 'ORGANIZATION')
    print("\n[TEST 4] Testing Legacy Role Normalization...")
    test_legacy_email = "legacy.test.2026@lexproof.dev"
    await users_col.delete_one({"email": test_legacy_email})

    legacy_in = UserCreate(
        first_name="Pooja",
        last_name="Patil",
        email=test_legacy_email,
        password="ValidPassword2026!",
        mobile="9823054321",
        role="INDIVIDUAL",  # Legacy role
        institution_name="University of Mumbai"
    )
    legacy_res = await AuthService.register_user(legacy_in)
    assert legacy_res.role == "USER", f"Legacy role was not normalized to USER! Got: {legacy_res.role}"
    print(f"[PASS] Legacy 'INDIVIDUAL' role successfully normalized to: {legacy_res.role}")

    # 5. Test Authenticate User & JWT Session Claims
    print("\n[TEST 5] Testing Login & JWT Token generation...")
    login_res = await AuthService.authenticate_user(UserLogin(identifier=test_student_email, password="ValidPassword2026!"))
    token_claims = decode_access_token(login_res.access_token)
    assert token_claims["role"] == "USER"
    assert token_claims["email"] == test_student_email
    assert "session_id" in token_claims
    print(f"[PASS] Login successful! JWT claims verified: sub={token_claims['sub']}, role={token_claims['role']}")

    # Clean up test accounts
    await users_col.delete_one({"email": test_student_email})
    await users_col.delete_one({"email": test_legacy_email})

    await close_mongo_connection()
    print("\n" + "=" * 60)
    print("ALL MULTI-ROLE & SECURITY TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_multi_role_auth())
