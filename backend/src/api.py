from fastapi import FastAPI
import uvicorn
from database import init_db
from routers import reports, admin, auth, user
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Citizen-Led AI Audit Platform API")

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development ke liye sab allowed hai
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialize
# Note: Ensure init_db is robust enough to handle existing tables
init_db()

# Routers Include
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(user.router, prefix="/api", tags=["user"])

@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Watchdog AI Backend is running!"}

# Yeh block container ko "Running" state mein rakhega
if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)