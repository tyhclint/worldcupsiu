# routers/auth.py
from fastapi import APIRouter, HTTPException
from services import auth as auth_service
from schemas.auth_format import SignupRequest, LoginRequest, RefreshRequest, PasswordResetRequest, UpdatePasswordRequest, UpdateUsernameRequest

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/signup")
async def sign_up(req: SignupRequest):
    try:
        response = auth_service.register_user(req.email, req.username, req.password)
        
        if response.user is None:
            raise HTTPException(status_code=400, detail="Signup failed.")
            
        return {"message": "User created successfully", "user_id": response.user.id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(req: LoginRequest):
    try:
        # Now logging in with email instead of username
        response = auth_service.authenticate_user(req.email, req.password)
        
        # Return the JWTs to the client
        username = auth_service.get_username(response.user.id)
        return {
            "message": "Login successful",
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": username,
            "user_id": response.user.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
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
    

@router.post("/resetpassword")
async def request_password_reset(req: PasswordResetRequest):
    try:
        auth_service.request_password_reset(req.email)
        return {"message": "If that email exists, a reset link has been sent."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

from fastapi import Header

# Add this new endpoint
@router.post("/update-password")
async def update_password(
    req: UpdatePasswordRequest, 
    authorization: str = Header(...)
):
    try:
        token = auth_service.get_access_token(authorization)
        
        auth_service.update_user_password(token, req.password)
        
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/update-username")
async def update_username(
    req: UpdateUsernameRequest,
    authorization: str = Header(...)
):
    username = req.username.strip()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if len(username) > 30:
        raise HTTPException(status_code=400, detail="Username must be 30 characters or fewer.")

    try:
        token = auth_service.get_access_token(authorization)
        auth_service.update_username(token, username)
        return {"message": "Username updated successfully", "username": username}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
