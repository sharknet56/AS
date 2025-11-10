from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, User as UserSchema, Token
from app.security import verify_password, get_password_hash, create_access_token
from app.config import get_settings
import requests
from pydantic import BaseModel


router = APIRouter()
settings = get_settings()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with hashed password
    """
    # Check if username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash the password before storing
    hashed_password = get_password_hash(user.password)
    
    # Create new user
    db_user = User(
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login user and return JWT access token
    """
    # Find user by username
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_db)):
    """
    Get current user information
    """
    return current_user

class AuthCode(BaseModel):
    code: str

@router.post("/google_login")
async def google_login(auth: AuthCode, 
                       response: Response, 
                       db: Session = Depends(get_db)):
    auth_code = auth.code

    data = {
        "code": auth_code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_SECRET_KEY,
        "redirect_uri": "postmessage",
        "grant_type": "authorization_code",
    }

    token_res = requests.post("https://oauth2.googleapis.com/token", data=data)
    if token_res.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange code for token")

    token_data = token_res.json()
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}

    user_info_res = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers=headers)
    if user_info_res.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch user info")

    user_info = user_info_res.json()
    username = user_info['name']
    
    # Example placeholder: check/add user to database
    # user = get_or_create_user(user_info)
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Create new user
        db_user = User(
            username=username,
            hashed_password=None
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "username": username}