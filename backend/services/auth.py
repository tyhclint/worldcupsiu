from core.config import supabase
from fastapi import HTTPException

#dummy domain to use supabase email auth
DUMMY_DOMAIN = "@yourapp.local"

def register_user(username: str, password: str):
    """Registers a new user with a dummy email."""
    dummy_email = f"{username}{DUMMY_DOMAIN}"
    
    response = supabase.auth.sign_up({
        "email": dummy_email,
        "password": password,
        "options": {
            "data": {
                "username": username
            }
        }
    })

    supabase.table("users").insert({
        "user_id": response.user.id,
        "username": username,
    }).execute()

    return response

def authenticate_user(username: str, password: str):
    """Authenticates a user using their dummy email."""
    dummy_email = f"{username}{DUMMY_DOMAIN}"
    
    response = supabase.auth.sign_in_with_password({
        "email": dummy_email,
        "password": password,
    })
    return response

def get_access_token(authorization: str) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Missing auth token")

    try:
        user_response = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid auth token") from exc

    if not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid auth token")

    return token

def refresh_user_session(refresh_token: str):
    """
    Trades a valid refresh token for a brand new access token and refresh token pair.
    """
    response = supabase.auth.refresh_session(refresh_token)
    return response