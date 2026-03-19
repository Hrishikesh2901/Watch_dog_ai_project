
# Global simple state for ingestion progress
# In a real production app, this should be in Redis or database for scale/persistence.

ingestion_state = {
    "status": "idle", # idle, processing, completed, error
    "total": 0,
    "current": 0,
    "message": ""
}

def update_progress(current, total, message=""):
    ingestion_state["status"] = "processing"
    ingestion_state["current"] = current
    ingestion_state["total"] = total
    ingestion_state["message"] = message

def set_completed(message="Completed"):
    ingestion_state["status"] = "completed"
    ingestion_state["message"] = message

def set_error(error_message):
    ingestion_state["status"] = "error"
    ingestion_state["message"] = error_message

def reset_state():
    ingestion_state["status"] = "idle"
    ingestion_state["total"] = 0
    ingestion_state["current"] = 0
    ingestion_state["message"] = ""

def get_status():
    return ingestion_state
