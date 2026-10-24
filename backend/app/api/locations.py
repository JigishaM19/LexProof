"""
LexProof Geographic / Location API
Provides cascading dropdown data from MongoDB collections:
  countries → states → districts → cities/talukas → pincode validation
Data is populated by the seed_hybrid_data.py script.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from app.core.database import get_database
import re

router = APIRouter(prefix="/locations", tags=["Geographic Locations"])


# ---------------------------------------------------------------------------
# GET /locations/countries
# ---------------------------------------------------------------------------
@router.get("/countries")
async def get_countries():
    """Return all countries, ordered by name."""
    db = await get_database()
    cursor = db["countries"].find({}, {"_id": 0}).sort("name", 1)
    results = await cursor.to_list(length=300)
    return results


# ---------------------------------------------------------------------------
# GET /locations/states?countryId=IN
# ---------------------------------------------------------------------------
@router.get("/states")
async def get_states(countryId: str = Query(..., description="ISO-3166-1 alpha-2 country code")):
    """Return states/provinces/regions for the specified country."""
    if not countryId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="countryId is required.")
    db = await get_database()
    cursor = db["states"].find({"country_id": countryId.strip().upper()}, {"_id": 0}).sort("name", 1)
    results = await cursor.to_list(length=200)
    return results


# ---------------------------------------------------------------------------
# GET /locations/districts?stateId=IN-MH
# ---------------------------------------------------------------------------
@router.get("/districts")
async def get_districts(stateId: str = Query(..., description="State ID, e.g. IN-MH")):
    """Return districts belonging to the specified state."""
    if not stateId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="stateId is required.")
    db = await get_database()
    cursor = db["districts"].find({"state_id": stateId.strip()}, {"_id": 0}).sort("name", 1)
    results = await cursor.to_list(length=500)
    return results


# ---------------------------------------------------------------------------
# GET /locations/subdistricts?districtId=IN-MH-490
# ---------------------------------------------------------------------------
@router.get("/subdistricts")
async def get_subdistricts(
    districtId: str = Query(..., description="District ID (e.g. IN-MH-490 or legacy IN-MH-PUN), code, or name")
):
    """
    Return subdistricts (talukas / tehsils) belonging to the specified district.
    Supports official LGD district IDs (IN-MH-490), district codes (490),
    legacy district IDs (IN-MH-PUN), and district names.
    """
    if not districtId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="districtId is required.")

    db = await get_database()
    clean_id = districtId.strip()

    query_conditions = [{"district_id": clean_id}]

    # Match numeric code if clean_id is digits or formatted like IN-MH-490
    if clean_id.isdigit():
        query_conditions.append({"district_code": int(clean_id)})
    elif clean_id.startswith("IN-MH-") and clean_id[6:].isdigit():
        query_conditions.append({"district_code": int(clean_id[6:])})

    # Resolve from districts collection
    district_doc = await db["districts"].find_one({
        "$or": [
            {"id": clean_id},
            {"code": clean_id},
            {"name": {"$regex": f"^{re.escape(clean_id)}$", "$options": "i"}}
        ]
    })

    if district_doc:
        if district_doc.get("id"):
            query_conditions.append({"district_id": district_doc["id"]})
        if district_doc.get("lgd_code"):
            query_conditions.append({"district_code": district_doc["lgd_code"]})

    # Support legacy abbreviation/slug e.g. IN-MH-PUN -> Pune
    if not district_doc and "-" in clean_id:
        slug_part = clean_id.split("-")[-1]
        matched_dist = await db["districts"].find_one({
            "name": {"$regex": f"^{re.escape(slug_part)}", "$options": "i"}
        })
        if matched_dist:
            query_conditions.append({"district_id": matched_dist["id"]})
            if matched_dist.get("lgd_code"):
                query_conditions.append({"district_code": matched_dist["lgd_code"]})

    cursor = db["subdistricts"].find({"$or": query_conditions}, {"_id": 0}).sort("name", 1)
    results = await cursor.to_list(length=500)
    return results


# ---------------------------------------------------------------------------
# GET /locations/cities?districtId=IN-MH-PUN
# ---------------------------------------------------------------------------
@router.get("/cities")
async def get_cities(districtId: str = Query(..., description="District ID, e.g. IN-MH-PUN")):
    """Return cities/talukas in the specified district."""
    if not districtId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="districtId is required.")
    db = await get_database()
    cursor = db["cities"].find({"district_id": districtId.strip()}, {"_id": 0}).sort("name", 1)
    results = await cursor.to_list(length=500)
    return results


# ---------------------------------------------------------------------------
# GET /locations/postal-codes?pincode=411001&countryId=IN
# ---------------------------------------------------------------------------
@router.get("/postal-codes")
async def validate_postal_code(
    pincode: str = Query(..., description="Postal / PIN code to validate"),
    countryId: Optional[str] = Query("IN", description="ISO country code for regex validation")
):
    """
    Validate a postal code against stored postal data and/or country-specific
    regex rules. Returns location associations where available.
    """
    clean = (pincode or "").strip()
    if not clean:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="pincode is required.")

    db = await get_database()
    country_code = (countryId or "IN").strip().upper()

    # Fetch country for postal regex
    country_doc = await db["countries"].find_one({"id": country_code}, {"_id": 0})
    postal_regex = (country_doc or {}).get("postal_regex") if country_doc else None

    # Regex format check
    format_valid = True
    if postal_regex:
        try:
            format_valid = bool(re.match(postal_regex, clean))
        except Exception:
            format_valid = True  # If regex malformed, skip format check

    if not format_valid:
        return {
            "pincode": clean,
            "is_valid": False,
            "message": f"The postal code '{clean}' does not match the expected format for {country_code}."
        }

    # Look up in pincodes collection (India Post data)
    pincode_docs = await db["pincodes"].find(
        {"pincode": clean},
        {"_id": 0}
    ).to_list(length=10)

    if pincode_docs:
        first = pincode_docs[0]
        return {
            "pincode": clean,
            "is_valid": True,
            "state_id": first.get("state_id"),
            "state_name": first.get("state_name"),
            "district_id": first.get("district_id"),
            "district_name": first.get("district_name"),
            "city_name": first.get("taluka") or first.get("office_name"),
            "office_name": first.get("office_name"),
            "offices": [
                {"office_name": d.get("office_name"), "office_type": d.get("office_type")}
                for d in pincode_docs
            ],
            "message": "Postal code verified against India Post records."
        }

    # Not found in DB but passes regex: format-only validation
    return {
        "pincode": clean,
        "is_valid": True,
        "message": "Postal code format is valid. Location data for this code is not yet in our database.",
        "offices": []
    }
