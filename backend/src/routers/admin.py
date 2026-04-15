from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Body, BackgroundTasks
from services.admin_service import process_csv_upload, train_model_logic
from services.ingestion_state import get_status
from auth import get_current_admin_user
from database import get_reports, update_report_status, get_analytics_data, get_all_users_with_status, clear_database_content, clean_duplicate_reports
from ingest_data import ingest_data
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str
    rejection_reason: Optional[str] = None
    resolution_steps: Optional[str] = None

@router.post("/upload")
async def upload_csv(background_tasks: BackgroundTasks, file: UploadFile = File(...), admin: dict = Depends(get_current_admin_user)):
    return await process_csv_upload(file, background_tasks)

@router.post("/train")
def train_model(admin: dict = Depends(get_current_admin_user)):
    return train_model_logic()

@router.get("/reports")
async def get_all_reports(admin: dict = Depends(get_current_admin_user)):
    df = get_reports()
    return df.to_dict(orient="records")

@router.put("/reports/{report_id}/status")
async def update_status(report_id: int, update: StatusUpdate, admin: dict = Depends(get_current_admin_user)):
    success = update_report_status(report_id, update.status, update.rejection_reason, update.resolution_steps)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found or update failed")
    return {"message": "Status updated successfully"}

@router.get("/analytics")
async def get_analytics(admin: dict = Depends(get_current_admin_user)):
    return get_analytics_data()

@router.get("/users")
async def get_users(
    page: int = 1, 
    limit: int = 50, 
    status: Optional[str] = None,
    admin: dict = Depends(get_current_admin_user)
):
    offset = (page - 1) * limit
    # Normalize status 'All' to None
    status_filter = status if status != 'All' else None
    
    return get_all_users_with_status(limit, offset, status_filter)

@router.get("/ingest/status")
async def get_ingestion_status(admin: dict = Depends(get_current_admin_user)):
    return get_status()

@router.post("/ingest")
async def trigger_ingestion(admin: dict = Depends(get_current_admin_user)):
    try:
        ingest_data()
        return {"message": "Ingestion completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clear-data")
async def clear_data(admin: dict = Depends(get_current_admin_user)):
    try:
        clear_database_content()
        return {"message": "All non-admin data cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clean-data")
async def clean_data_endpoint(admin: dict = Depends(get_current_admin_user)):
    try:
        result = clean_duplicate_reports()
        if not result["success"]:
             raise Exception(result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
