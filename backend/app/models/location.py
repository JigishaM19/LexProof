from pydantic import BaseModel, Field
from typing import Optional, List

class CountryRecord(BaseModel):
    id: str  # ISO-3166-1 alpha-2, e.g., "IN", "US", "GB"
    name: str
    calling_code: str = "+91"
    iso3: Optional[str] = None
    has_states: bool = True
    postal_label: str = "PIN Code"
    postal_regex: Optional[str] = r"^[1-9][0-9]{5}$"

class StateRecord(BaseModel):
    id: str  # e.g., "IN-MH", "IN-KA"
    country_id: str = "IN"
    name: str
    code: Optional[str] = None
    lgd_code: Optional[int] = None
    admin_type: str = "State"  # State or Union Territory or Province

class DistrictRecord(BaseModel):
    id: str  # e.g., "IN-MH-PUN"
    state_id: str
    country_id: str = "IN"
    name: str
    headquarters: Optional[str] = None
    lgd_code: Optional[int] = None

class CityRecord(BaseModel):
    id: str  # e.g., "IN-MH-PUN-HAV"
    district_id: str
    state_id: str
    country_id: str = "IN"
    name: str
    taluka: Optional[str] = None
    default_pincode: Optional[str] = None
    admin_type: str = "Taluka / City"

class SubdistrictRecord(BaseModel):
    id: str  # e.g., "subdist-4188"
    district_id: str  # e.g., "IN-MH-490"
    district_code: int  # e.g., 490
    district_name: str  # e.g., "Pune"
    state_id: str = "IN-MH"
    state_code: int = 27
    country_id: str = "IN"
    name: str  # e.g., "Ambegaon"
    code: int  # e.g., 4188
    version: Optional[int] = 1
    name_local: Optional[str] = None
    census_2001_code: Optional[str] = None
    census_2011_code: Optional[str] = None
    admin_type: str = "Subdistrict / Taluka"

class PincodeRecord(BaseModel):
    pincode: str
    office_name: str
    office_type: str = "Sub Post Office"
    district_id: str
    state_id: str
    country_id: str = "IN"
    taluka: Optional[str] = None

class PincodeValidationResponse(BaseModel):
    pincode: str
    is_valid: bool
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
    city_name: Optional[str] = None
    office_name: Optional[str] = None
    message: str
