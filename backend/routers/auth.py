from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import auth_service  # Importing your new service

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

#@TODO: move this shit to a schema file
class AuthRequest(BaseModel):
    username: str
    password: str

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
            "user": response.user.user_metadata.get("username")
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid username or password.")