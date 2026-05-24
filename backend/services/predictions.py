import requests

from core.config import SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL


def insert_prediction(bracket_data, access_token: str):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/user_predictions",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        json={
            "bracket_data": bracket_data,
            "global_score": 0,
        },
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()
    return data[0] if data else None


def retrieve_prediction(user_id: str, access_token: str):
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/user_predictions",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        params={
            "select": "bracket_data",
            "user_id": f"eq.{user_id}",
            "limit": "1",
        },
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()
    return data[0]["bracket_data"] if data else None
