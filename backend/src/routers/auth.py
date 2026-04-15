from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from auth import create_access_token, get_password_hash, verify_password, get_current_user
from database import create_user, get_user_by_username
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=bool)
async def register(user: UserCreate):
    user_exists = get_user_by_username(user.username)
    if user_exists:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    success = create_user(user.username, hashed_password)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to create user")
    return True

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user['username'], "role": user['role']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "role": current_user["role"],
        "id": current_user["id"],
        "full_name": current_user["full_name"],
        "email": current_user["email"],
        "mobile_number": current_user["mobile_number"],
        "age": current_user["age"],
        "sex": current_user["sex"],
        "date_of_birth": current_user["date_of_birth"],
        "aadhaar_number": current_user["aadhaar_number"]
    }
