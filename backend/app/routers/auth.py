from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # OAuth2PasswordBearer removed
from datetime import datetime, timedelta
# from pydantic import BaseModel # No longer needed here

from .. import schemas
from .. import security
from ..security import get_current_user # Import get_current_user

# Placeholder for database dependency - replace with actual DB session
async def get_db():
    return None

# oauth2_scheme moved to security.py

router = APIRouter(
    tags=["auth"],
)

# Placeholder for user database - this will be imported by security.py
fake_users_db = {}

# Token model is now in schemas.py
# get_current_user moved to security.py


@router.post("/register", response_model=schemas.User)
async def register(user: schemas.UserCreate): # db dependency removed
    # Placeholder: Check if user already exists
    if user.username in fake_users_db:
        raise HTTPException(status_code=400, detail="Username already registered")
    if any(u.get("email") == user.email for u in fake_users_db.values()): # Check email - simplified
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = security.get_password_hash(user.password)

    # Placeholder: Save user to DB
    user_id = len(fake_users_db) + 1 # Simple ID generation
    db_user_data = {
        "id": user_id, # Ensure User schema expects id
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(), # Ensure User schema expects created_at
        "updated_at": datetime.utcnow()  # Ensure User schema expects updated_at
    }
    fake_users_db[user.username] = db_user_data # This is the dict get_current_user will see

    # Construct User model for response
    # schemas.User should handle not exposing hashed_password
    return schemas.User(**db_user_data)


@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()): # db dependency removed
    user_in_db = fake_users_db.get(form_data.username)
    if not user_in_db:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password") # status 401

    if not security.verify_password(form_data.password, user_in_db["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password") # status 401

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user_in_db["username"]}, expires_delta=access_token_expires # "sub" is standard for subject (username)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    # current_user is now an instance of schemas.User as returned by get_current_user in security.py
    return current_user
