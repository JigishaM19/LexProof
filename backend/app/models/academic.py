from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class BranchRecord(BaseModel):
    id: str
    course_id: str
    name: str
    short_name: Optional[str] = None
    code: Optional[str] = None

class CourseRecord(BaseModel):
    id: str
    name: str
    short_name: Optional[str] = None
    category: str = "Undergraduate"  # Undergraduate, Postgraduate, Diploma, Doctorate, Certificate
    duration_years: int = 4
    total_semesters: int = 8
    is_annual_system: bool = False
    year_options: List[str]
    semester_options: List[str]
    branches: List[BranchRecord] = []

class InstitutionRecord(BaseModel):
    id: str
    name: str
    country_id: str = "IN"
    state_id: str
    district_id: Optional[str] = None
    city_id: Optional[str] = None
    institution_type: str = "University"  # University, Autonomous College, Affiliated College, Institute, Board
    aishe_code: Optional[str] = None
    is_autonomous: bool = False
    supported_course_ids: Optional[List[str]] = None  # None means all standard catalogue courses supported

class AcademicStructureResponse(BaseModel):
    course_id: str
    course_name: str
    duration_years: int
    is_annual_system: bool
    year_options: List[str]
    semester_options: List[str]
