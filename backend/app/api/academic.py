"""
LexProof Academic Data API
Provides institution, course, branch, and academic structure data
from MongoDB collections populated by the seed_hybrid_data.py script.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from app.core.database import get_database

router = APIRouter(prefix="/academic", tags=["Academic Data"])


# ---------------------------------------------------------------------------
# GET /academic/institutions?stateId=IN-MH&districtId=IN-MH-PUN&cityId=...
# ---------------------------------------------------------------------------
@router.get("/institutions")
async def get_institutions(
    stateId: Optional[str] = Query(None, description="Filter by state ID"),
    districtId: Optional[str] = Query(None, description="Filter by district ID"),
    cityId: Optional[str] = Query(None, description="Filter by city/taluka ID"),
    countryId: Optional[str] = Query("IN", description="Filter by country ID"),
    q: Optional[str] = Query(None, description="Optional name search query"),
    limit: int = Query(100, ge=1, le=500)
):
    """
    Return educational institutions filtered by location.
    Applies the most specific filter available (city > district > state > country).
    """
    db = await get_database()
    query: dict = {}

    if cityId:
        query["city_id"] = cityId.strip()
    elif districtId:
        query["district_id"] = districtId.strip()
    elif stateId:
        query["state_id"] = stateId.strip()
    elif countryId:
        query["country_id"] = countryId.strip().upper()

    if q and q.strip():
        query["name"] = {"$regex": q.strip(), "$options": "i"}

    cursor = db["institutions"].find(query, {"_id": 0}).sort("name", 1).limit(limit)
    results = await cursor.to_list(length=limit)

    # Append "Not Listed" option indicator
    return {
        "institutions": results,
        "allow_custom": True,
        "custom_label": "My institution is not listed"
    }


# ---------------------------------------------------------------------------
# GET /academic/courses?institutionId=...
# ---------------------------------------------------------------------------
@router.get("/courses")
async def get_courses(
    institutionId: Optional[str] = Query(None, description="Filter by institution ID"),
    q: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(200, ge=1, le=500)
):
    """
    Return courses. If institutionId provided and the institution has
    supported_course_ids, returns only those courses; otherwise returns
    the full generic catalogue.
    """
    db = await get_database()

    supported_ids = None
    if institutionId:
        inst = await db["institutions"].find_one({"id": institutionId.strip()}, {"_id": 0})
        if inst and inst.get("supported_course_ids") is not None:
            supported_ids = inst["supported_course_ids"]

    query: dict = {}
    if supported_ids is not None:
        query["id"] = {"$in": supported_ids}
    if q and q.strip():
        query["$or"] = [
            {"name": {"$regex": q.strip(), "$options": "i"}},
            {"short_name": {"$regex": q.strip(), "$options": "i"}}
        ]

    cursor = db["courses"].find(query, {"_id": 0}).sort("name", 1).limit(limit)
    results = await cursor.to_list(length=limit)

    return {
        "courses": results,
        "allow_custom": True,
        "custom_label": "My course / degree is not listed"
    }


# ---------------------------------------------------------------------------
# GET /academic/branches?courseId=...&institutionId=...
# ---------------------------------------------------------------------------
@router.get("/branches")
async def get_branches(
    courseId: str = Query(..., description="Course ID to filter branches"),
    institutionId: Optional[str] = Query(None, description="Optional institution filter"),
    q: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(200, ge=1, le=500)
):
    """
    Return branches/departments for the specified course (and optionally institution).
    """
    if not courseId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="courseId is required.")

    db = await get_database()
    query: dict = {"course_id": courseId.strip()}

    if q and q.strip():
        query["name"] = {"$regex": q.strip(), "$options": "i"}

    cursor = db["branches"].find(query, {"_id": 0}).sort("name", 1).limit(limit)
    results = await cursor.to_list(length=limit)

    if not results:
        course = await db["courses"].find_one({"id": courseId.strip()}, {"_id": 0})
        if course and "branches" in course:
            all_b = course.get("branches", [])
            if q and q.strip():
                ql = q.strip().lower()
                results = [b for b in all_b if ql in b.get("name", "").lower() or ql in b.get("short_name", "").lower()]
            else:
                results = all_b[:limit]

    return {
        "branches": results,
        "allow_custom": True,
        "custom_label": "My branch / department is not listed"
    }


# ---------------------------------------------------------------------------
# GET /academic/structure?courseId=...&institutionId=...
# ---------------------------------------------------------------------------
@router.get("/structure")
async def get_academic_structure(
    courseId: str = Query(..., description="Course ID"),
    institutionId: Optional[str] = Query(None)
):
    """
    Return the academic structure (year/semester options) for a given course.
    """
    if not courseId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="courseId is required.")

    db = await get_database()
    course = await db["courses"].find_one({"id": courseId.strip()}, {"_id": 0})

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course '{courseId}' not found in catalogue."
        )

    return {
        "course_id": course["id"],
        "course_name": course["name"],
        "duration_years": course.get("duration_years", 4),
        "is_annual_system": course.get("is_annual_system", False),
        "year_options": course.get("year_options", []),
        "semester_options": course.get("semester_options", [])
    }
