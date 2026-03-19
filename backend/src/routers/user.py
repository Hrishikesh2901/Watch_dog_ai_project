from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..auth import get_current_user
from ..database import add_report, get_reports

router = APIRouter()

class ReportCreate(BaseModel):
    category: str
    location: str
    description: str
    tags: List[str]

@router.post("/submit-report")
async def submit_report(report: ReportCreate, current_user: dict = Depends(get_current_user)):
    add_report(
        category=report.category,
        location=report.location,
        description=report.description,
        tags=report.tags,
        user_id=current_user['id']
    )
    return {"message": "Report submitted successfully"}

@router.get("/my-reports")
async def read_my_reports(current_user: dict = Depends(get_current_user)):
    df = get_reports(user_id=current_user['id'])
    return df.to_dict(orient="records")
