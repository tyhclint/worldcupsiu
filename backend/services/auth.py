from core.config import supabase

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