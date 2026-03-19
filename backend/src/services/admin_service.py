from fastapi import UploadFile, HTTPException, BackgroundTasks
from ..services.ingestion_state import reset_state, set_completed, set_error
from ..database import import_csv_to_db, get_reports
from ..ai_model import ai_model

import pandas as pd
import io
from ..ingest_data import ingest_data_from_df

def run_ingestion_task(df):
    try:
        reset_state()
        stats = ingest_data_from_df(df)
        set_completed(f"Successfully imported. Users created: {stats['users_created']}, Reports added: {stats['reports_added']}")
    except Exception as e:
        set_error(str(e))

async def process_csv_upload(file: UploadFile, background_tasks: BackgroundTasks):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")
    
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
        # Validate columns basic check? relying on ingest_data
        
        reset_state() # Reset before starting
        background_tasks.add_task(run_ingestion_task, df)
        
        return {"message": "Ingestion started in background."}
    except Exception as e:
        set_error(str(e))
        raise HTTPException(status_code=400, detail=str(e))

def train_model_logic():
    df = get_reports()
    if df.empty:
        raise HTTPException(status_code=400, detail="No data to train")
    
    metrics = ai_model.train_and_evaluate(df)
    if "error" in metrics:
        raise HTTPException(status_code=400, detail=metrics["error"])
        
    return metrics
