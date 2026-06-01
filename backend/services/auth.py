# services/auth.py
from core.config import supabase
from fastapi import HTTPException
import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")



def register_user(email: str, username: str, password: str):
    """Registers a new user with their actual email."""
    
    response = supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": {
                "username": username
            }
        }
    })

    # Ensure the user was actually created before inserting into the public table
    if response.user:
        supabase.table("users").insert({
            "user_id": response.user.id,
            "username": username,
        }).execute()

    return response

def authenticate_user(email: str, password: str):
    """Authenticates a user using their real email."""
    
    response = supabase.auth.sign_in_with_password({
        "email": email,
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


def request_password_reset(email: str):
    """Triggers a password reset email from Supabase."""
    
    response = supabase.auth.reset_password_for_email(
        email,
        options={
            "redirect_to": f"{FRONTEND_URL}/update-password"
        }
    )
    return response

def update_user_password(access_token: str, new_password: str):
    """Updates the user's password using their recovery access token."""
    supabase.auth.set_session(access_token=access_token, refresh_token="")

    response = supabase.auth.update_user({
        "password": new_password
    })
    supabase.auth.sign_out()
    
    return response