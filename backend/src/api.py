from fastapi import FastAPI
from .database import init_db
from .routers import reports, admin, auth, user

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Citizen-Led AI Audit Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
init_db()

# Include Routers
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(user.router, prefix="/api", tags=["user"])
