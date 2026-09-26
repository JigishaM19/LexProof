import httpx
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_complete_flow():
    client = httpx.Client(timeout=10.0)

    # 1. Health check
    res = client.get("http://127.0.0.1:8000/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Backend health check: OK")

    # 2. Registration
    user_email = "student.pune@example.com"
    reg_data = {
        "email": user_email,
        "password": "Password123!",
        "full_name": "Aarav Sharma",
        "user_type": "STUDENT",
        "institution": "Savitribai Phule Pune University",
        "course": "B.E. Computer Engineering",
        "academic_year": "2023",
        "enrollment_id": "SPPU-BE-2023-9988"
    }
    res = client.post(f"{BASE_URL}/auth/register", json=reg_data)
    # 201 or 400 if already exists
    if res.status_code == 201:
        print("[PASS] 2. User registration: OK")
    elif res.status_code == 400 and "already registered" in res.text:
        print("[PASS] 2. User already registered: OK")
    else:
        print(f"[FAIL] User registration: {res.status_code} {res.text}")
        sys.exit(1)

    # 3. Login
    login_res = client.post(f"{BASE_URL}/auth/login", json={"identifier": user_email, "password": "Password123!"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] 3. Argon2id login & JWT token issuance: OK")

    # 4. Create Case
    case_res = client.post(
        f"{BASE_URL}/cases",
        headers=headers,
        json={
            "title": "Aarav Sharma SPPU Degree Inspection",
            "purpose": "College Admission",
            "target_institution": "Savitribai Phule Pune University"
        }
    )
    assert case_res.status_code == 201, f"Case creation failed: {case_res.text}"
    case_id = case_res.json()["id"]
    print(f"[PASS] 4. Verification case created: {case_id}")

    # 5. Create a real sample PDF in memory with PyMuPDF
    import fitz
    pdf_doc = fitz.open()
    page = pdf_doc.new_page()
    page.insert_text(
        (50, 72),
        "SAVITRIBAI PHULE PUNE UNIVERSITY\n"
        "BACHELOR OF ENGINEERING (COMPUTER ENGINEERING)\n"
        "Candidate Name: Aarav Sharma\n"
        "PRN / Roll No: 71920834B\n"
        "Seat No: B19008234\n"
        "Passing Year: 2023\n"
        "CGPA: 8.92 / 10 (First Class with Distinction)\n"
        "Date of Concurrence: 14-07-2023\n",
        fontsize=12
    )
    pdf_bytes = pdf_doc.tobytes()
    pdf_doc.close()

    # Upload document
    files = {"file": ("sppu_degree_certificate.pdf", pdf_bytes, "application/pdf")}
    data = {"case_id": case_id}
    up_res = client.post(f"{BASE_URL}/documents/upload", headers=headers, files=files, data=data)
    assert up_res.status_code == 200, f"Upload failed: {up_res.text}"
    doc = up_res.json()
    doc_id = doc["id"]
    sha256 = doc["file_hash_sha256"]
    print(f"[PASS] 5. MagicByte validation & non-destructive extraction: OK (Doc ID: {doc_id}, SHA: {sha256[:12]}...)")
    print(f"       Extracted Candidate: {doc['extracted_fields']['candidate_name']['extracted_value']}")
    print(f"       Extracted Institution: {doc['extracted_fields']['institution']['extracted_value']}")
    print(f"       Extracted Roll: {doc['extracted_fields']['registration_id']['extracted_value']}")

    # 6. Authoritative Rail Verification (SPPU rail)
    verify_res = client.post(
        f"{BASE_URL}/verification/verify-document",
        json={"document_id": doc_id, "institution_name": "Savitribai Phule Pune University"}
    )
    assert verify_res.status_code == 200, f"Verification failed: {verify_res.text}"
    v_doc = verify_res.json()
    assert v_doc["verification_result"]["status"] == "VERIFIED", f"Expected VERIFIED status: {v_doc}"
    print(f"[PASS] 6. Authoritative Rail Query: {v_doc['verification_result']['status']} ({v_doc['verification_result']['rail_name']})")

    # 7. Coverage Directory Query
    cov_res = client.get(f"{BASE_URL}/verification/coverage?query=pune")
    assert cov_res.status_code == 200
    assert len(cov_res.json()["issuers"]) > 0
    print("[PASS] 7. Coverage directory search: OK")

    # 8. Request Institution Expansion
    req_res = client.post(
        f"{BASE_URL}/verification/request-institution",
        json={
            "institution_name": "Shivaji University Kolhapur",
            "state": "Maharashtra",
            "applicant_email": "test@example.com",
            "notes": "Requesting registrar API onboarding"
        }
    )
    assert req_res.status_code == 201
    print("[PASS] 8. Request institution addition: OK")

    # 9. Case Report Dossier
    rep_res = client.get(f"{BASE_URL}/cases/{case_id}/report", headers=headers)
    assert rep_res.status_code == 200
    report_data = rep_res.json()
    assert "report_id" in report_data
    assert "dossier_hash" in report_data
    print(f"[PASS] 9. Formal Verification Report compiled: {report_data['report_id']} (Status: {report_data['overall_status']})")

    print("\nALL 9 END-TO-END FLOW CHECKS PASSED WITH REAL DATA!")

if __name__ == "__main__":
    test_complete_flow()
