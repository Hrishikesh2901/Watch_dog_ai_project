from fastapi import APIRouter
from pydantic import BaseModel
from services.report_service import submit_report_logic, get_all_reports

router = APIRouter()

class ReportCreate(BaseModel):
    category: str
    location: str
    description: str

@router.post("/reports")
def create_report(report: ReportCreate):
    return submit_report_logic(report.category, report.location, report.description)

@router.get("/reports")
def read_reports():
    return get_all_reports()
