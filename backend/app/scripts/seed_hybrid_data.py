"""
LexProof Hybrid Data Seeding Script
Populates verified Geographic, Administrative (LGD), Postal (India Post),
Institution (AISHE / UGC), and Academic Degree Catalogue records in MongoDB Atlas.

All operations are idempotent and safely update existing reference collections
without dropping tables or modifying user records.
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.database import connect_to_mongo, close_mongo_connection, get_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LexProof.SeedData")

# ------------------------------------------------------------------------------
# 1. Countries (ISO-3166-1 alpha-2 / ITU-T calling codes)
# ------------------------------------------------------------------------------
COUNTRIES_DATA = [
    {
        "id": "IN",
        "name": "India",
        "calling_code": "+91",
        "iso3": "IND",
        "has_states": True,
        "postal_label": "PIN Code",
        "postal_regex": r"^[1-9][0-9]{5}$"
    },
    {
        "id": "US",
        "name": "United States",
        "calling_code": "+1",
        "iso3": "USA",
        "has_states": True,
        "postal_label": "ZIP Code",
        "postal_regex": r"^\d{5}(-\d{4})?$"
    },
    {
        "id": "GB",
        "name": "United Kingdom",
        "calling_code": "+44",
        "iso3": "GBR",
        "has_states": True,
        "postal_label": "Postal Code",
        "postal_regex": r"^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$"
    },
    {
        "id": "CA",
        "name": "Canada",
        "calling_code": "+1",
        "iso3": "CAN",
        "has_states": True,
        "postal_label": "Postal Code",
        "postal_regex": r"^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$"
    },
    {
        "id": "AU",
        "name": "Australia",
        "calling_code": "+61",
        "iso3": "AUS",
        "has_states": True,
        "postal_label": "Postal Code",
        "postal_regex": r"^\d{4}$"
    },
    {
        "id": "DE",
        "name": "Germany",
        "calling_code": "+49",
        "iso3": "DEU",
        "has_states": True,
        "postal_label": "Postal Code",
        "postal_regex": r"^\d{5}$"
    },
    {
        "id": "AE",
        "name": "United Arab Emirates",
        "calling_code": "+971",
        "iso3": "ARE",
        "has_states": True,
        "postal_label": "Postal Code",
        "postal_regex": r"^[A-Za-z0-9\s\-]{3,10}$"
    },
    {
        "id": "SG",
        "name": "Singapore",
        "calling_code": "+65",
        "iso3": "SGP",
        "has_states": False,
        "postal_label": "Postal Code",
        "postal_regex": r"^\d{6}$"
    }
]

# ------------------------------------------------------------------------------
# 2. States / Administrative Regions (India LGD directory: https://lgdirectory.gov.in/)
# ------------------------------------------------------------------------------
STATES_DATA = [
    {"id": "IN-MH", "country_id": "IN", "name": "Maharashtra", "code": "MH", "lgd_code": 27, "admin_type": "State"},
    {"id": "IN-KA", "country_id": "IN", "name": "Karnataka", "code": "KA", "lgd_code": 29, "admin_type": "State"},
    {"id": "IN-GJ", "country_id": "IN", "name": "Gujarat", "code": "GJ", "lgd_code": 24, "admin_type": "State"},
    {"id": "IN-DL", "country_id": "IN", "name": "Delhi", "code": "DL", "lgd_code": 7, "admin_type": "Union Territory"},
    {"id": "IN-TN", "country_id": "IN", "name": "Tamil Nadu", "code": "TN", "lgd_code": 33, "admin_type": "State"},
    {"id": "IN-TG", "country_id": "IN", "name": "Telangana", "code": "TG", "lgd_code": 36, "admin_type": "State"},
    {"id": "IN-UP", "country_id": "IN", "name": "Uttar Pradesh", "code": "UP", "lgd_code": 9, "admin_type": "State"},
    {"id": "IN-MP", "country_id": "IN", "name": "Madhya Pradesh", "code": "MP", "lgd_code": 23, "admin_type": "State"},
    {"id": "IN-RJ", "country_id": "IN", "name": "Rajasthan", "code": "RJ", "lgd_code": 8, "admin_type": "State"},
    {"id": "IN-WB", "country_id": "IN", "name": "West Bengal", "code": "WB", "lgd_code": 19, "admin_type": "State"},
    {"id": "IN-KL", "country_id": "IN", "name": "Kerala", "code": "KL", "lgd_code": 32, "admin_type": "State"},
    {"id": "IN-AP", "country_id": "IN", "name": "Andhra Pradesh", "code": "AP", "lgd_code": 28, "admin_type": "State"},
    {"id": "IN-BR", "country_id": "IN", "name": "Bihar", "code": "BR", "lgd_code": 10, "admin_type": "State"},
    {"id": "IN-PB", "country_id": "IN", "name": "Punjab", "code": "PB", "lgd_code": 3, "admin_type": "State"},
    {"id": "IN-HR", "country_id": "IN", "name": "Haryana", "code": "HR", "lgd_code": 6, "admin_type": "State"},
    {"id": "IN-GA", "country_id": "IN", "name": "Goa", "code": "GA", "lgd_code": 30, "admin_type": "State"},
]

# ------------------------------------------------------------------------------
# 3. Districts (India LGD Official Districts)
# ------------------------------------------------------------------------------
DISTRICTS_DATA = [
    # Maharashtra Districts (Comprehensive LGD coverage for pilot scope)
    {"id": "IN-MH-PUN", "state_id": "IN-MH", "country_id": "IN", "name": "Pune", "headquarters": "Pune", "lgd_code": 492},
    {"id": "IN-MH-MUM", "state_id": "IN-MH", "country_id": "IN", "name": "Mumbai City", "headquarters": "Mumbai", "lgd_code": 488},
    {"id": "IN-MH-MSU", "state_id": "IN-MH", "country_id": "IN", "name": "Mumbai Suburban", "headquarters": "Bandra", "lgd_code": 489},
    {"id": "IN-MH-THA", "state_id": "IN-MH", "country_id": "IN", "name": "Thane", "headquarters": "Thane", "lgd_code": 498},
    {"id": "IN-MH-NAG", "state_id": "IN-MH", "country_id": "IN", "name": "Nagpur", "headquarters": "Nagpur", "lgd_code": 486},
    {"id": "IN-MH-NAS", "state_id": "IN-MH", "country_id": "IN", "name": "Nashik", "headquarters": "Nashik", "lgd_code": 487},
    {"id": "IN-MH-AUR", "state_id": "IN-MH", "country_id": "IN", "name": "Chhatrapati Sambhajinagar", "headquarters": "Chhatrapati Sambhajinagar", "lgd_code": 468},
    {"id": "IN-MH-KOL", "state_id": "IN-MH", "country_id": "IN", "name": "Kolhapur", "headquarters": "Kolhapur", "lgd_code": 480},
    {"id": "IN-MH-SOL", "state_id": "IN-MH", "country_id": "IN", "name": "Solapur", "headquarters": "Solapur", "lgd_code": 497},
    {"id": "IN-MH-AMR", "state_id": "IN-MH", "country_id": "IN", "name": "Amravati", "headquarters": "Amravati", "lgd_code": 466},
    {"id": "IN-MH-AHM", "state_id": "IN-MH", "country_id": "IN", "name": "Ahilyanagar (Ahmednagar)", "headquarters": "Ahilyanagar", "lgd_code": 464},
    {"id": "IN-MH-SAT", "state_id": "IN-MH", "country_id": "IN", "name": "Satara", "headquarters": "Satara", "lgd_code": 495},
    {"id": "IN-MH-SAN", "state_id": "IN-MH", "country_id": "IN", "name": "Sangli", "headquarters": "Sangli", "lgd_code": 494},
    {"id": "IN-MH-JAL", "state_id": "IN-MH", "country_id": "IN", "name": "Jalgaon", "headquarters": "Jalgaon", "lgd_code": 476},
    {"id": "IN-MH-NAN", "state_id": "IN-MH", "country_id": "IN", "name": "Nanded", "headquarters": "Nanded", "lgd_code": 484},
    {"id": "IN-MH-RAI", "state_id": "IN-MH", "country_id": "IN", "name": "Raigad", "headquarters": "Alibag", "lgd_code": 490},
    {"id": "IN-MH-RAT", "state_id": "IN-MH", "country_id": "IN", "name": "Ratnagiri", "headquarters": "Ratnagiri", "lgd_code": 491},
    {"id": "IN-MH-PAL", "state_id": "IN-MH", "country_id": "IN", "name": "Palghar", "headquarters": "Palghar", "lgd_code": 665},
    {"id": "IN-MH-LAT", "state_id": "IN-MH", "country_id": "IN", "name": "Latur", "headquarters": "Latur", "lgd_code": 481},
    {"id": "IN-MH-DHA", "state_id": "IN-MH", "country_id": "IN", "name": "Dharashiv (Osmanabad)", "headquarters": "Dharashiv", "lgd_code": 488},

    # Key districts in other major states
    {"id": "IN-KA-BLR", "state_id": "IN-KA", "country_id": "IN", "name": "Bengaluru Urban", "headquarters": "Bengaluru", "lgd_code": 526},
    {"id": "IN-KA-MYS", "state_id": "IN-KA", "country_id": "IN", "name": "Mysuru", "headquarters": "Mysuru", "lgd_code": 545},
    {"id": "IN-DL-CEN", "state_id": "IN-DL", "country_id": "IN", "name": "Central Delhi", "headquarters": "Daryaganj", "lgd_code": 83},
    {"id": "IN-DL-NDL", "state_id": "IN-DL", "country_id": "IN", "name": "New Delhi", "headquarters": "Connaught Place", "lgd_code": 85},
    {"id": "IN-GJ-AHM", "state_id": "IN-GJ", "country_id": "IN", "name": "Ahmedabad", "headquarters": "Ahmedabad", "lgd_code": 438},
    {"id": "IN-GJ-SUR", "state_id": "IN-GJ", "country_id": "IN", "name": "Surat", "headquarters": "Surat", "lgd_code": 462},
    {"id": "IN-TN-CHE", "state_id": "IN-TN", "country_id": "IN", "name": "Chennai", "headquarters": "Chennai", "lgd_code": 566},
    {"id": "IN-TG-HYD", "state_id": "IN-TG", "country_id": "IN", "name": "Hyderabad", "headquarters": "Hyderabad", "lgd_code": 505},
]

# ------------------------------------------------------------------------------
# 4. Cities / Talukas (Maharashtra LGD Subdivisions & Major Urban Centers)
# ------------------------------------------------------------------------------
CITIES_DATA = [
    # Pune District Talukas / Cities
    {"id": "IN-MH-PUN-01", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "country_id": "IN", "name": "Pune City", "taluka": "Pune City", "default_pincode": "411001", "admin_type": "Municipal Corporation"},
    {"id": "IN-MH-PUN-02", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "country_id": "IN", "name": "Shivajinagar", "taluka": "Haveli", "default_pincode": "411005", "admin_type": "Sub-city / Taluka"},
    {"id": "IN-MH-PUN-03", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "country_id": "IN", "name": "Pimpri-Chinchwad", "taluka": "Haveli", "default_pincode": "411018", "admin_type": "Municipal Corporation"},
    {"id": "IN-MH-PUN-04", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "country_id": "IN", "name": "Kothrud", "taluka": "Haveli", "default_pincode": "411038", "admin_type": "Township / Suburb"},
    {"id": "IN-MH-PUN-05", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "country_id": "IN", "name": "Baramati", "taluka": "Baramati", "default_pincode": "413102", "admin_type": "Taluka / Municipality"},
    {"id": "IN-MH-PUN-06", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "country_id": "IN", "name": "Maval / Lonavala", "taluka": "Maval", "default_pincode": "410401", "admin_type": "Taluka"},

    # Mumbai City District
    {"id": "IN-MH-MUM-01", "district_id": "IN-MH-MUM", "state_id": "IN-MH", "country_id": "IN", "name": "Fort / Colaba", "taluka": "Mumbai South", "default_pincode": "400001", "admin_type": "Urban Locality"},
    {"id": "IN-MH-MUM-02", "district_id": "IN-MH-MUM", "state_id": "IN-MH", "country_id": "IN", "name": "Dadar", "taluka": "Mumbai Central", "default_pincode": "400014", "admin_type": "Urban Locality"},
    {"id": "IN-MH-MUM-03", "district_id": "IN-MH-MUM", "state_id": "IN-MH", "country_id": "IN", "name": "Matunga", "taluka": "Mumbai Central", "default_pincode": "400019", "admin_type": "Urban Locality"},

    # Mumbai Suburban District
    {"id": "IN-MH-MSU-01", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "country_id": "IN", "name": "Andheri", "taluka": "Andheri", "default_pincode": "400053", "admin_type": "Taluka / Suburb"},
    {"id": "IN-MH-MSU-02", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "country_id": "IN", "name": "Bandra", "taluka": "Andheri", "default_pincode": "400050", "admin_type": "Taluka / Suburb"},
    {"id": "IN-MH-MSU-03", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "country_id": "IN", "name": "Powai / Kurla", "taluka": "Kurla", "default_pincode": "400076", "admin_type": "Taluka / Suburb"},
    {"id": "IN-MH-MSU-04", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "country_id": "IN", "name": "Borivali", "taluka": "Borivali", "default_pincode": "400092", "admin_type": "Taluka / Suburb"},

    # Thane District
    {"id": "IN-MH-THA-01", "district_id": "IN-MH-THA", "state_id": "IN-MH", "country_id": "IN", "name": "Thane City", "taluka": "Thane", "default_pincode": "400601", "admin_type": "Municipal Corporation"},
    {"id": "IN-MH-THA-02", "district_id": "IN-MH-THA", "state_id": "IN-MH", "country_id": "IN", "name": "Kalyan-Dombivli", "taluka": "Kalyan", "default_pincode": "421301", "admin_type": "Municipal Corporation"},
    {"id": "IN-MH-THA-03", "district_id": "IN-MH-THA", "state_id": "IN-MH", "country_id": "IN", "name": "Navi Mumbai (Vashi)", "taluka": "Thane", "default_pincode": "400703", "admin_type": "Municipal Corporation"},

    # Nagpur District
    {"id": "IN-MH-NAG-01", "district_id": "IN-MH-NAG", "state_id": "IN-MH", "country_id": "IN", "name": "Nagpur Urban", "taluka": "Nagpur Urban", "default_pincode": "440001", "admin_type": "Municipal Corporation"},
    {"id": "IN-MH-NAG-02", "district_id": "IN-MH-NAG", "state_id": "IN-MH", "country_id": "IN", "name": "Hingna", "taluka": "Hingna", "default_pincode": "441110", "admin_type": "Taluka"},

    # Nashik District
    {"id": "IN-MH-NAS-01", "district_id": "IN-MH-NAS", "state_id": "IN-MH", "country_id": "IN", "name": "Nashik Urban", "taluka": "Nashik", "default_pincode": "422001", "admin_type": "Municipal Corporation"},
    {"id": "IN-MH-NAS-02", "district_id": "IN-MH-NAS", "state_id": "IN-MH", "country_id": "IN", "name": "Malegaon", "taluka": "Malegaon", "default_pincode": "423203", "admin_type": "Municipal Corporation"},

    # Chhatrapati Sambhajinagar
    {"id": "IN-MH-AUR-01", "district_id": "IN-MH-AUR", "state_id": "IN-MH", "country_id": "IN", "name": "Chhatrapati Sambhajinagar City", "taluka": "Aurangabad", "default_pincode": "431001", "admin_type": "Municipal Corporation"},

    # Kolhapur District
    {"id": "IN-MH-KOL-01", "district_id": "IN-MH-KOL", "state_id": "IN-MH", "country_id": "IN", "name": "Kolhapur City / Karvir", "taluka": "Karvir", "default_pincode": "416001", "admin_type": "Municipal Corporation"},

    # Solapur District
    {"id": "IN-MH-SOL-01", "district_id": "IN-MH-SOL", "state_id": "IN-MH", "country_id": "IN", "name": "Solapur North / City", "taluka": "North Solapur", "default_pincode": "413001", "admin_type": "Municipal Corporation"},

    # Bengaluru
    {"id": "IN-KA-BLR-01", "district_id": "IN-KA-BLR", "state_id": "IN-KA", "country_id": "IN", "name": "Bengaluru Central", "taluka": "Bengaluru North", "default_pincode": "560001", "admin_type": "Metropolitan"},

    # New Delhi
    {"id": "IN-DL-NDL-01", "district_id": "IN-DL-NDL", "state_id": "IN-DL", "country_id": "IN", "name": "Connaught Place / New Delhi", "taluka": "Chanakyapuri", "default_pincode": "110001", "admin_type": "Municipal Council"},
]

# ------------------------------------------------------------------------------
# 5. PIN Codes (India Post official mapping records)
# ------------------------------------------------------------------------------
PINCODES_DATA = [
    # Pune PIN Codes
    {"pincode": "411001", "office_name": "Pune G.P.O.", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Haveli"},
    {"pincode": "411004", "office_name": "Deccan Gymkhana S.O", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Shivajinagar"},
    {"pincode": "411005", "office_name": "Shivajinagar S.O", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Shivajinagar"},
    {"pincode": "411007", "office_name": "Ganeshkhind S.O (SPPU Campus)", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Haveli"},
    {"pincode": "411018", "office_name": "Pimpri P.F. S.O", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Haveli"},
    {"pincode": "411038", "office_name": "Kothrud S.O", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Haveli"},
    {"pincode": "411041", "office_name": "Vadgaon Budruk S.O", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Haveli"},
    {"pincode": "413102", "office_name": "Baramati H.O", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Baramati"},
    {"pincode": "410401", "office_name": "Lonavala S.O", "district_id": "IN-MH-PUN", "state_id": "IN-MH", "taluka": "Maval"},

    # Mumbai City PIN Codes
    {"pincode": "400001", "office_name": "Mumbai G.P.O.", "district_id": "IN-MH-MUM", "state_id": "IN-MH", "taluka": "Mumbai South"},
    {"pincode": "400014", "office_name": "Dadar S.O", "district_id": "IN-MH-MUM", "state_id": "IN-MH", "taluka": "Mumbai Central"},
    {"pincode": "400019", "office_name": "Matunga S.O", "district_id": "IN-MH-MUM", "state_id": "IN-MH", "taluka": "Mumbai Central"},
    {"pincode": "400020", "office_name": "Churchgate S.O", "district_id": "IN-MH-MUM", "state_id": "IN-MH", "taluka": "Mumbai South"},
    {"pincode": "400032", "office_name": "Mantralaya S.O (Fort Campus)", "district_id": "IN-MH-MUM", "state_id": "IN-MH", "taluka": "Mumbai South"},

    # Mumbai Suburban PIN Codes
    {"pincode": "400050", "office_name": "Bandra West S.O", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "taluka": "Andheri"},
    {"pincode": "400053", "office_name": "Andheri S.O", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "taluka": "Andheri"},
    {"pincode": "400058", "office_name": "Andheri West S.O (SPIT Campus)", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "taluka": "Andheri"},
    {"pincode": "400076", "office_name": "Powai I.I.T. S.O", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "taluka": "Kurla"},
    {"pincode": "400092", "office_name": "Borivali West S.O", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "taluka": "Borivali"},
    {"pincode": "400098", "office_name": "Vidyanagari S.O (MU Kalina Campus)", "district_id": "IN-MH-MSU", "state_id": "IN-MH", "taluka": "Kurla"},

    # Thane PIN Codes
    {"pincode": "400601", "office_name": "Thane H.O", "district_id": "IN-MH-THA", "state_id": "IN-MH", "taluka": "Thane"},
    {"pincode": "400703", "office_name": "Vashi S.O", "district_id": "IN-MH-THA", "state_id": "IN-MH", "taluka": "Thane"},
    {"pincode": "421301", "office_name": "Kalyan H.O", "district_id": "IN-MH-THA", "state_id": "IN-MH", "taluka": "Kalyan"},

    # Nagpur, Nashik, Sambhajinagar, Kolhapur
    {"pincode": "440001", "office_name": "Nagpur G.P.O.", "district_id": "IN-MH-NAG", "state_id": "IN-MH", "taluka": "Nagpur Urban"},
    {"pincode": "422001", "office_name": "Nashik H.O", "district_id": "IN-MH-NAS", "state_id": "IN-MH", "taluka": "Nashik Urban"},
    {"pincode": "431001", "office_name": "Chhatrapati Sambhajinagar H.O", "district_id": "IN-MH-AUR", "state_id": "IN-MH", "taluka": "Aurangabad"},
    {"pincode": "416001", "office_name": "Kolhapur H.O", "district_id": "IN-MH-KOL", "state_id": "IN-MH", "taluka": "Karvir"},

    # Other states
    {"pincode": "560001", "office_name": "Bengaluru G.P.O.", "district_id": "IN-KA-BLR", "state_id": "IN-KA", "taluka": "Bengaluru North"},
    {"pincode": "110001", "office_name": "New Delhi G.P.O.", "district_id": "IN-DL-NDL", "state_id": "IN-DL", "taluka": "Chanakyapuri"},
]

# ------------------------------------------------------------------------------
# 6. Educational Institutions (AISHE & UGC Higher Education Directory)
# ------------------------------------------------------------------------------
INSTITUTIONS_DATA = [
    # Pune Institutions
    {
        "id": "inst-sppu",
        "name": "Savitribai Phule Pune University",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-PUN",
        "city_id": "IN-MH-PUN-01",
        "institution_type": "State University",
        "aishe_code": "U-0323",
        "is_autonomous": False,
        "supported_course_ids": None  # Supports all standard courses
    },
    {
        "id": "inst-coep",
        "name": "COEP Technological University",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-PUN",
        "city_id": "IN-MH-PUN-02",
        "institution_type": "Unitary State University",
        "aishe_code": "U-1207",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-mtech", "course-phd"]
    },
    {
        "id": "inst-mit-wpu",
        "name": "MIT World Peace University",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-PUN",
        "city_id": "IN-MH-PUN-04",
        "institution_type": "Private University",
        "aishe_code": "U-0878",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-bsc", "course-bba", "course-bca", "course-mtech", "course-mba", "course-phd"]
    },
    {
        "id": "inst-symbiosis",
        "name": "Symbiosis International University",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-PUN",
        "city_id": "IN-MH-PUN-02",
        "institution_type": "Deemed University",
        "aishe_code": "U-0330",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-bba", "course-bca", "course-mba", "course-ba", "course-mtech", "course-phd"]
    },
    {
        "id": "inst-pict",
        "name": "Pune Institute of Computer Technology (PICT)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-PUN",
        "city_id": "IN-MH-PUN-01",
        "institution_type": "Affiliated Engineering College",
        "aishe_code": "C-41484",
        "is_autonomous": False,
        "supported_course_ids": ["course-btech", "course-mtech", "course-phd"]
    },
    {
        "id": "inst-vit-pune",
        "name": "Vishwakarma Institute of Technology (VIT Pune)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-PUN",
        "city_id": "IN-MH-PUN-01",
        "institution_type": "Autonomous Engineering College",
        "aishe_code": "C-41725",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-mtech", "course-mca", "course-phd"]
    },
    {
        "id": "inst-fergusson",
        "name": "Fergusson College",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-PUN",
        "city_id": "IN-MH-PUN-02",
        "institution_type": "Autonomous College",
        "aishe_code": "C-41443",
        "is_autonomous": True,
        "supported_course_ids": ["course-ba", "course-bsc", "course-ma", "course-msc", "course-phd"]
    },

    # Mumbai Institutions
    {
        "id": "inst-mu",
        "name": "University of Mumbai",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-MUM",
        "city_id": "IN-MH-MUM-01",
        "institution_type": "State University",
        "aishe_code": "U-0318",
        "is_autonomous": False,
        "supported_course_ids": None
    },
    {
        "id": "inst-vjti",
        "name": "Veermata Jijabai Technological Institute (VJTI Mumbai)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-MUM",
        "city_id": "IN-MH-MUM-03",
        "institution_type": "Autonomous State Institute",
        "aishe_code": "C-33827",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-diploma", "course-mtech", "course-mca", "course-phd"]
    },
    {
        "id": "inst-ict",
        "name": "Institute of Chemical Technology (ICT Mumbai)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-MUM",
        "city_id": "IN-MH-MUM-03",
        "institution_type": "Deemed University",
        "aishe_code": "U-0311",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-bpharm", "course-mtech", "course-mpharm", "course-phd"]
    },
    {
        "id": "inst-spit",
        "name": "Sardar Patel Institute of Technology (SPIT Andheri)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-MSU",
        "city_id": "IN-MH-MSU-01",
        "institution_type": "Autonomous Engineering College",
        "aishe_code": "C-33931",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-mtech", "course-mca", "course-phd"]
    },
    {
        "id": "inst-djsce",
        "name": "Dwarkadas J. Sanghvi College of Engineering (DJSCE)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-MSU",
        "city_id": "IN-MH-MSU-01",
        "institution_type": "Autonomous Engineering College",
        "aishe_code": "C-34041",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-mtech", "course-phd"]
    },
    {
        "id": "inst-iit-bombay",
        "name": "Indian Institute of Technology Bombay (IIT Bombay)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-MSU",
        "city_id": "IN-MH-MSU-03",
        "institution_type": "Institute of National Importance",
        "aishe_code": "U-0307",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-bsc", "course-mtech", "course-msc", "course-mba", "course-phd"]
    },
    {
        "id": "inst-st-xaviers",
        "name": "St. Xavier's College (Autonomous), Mumbai",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-MUM",
        "city_id": "IN-MH-MUM-01",
        "institution_type": "Autonomous Arts & Science College",
        "aishe_code": "C-34083",
        "is_autonomous": True,
        "supported_course_ids": ["course-ba", "course-bsc", "course-bcom", "course-bca", "course-ma", "course-msc", "course-phd"]
    },

    # Thane Institutions
    {
        "id": "inst-apshah",
        "name": "A. P. Shah Institute of Technology",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-THA",
        "city_id": "IN-MH-THA-01",
        "institution_type": "Affiliated Engineering College",
        "aishe_code": "C-50123",
        "is_autonomous": False,
        "supported_course_ids": ["course-btech", "course-diploma"]
    },

    # Nagpur Institutions
    {
        "id": "inst-rtmnu",
        "name": "Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-NAG",
        "city_id": "IN-MH-NAG-01",
        "institution_type": "State University",
        "aishe_code": "U-0319",
        "is_autonomous": False,
        "supported_course_ids": None
    },
    {
        "id": "inst-vnit",
        "name": "Visvesvaraya National Institute of Technology (VNIT Nagpur)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-NAG",
        "city_id": "IN-MH-NAG-01",
        "institution_type": "Institute of National Importance",
        "aishe_code": "U-0334",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-mtech", "course-msc", "course-phd"]
    },

    # Nashik Institutions
    {
        "id": "inst-kkwagh",
        "name": "K. K. Wagh Institute of Engineering Education and Research",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-NAS",
        "city_id": "IN-MH-NAS-01",
        "institution_type": "Autonomous Engineering College",
        "aishe_code": "C-41872",
        "is_autonomous": True,
        "supported_course_ids": ["course-btech", "course-mtech", "course-mca", "course-mba"]
    },

    # Chhatrapati Sambhajinagar Institutions
    {
        "id": "inst-bamu",
        "name": "Dr. Babasaheb Ambedkar Marathwada University (BAMU)",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-AUR",
        "city_id": "IN-MH-AUR-01",
        "institution_type": "State University",
        "aishe_code": "U-0309",
        "is_autonomous": False,
        "supported_course_ids": None
    },

    # Kolhapur Institutions
    {
        "id": "inst-suk",
        "name": "Shivaji University, Kolhapur",
        "country_id": "IN",
        "state_id": "IN-MH",
        "district_id": "IN-MH-KOL",
        "city_id": "IN-MH-KOL-01",
        "institution_type": "State University",
        "aishe_code": "U-0324",
        "is_autonomous": False,
        "supported_course_ids": None
    },

    # Out of state (Bengaluru / Delhi)
    {
        "id": "inst-iisc",
        "name": "Indian Institute of Science (IISc Bengaluru)",
        "country_id": "IN",
        "state_id": "IN-KA",
        "district_id": "IN-KA-BLR",
        "city_id": "IN-KA-BLR-01",
        "institution_type": "Institute of National Importance",
        "aishe_code": "U-0220",
        "is_autonomous": True,
        "supported_course_ids": ["course-bsc", "course-btech", "course-mtech", "course-msc", "course-phd"]
    },
    {
        "id": "inst-du",
        "name": "University of Delhi",
        "country_id": "IN",
        "state_id": "IN-DL",
        "district_id": "IN-DL-NDL",
        "city_id": "IN-DL-NDL-01",
        "institution_type": "Central University",
        "aishe_code": "U-0100",
        "is_autonomous": False,
        "supported_course_ids": None
    }
]

# ------------------------------------------------------------------------------
# 7. Courses, Degrees, Branches and Academic Structure Catalogue
# ------------------------------------------------------------------------------
COURSES_DATA = [
    {
        "id": "course-btech",
        "name": "BE / BTech (Bachelor of Technology / Engineering)",
        "short_name": "B.Tech",
        "category": "Undergraduate",
        "duration_years": 4,
        "total_semesters": 8,
        "is_annual_system": False,
        "year_options": ["First Year (FY)", "Second Year (SY)", "Third Year (TY)", "Final Year (B.Tech)"],
        "semester_options": [f"Semester {i}" for i in range(1, 9)],
        "branches": [
            {"id": "br-btech-cse", "course_id": "course-btech", "name": "Computer Science and Engineering", "short_name": "CSE"},
            {"id": "br-btech-ce", "course_id": "course-btech", "name": "Computer Engineering", "short_name": "CE"},
            {"id": "br-btech-it", "course_id": "course-btech", "name": "Information Technology", "short_name": "IT"},
            {"id": "br-btech-aiml", "course_id": "course-btech", "name": "Artificial Intelligence and Machine Learning", "short_name": "AI&ML"},
            {"id": "br-btech-ds", "course_id": "course-btech", "name": "Data Science", "short_name": "DS"},
            {"id": "br-btech-entc", "course_id": "course-btech", "name": "Electronics and Telecommunication", "short_name": "E&TC"},
            {"id": "br-btech-ee", "course_id": "course-btech", "name": "Electrical Engineering", "short_name": "EE"},
            {"id": "br-btech-mech", "course_id": "course-btech", "name": "Mechanical Engineering", "short_name": "ME"},
            {"id": "br-btech-civil", "course_id": "course-btech", "name": "Civil Engineering", "short_name": "CE"},
            {"id": "br-btech-chem", "course_id": "course-btech", "name": "Chemical Engineering", "short_name": "ChemE"},
            {"id": "br-btech-biotech", "course_id": "course-btech", "name": "Biotechnology", "short_name": "BT"},
            {"id": "br-btech-auto", "course_id": "course-btech", "name": "Automobile Engineering", "short_name": "Auto"},
            {"id": "br-btech-prod", "course_id": "course-btech", "name": "Production Engineering", "short_name": "Prod"},
            {"id": "br-btech-other", "course_id": "course-btech", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-bsc",
        "name": "BSc (Bachelor of Science)",
        "short_name": "B.Sc",
        "category": "Undergraduate",
        "duration_years": 3,
        "total_semesters": 6,
        "is_annual_system": False,
        "year_options": ["First Year (FYBSc)", "Second Year (SYBSc)", "Third Year (TYBSc)"],
        "semester_options": [f"Semester {i}" for i in range(1, 7)],
        "branches": [
            {"id": "br-bsc-cs", "course_id": "course-bsc", "name": "Computer Science", "short_name": "CS"},
            {"id": "br-bsc-it", "course_id": "course-bsc", "name": "Information Technology", "short_name": "IT"},
            {"id": "br-bsc-phy", "course_id": "course-bsc", "name": "Physics", "short_name": "PHY"},
            {"id": "br-bsc-chem", "course_id": "course-bsc", "name": "Chemistry", "short_name": "CHEM"},
            {"id": "br-bsc-math", "course_id": "course-bsc", "name": "Mathematics", "short_name": "MATH"},
            {"id": "br-bsc-bio", "course_id": "course-bsc", "name": "Biology / Life Sciences", "short_name": "BIO"},
            {"id": "br-bsc-biotech", "course_id": "course-bsc", "name": "Biotechnology", "short_name": "BT"},
            {"id": "br-bsc-stat", "course_id": "course-bsc", "name": "Statistics", "short_name": "STAT"},
            {"id": "br-bsc-other", "course_id": "course-bsc", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-bca",
        "name": "BCA (Bachelor of Computer Applications)",
        "short_name": "BCA",
        "category": "Undergraduate",
        "duration_years": 3,
        "total_semesters": 6,
        "is_annual_system": False,
        "year_options": ["First Year (FY)", "Second Year (SY)", "Third Year (TY)"],
        "semester_options": [f"Semester {i}" for i in range(1, 7)],
        "branches": [
            {"id": "br-bca-gen", "course_id": "course-bca", "name": "Computer Applications", "short_name": "CA"},
            {"id": "br-bca-cloud", "course_id": "course-bca", "name": "Cloud Computing", "short_name": "Cloud"},
            {"id": "br-bca-data", "course_id": "course-bca", "name": "Data Analytics", "short_name": "Analytics"},
            {"id": "br-bca-other", "course_id": "course-bca", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-bba",
        "name": "BBA (Bachelor of Business Administration)",
        "short_name": "BBA",
        "category": "Undergraduate",
        "duration_years": 3,
        "total_semesters": 6,
        "is_annual_system": False,
        "year_options": ["First Year (FY)", "Second Year (SY)", "Third Year (TY)"],
        "semester_options": [f"Semester {i}" for i in range(1, 7)],
        "branches": [
            {"id": "br-bba-mgt", "course_id": "course-bba", "name": "Business Administration / General Management", "short_name": "Mgt"},
            {"id": "br-bba-fin", "course_id": "course-bba", "name": "Finance", "short_name": "FIN"},
            {"id": "br-bba-mkt", "course_id": "course-bba", "name": "Marketing", "short_name": "MKT"},
            {"id": "br-bba-hr", "course_id": "course-bba", "name": "Human Resource Management", "short_name": "HR"},
            {"id": "br-bba-ib", "course_id": "course-bba", "name": "International Business", "short_name": "IB"},
            {"id": "br-bba-other", "course_id": "course-bba", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-bcom",
        "name": "BCom (Bachelor of Commerce)",
        "short_name": "B.Com",
        "category": "Undergraduate",
        "duration_years": 3,
        "total_semesters": 6,
        "is_annual_system": False,
        "year_options": ["First Year (FYBCom)", "Second Year (SYBCom)", "Third Year (TYBCom)"],
        "semester_options": [f"Semester {i}" for i in range(1, 7)],
        "branches": [
            {"id": "br-bcom-gen", "course_id": "course-bcom", "name": "Commerce (General)", "short_name": "Gen"},
            {"id": "br-bcom-af", "course_id": "course-bcom", "name": "Accounting and Finance", "short_name": "A&F"},
            {"id": "br-bcom-bi", "course_id": "course-bcom", "name": "Banking and Insurance", "short_name": "B&I"},
            {"id": "br-bcom-fm", "course_id": "course-bcom", "name": "Financial Markets", "short_name": "FM"},
            {"id": "br-bcom-other", "course_id": "course-bcom", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-ba",
        "name": "BA (Bachelor of Arts)",
        "short_name": "BA",
        "category": "Undergraduate",
        "duration_years": 3,
        "total_semesters": 6,
        "is_annual_system": False,
        "year_options": ["First Year (FYBA)", "Second Year (SYBA)", "Third Year (TYBA)"],
        "semester_options": [f"Semester {i}" for i in range(1, 7)],
        "branches": [
            {"id": "br-ba-eng", "course_id": "course-ba", "name": "English Literature", "short_name": "ENG"},
            {"id": "br-ba-eco", "course_id": "course-ba", "name": "Economics", "short_name": "ECO"},
            {"id": "br-ba-psy", "course_id": "course-ba", "name": "Psychology", "short_name": "PSY"},
            {"id": "br-ba-pol", "course_id": "course-ba", "name": "Political Science", "short_name": "POL"},
            {"id": "br-ba-his", "course_id": "course-ba", "name": "History", "short_name": "HIS"},
            {"id": "br-ba-soc", "course_id": "course-ba", "name": "Sociology", "short_name": "SOC"},
            {"id": "br-ba-other", "course_id": "course-ba", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-bpharm",
        "name": "BPharm (Bachelor of Pharmacy)",
        "short_name": "B.Pharm",
        "category": "Undergraduate",
        "duration_years": 4,
        "total_semesters": 8,
        "is_annual_system": False,
        "year_options": ["First Year", "Second Year", "Third Year", "Final Year"],
        "semester_options": [f"Semester {i}" for i in range(1, 9)],
        "branches": [
            {"id": "br-bpharm-gen", "course_id": "course-bpharm", "name": "Pharmacy", "short_name": "Pharm"},
            {"id": "br-bpharm-pc", "course_id": "course-bpharm", "name": "Pharmaceutical Chemistry", "short_name": "PC"},
            {"id": "br-bpharm-other", "course_id": "course-bpharm", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-mbbs",
        "name": "MBBS (Bachelor of Medicine and Bachelor of Surgery)",
        "short_name": "MBBS",
        "category": "Undergraduate",
        "duration_years": 5,
        "total_semesters": 9,
        "is_annual_system": True,
        "year_options": ["1st Professional Year", "2nd Professional Year", "3rd Professional Part 1", "3rd Professional Part 2", "Compulsory Rotatory Internship"],
        "semester_options": ["Annual Academic Evaluation"],
        "branches": [
            {"id": "br-mbbs-gen", "course_id": "course-mbbs", "name": "Medicine and Surgery", "short_name": "MBBS"},
            {"id": "br-mbbs-other", "course_id": "course-mbbs", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-bds",
        "name": "BDS (Bachelor of Dental Surgery)",
        "short_name": "BDS",
        "category": "Undergraduate",
        "duration_years": 5,
        "total_semesters": 8,
        "is_annual_system": True,
        "year_options": ["First Year", "Second Year", "Third Year", "Final Year", "Internship Year"],
        "semester_options": ["Annual Academic Evaluation"],
        "branches": [
            {"id": "br-bds-gen", "course_id": "course-bds", "name": "Dental Surgery", "short_name": "BDS"},
            {"id": "br-bds-other", "course_id": "course-bds", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-bed",
        "name": "BEd (Bachelor of Education)",
        "short_name": "B.Ed",
        "category": "Undergraduate",
        "duration_years": 2,
        "total_semesters": 4,
        "is_annual_system": False,
        "year_options": ["First Year", "Second Year"],
        "semester_options": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
        "branches": [
            {"id": "br-bed-gen", "course_id": "course-bed", "name": "General Education", "short_name": "Gen"},
            {"id": "br-bed-sec", "course_id": "course-bed", "name": "Secondary Education", "short_name": "Sec"},
            {"id": "br-bed-other", "course_id": "course-bed", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-diploma",
        "name": "Diploma in Engineering / Polytechnic",
        "short_name": "Diploma",
        "category": "Diploma programmes",
        "duration_years": 3,
        "total_semesters": 6,
        "is_annual_system": False,
        "year_options": ["First Year (FY)", "Second Year (SY)", "Third Year (TY)"],
        "semester_options": [f"Semester {i}" for i in range(1, 7)],
        "branches": [
            {"id": "br-dip-ce", "course_id": "course-diploma", "name": "Computer Engineering", "short_name": "CE"},
            {"id": "br-dip-it", "course_id": "course-diploma", "name": "Information Technology", "short_name": "IT"},
            {"id": "br-dip-mech", "course_id": "course-diploma", "name": "Mechanical Engineering", "short_name": "ME"},
            {"id": "br-dip-civil", "course_id": "course-diploma", "name": "Civil Engineering", "short_name": "Civil"},
            {"id": "br-dip-ee", "course_id": "course-diploma", "name": "Electrical Engineering", "short_name": "EE"},
            {"id": "br-dip-ej", "course_id": "course-diploma", "name": "Electronics & Telecommunication", "short_name": "EJ"},
            {"id": "br-dip-other", "course_id": "course-diploma", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-mtech",
        "name": "ME / MTech (Master of Technology / Engineering)",
        "short_name": "M.Tech",
        "category": "Postgraduate",
        "duration_years": 2,
        "total_semesters": 4,
        "is_annual_system": False,
        "year_options": ["First Year", "Second Year"],
        "semester_options": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
        "branches": [
            {"id": "br-mtech-cse", "course_id": "course-mtech", "name": "Computer Engineering / Computer Science", "short_name": "CSE"},
            {"id": "br-mtech-ai", "course_id": "course-mtech", "name": "Artificial Intelligence & Data Science", "short_name": "AI"},
            {"id": "br-mtech-vlsi", "course_id": "course-mtech", "name": "VLSI and Embedded Systems", "short_name": "VLSI"},
            {"id": "br-mtech-mech", "course_id": "course-mtech", "name": "Design & Thermal Engineering", "short_name": "Mech"},
            {"id": "br-mtech-struct", "course_id": "course-mtech", "name": "Structural Engineering", "short_name": "Struct"},
            {"id": "br-mtech-other", "course_id": "course-mtech", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-msc",
        "name": "MSc (Master of Science)",
        "short_name": "M.Sc",
        "category": "Postgraduate",
        "duration_years": 2,
        "total_semesters": 4,
        "is_annual_system": False,
        "year_options": ["Part I", "Part II"],
        "semester_options": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
        "branches": [
            {"id": "br-msc-cs", "course_id": "course-msc", "name": "Computer Science", "short_name": "CS"},
            {"id": "br-msc-it", "course_id": "course-msc", "name": "Information Technology", "short_name": "IT"},
            {"id": "br-msc-ds", "course_id": "course-msc", "name": "Data Science", "short_name": "DS"},
            {"id": "br-msc-phy", "course_id": "course-msc", "name": "Physics", "short_name": "PHY"},
            {"id": "br-msc-chem", "course_id": "course-msc", "name": "Chemistry", "short_name": "CHEM"},
            {"id": "br-msc-math", "course_id": "course-msc", "name": "Mathematics", "short_name": "MATH"},
            {"id": "br-msc-other", "course_id": "course-msc", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-mca",
        "name": "MCA (Master of Computer Applications)",
        "short_name": "MCA",
        "category": "Postgraduate",
        "duration_years": 2,
        "total_semesters": 4,
        "is_annual_system": False,
        "year_options": ["First Year", "Second Year"],
        "semester_options": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
        "branches": [
            {"id": "br-mca-gen", "course_id": "course-mca", "name": "Computer Applications", "short_name": "MCA"},
            {"id": "br-mca-cloud", "course_id": "course-mca", "name": "Cloud Computing and DevOps", "short_name": "Cloud"},
            {"id": "br-mca-other", "course_id": "course-mca", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-mba",
        "name": "MBA (Master of Business Administration)",
        "short_name": "MBA",
        "category": "Postgraduate",
        "duration_years": 2,
        "total_semesters": 4,
        "is_annual_system": False,
        "year_options": ["First Year", "Second Year"],
        "semester_options": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
        "branches": [
            {"id": "br-mba-gen", "course_id": "course-mba", "name": "Business Administration", "short_name": "MBA"},
            {"id": "br-mba-fin", "course_id": "course-mba", "name": "Financial Management", "short_name": "Finance"},
            {"id": "br-mba-mkt", "course_id": "course-mba", "name": "Marketing Management", "short_name": "Marketing"},
            {"id": "br-mba-hr", "course_id": "course-mba", "name": "Human Resource Management", "short_name": "HR"},
            {"id": "br-mba-ba", "course_id": "course-mba", "name": "Business Analytics", "short_name": "BA"},
            {"id": "br-mba-other", "course_id": "course-mba", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-ma",
        "name": "MA (Master of Arts)",
        "short_name": "MA",
        "category": "Postgraduate",
        "duration_years": 2,
        "total_semesters": 4,
        "is_annual_system": False,
        "year_options": ["Part I", "Part II"],
        "semester_options": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
        "branches": [
            {"id": "br-ma-eng", "course_id": "course-ma", "name": "English", "short_name": "ENG"},
            {"id": "br-ma-eco", "course_id": "course-ma", "name": "Economics", "short_name": "ECO"},
            {"id": "br-ma-psy", "course_id": "course-ma", "name": "Psychology", "short_name": "PSY"},
            {"id": "br-ma-other", "course_id": "course-ma", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-mcom",
        "name": "MCom (Master of Commerce)",
        "short_name": "M.Com",
        "category": "Postgraduate",
        "duration_years": 2,
        "total_semesters": 4,
        "is_annual_system": False,
        "year_options": ["Part I", "Part II"],
        "semester_options": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
        "branches": [
            {"id": "br-mcom-acc", "course_id": "course-mcom", "name": "Advanced Accountancy", "short_name": "Acc"},
            {"id": "br-mcom-bf", "course_id": "course-mcom", "name": "Banking and Finance", "short_name": "B&F"},
            {"id": "br-mcom-other", "course_id": "course-mcom", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-mpharm",
        "name": "MPharm (Master of Pharmacy)",
        "short_name": "M.Pharm",
        "category": "Postgraduate",
        "duration_years": 2,
        "total_semesters": 4,
        "is_annual_system": False,
        "year_options": ["First Year", "Second Year"],
        "semester_options": ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
        "branches": [
            {"id": "br-mpharm-ceutics", "course_id": "course-mpharm", "name": "Pharmaceutics", "short_name": "Ceutics"},
            {"id": "br-mpharm-cology", "course_id": "course-mpharm", "name": "Pharmacology", "short_name": "Cology"},
            {"id": "br-mpharm-qa", "course_id": "course-mpharm", "name": "Quality Assurance", "short_name": "QA"},
            {"id": "br-mpharm-other", "course_id": "course-mpharm", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-md-ms",
        "name": "MD / MS (Doctor of Medicine / Master of Surgery)",
        "short_name": "MD/MS",
        "category": "Postgraduate",
        "duration_years": 3,
        "total_semesters": 6,
        "is_annual_system": True,
        "year_options": ["First Year Residency", "Second Year Residency", "Final Year Residency"],
        "semester_options": ["Annual Residency Assessment"],
        "branches": [
            {"id": "br-md-med", "course_id": "course-md-ms", "name": "General Medicine", "short_name": "Med"},
            {"id": "br-ms-surg", "course_id": "course-md-ms", "name": "General Surgery", "short_name": "Surg"},
            {"id": "br-md-ped", "course_id": "course-md-ms", "name": "Pediatrics", "short_name": "Ped"},
            {"id": "br-md-radio", "course_id": "course-md-ms", "name": "Radiodiagnosis", "short_name": "Radio"},
            {"id": "br-md-other", "course_id": "course-md-ms", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-phd",
        "name": "PhD (Doctor of Philosophy)",
        "short_name": "Ph.D.",
        "category": "Doctorate",
        "duration_years": 5,
        "total_semesters": 10,
        "is_annual_system": True,
        "year_options": ["Year 1 (Coursework)", "Year 2 (Research)", "Year 3 (Pre-synopsis)", "Year 4 (Thesis Submission)", "Year 5 (Viva / Defense)"],
        "semester_options": ["Annual Progress Review"],
        "branches": [
            {"id": "br-phd-eng", "course_id": "course-phd", "name": "Engineering and Technology", "short_name": "Eng"},
            {"id": "br-phd-sci", "course_id": "course-phd", "name": "Science and Applied Mathematics", "short_name": "Sci"},
            {"id": "br-phd-mgt", "course_id": "course-phd", "name": "Management and Commerce", "short_name": "Mgt"},
            {"id": "br-phd-hum", "course_id": "course-phd", "name": "Humanities and Social Sciences", "short_name": "Hum"},
            {"id": "br-phd-pharm", "course_id": "course-phd", "name": "Pharmaceutical Sciences", "short_name": "Pharm"},
            {"id": "br-phd-other", "course_id": "course-phd", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-certificate",
        "name": "Certificate Programmes",
        "short_name": "Cert",
        "category": "Certificate programmes",
        "duration_years": 1,
        "total_semesters": 2,
        "is_annual_system": False,
        "year_options": ["Program Year 1"],
        "semester_options": ["Term 1", "Term 2"],
        "branches": [
            {"id": "br-cert-da", "course_id": "course-certificate", "name": "Data Analytics", "short_name": "DA"},
            {"id": "br-cert-cs", "course_id": "course-certificate", "name": "Cybersecurity", "short_name": "CS"},
            {"id": "br-cert-ai", "course_id": "course-certificate", "name": "Artificial Intelligence", "short_name": "AI"},
            {"id": "br-cert-other", "course_id": "course-certificate", "name": "Other", "short_name": "Other"},
        ]
    },
    {
        "id": "course-other",
        "name": "Other Programme",
        "short_name": "Other",
        "category": "Other",
        "duration_years": 4,
        "total_semesters": 8,
        "is_annual_system": False,
        "year_options": ["First Year", "Second Year", "Third Year", "Fourth Year"],
        "semester_options": [f"Semester {i}" for i in range(1, 9)],
        "branches": [
            {"id": "br-other-gen", "course_id": "course-other", "name": "General Studies", "short_name": "Gen"},
            {"id": "br-other-desc", "course_id": "course-other", "name": "Other", "short_name": "Other"},
        ]
    }
]

# ------------------------------------------------------------------------------
# Seeding Execution Logic (Idempotent Upserts)
# ------------------------------------------------------------------------------
async def seed_all_hybrid_data():
    logger.info("Connecting to MongoDB Atlas...")
    await connect_to_mongo()
    db = await get_database()

    logger.info("Starting Idempotent Hybrid Data Seeding...")

    # 1. Seed Countries
    countries_col = db["countries"]
    await countries_col.create_index("id", unique=True)
    c_count = 0
    for country in COUNTRIES_DATA:
        await countries_col.update_one({"id": country["id"]}, {"$set": country}, upsert=True)
        c_count += 1
    logger.info(f"-> Seeded {c_count} country records.")

    # 2. Seed States
    states_col = db["states"]
    await states_col.create_index("id", unique=True)
    await states_col.create_index("country_id")
    s_count = 0
    for state in STATES_DATA:
        await states_col.update_one({"id": state["id"]}, {"$set": state}, upsert=True)
        s_count += 1
    logger.info(f"-> Seeded {s_count} state records.")

    # 3. Seed Districts
    districts_col = db["districts"]
    await districts_col.create_index("id", unique=True)
    await districts_col.create_index("state_id")
    d_count = 0
    for dist in DISTRICTS_DATA:
        await districts_col.update_one({"id": dist["id"]}, {"$set": dist}, upsert=True)
        d_count += 1
    logger.info(f"-> Seeded {d_count} district records.")

    # 4. Seed Cities / Talukas
    cities_col = db["cities"]
    await cities_col.create_index("id", unique=True)
    await cities_col.create_index("district_id")
    await cities_col.create_index("state_id")
    city_count = 0
    for city in CITIES_DATA:
        await cities_col.update_one({"id": city["id"]}, {"$set": city}, upsert=True)
        city_count += 1
    logger.info(f"-> Seeded {city_count} city / taluka records.")

    # 5. Seed PIN codes
    pincodes_col = db["pincodes"]
    await pincodes_col.create_index("pincode")
    await pincodes_col.create_index("district_id")
    pin_count = 0
    for pin in PINCODES_DATA:
        await pincodes_col.update_one(
            {"pincode": pin["pincode"], "office_name": pin["office_name"]},
            {"$set": pin},
            upsert=True
        )
        pin_count += 1
    logger.info(f"-> Seeded {pin_count} PIN code mapping records.")

    # 6. Seed Educational Institutions
    institutions_col = db["institutions"]
    await institutions_col.create_index("id", unique=True)
    await institutions_col.create_index("state_id")
    await institutions_col.create_index("district_id")
    await institutions_col.create_index("name")
    inst_count = 0
    for inst in INSTITUTIONS_DATA:
        await institutions_col.update_one({"id": inst["id"]}, {"$set": inst}, upsert=True)
        inst_count += 1
    logger.info(f"-> Seeded {inst_count} educational institution records.")

    # 7. Seed Academic Courses and Branches
    courses_col = db["courses"]
    await courses_col.create_index("id", unique=True)
    course_count = 0
    for crs in COURSES_DATA:
        await courses_col.update_one({"id": crs["id"]}, {"$set": crs}, upsert=True)
        course_count += 1
    logger.info(f"-> Seeded {course_count} degree programme catalogue records.")

    logger.info("Hybrid Data Seeding completed successfully in MongoDB Atlas!")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(seed_all_hybrid_data())
