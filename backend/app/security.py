from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# JWT Token
SECRET_KEY = "your-secret-key"  # TODO: Move to config and use a strong key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class TokenData(BaseModel):
    username: Optional[str] = None

# Imports needed for get_current_user
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .. import schemas # Assuming schemas.py is one level up then down into schemas
# Placeholder for database interactions if get_current_user needs them directly
# from .. import database # This would be for a real DB

# Imports needed for get_current_user
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .. import schemas
# from .. import database # This would be for a real DB
from ..routers.auth import fake_users_db # Import from auth.py - HACK for fake DB

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login") # tokenUrl is relative to the app root

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_access_token(token)
    if token_data is None or token_data.username is None:
        raise credentials_exception

    # user = database.get_user(db, username=token_data.username) # Real DB call
    # user = database.get_user(db, username=token_data.username) # Real DB call
    user = fake_users_db.get(token_data.username) # Use imported fake_users_db

    if user is None:
        raise credentials_exception
    # User is a dict from fake_users_db. Convert to User schema.
    # schemas.User already excludes 'hashed_password' if it's not a field there.
    return schemas.User(**user)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None # Or raise exception
        return TokenData(username=username)
    except JWTError:
        return None # Or raise exception
