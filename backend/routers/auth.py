from fastapi import APIRouter, HTTPException
from services import auth as auth_service
from schemas.auth_format import AuthRequest
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)
class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/signup")
async def sign_up(req: AuthRequest):
    try:

        response = auth_service.register_user(req.username, req.password)
        
        if response.user is None:
            raise HTTPException(status_code=400, detail="Signup failed.")
            
        return {"message": "User created successfully", "user_id": response.user.id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(req: AuthRequest):
    try:
        response = auth_service.authenticate_user(req.username, req.password)
        
        # Return the JWTs to the client
        return {
            "message": "Login successful",
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": response.user.user_metadata.get("username"),    
            "user_id": response.user.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    
@router.post("/refresh")
async def refresh_session(req: RefreshRequest):
    try:
        response = auth_service.refresh_user_session(req.refresh_token)
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")