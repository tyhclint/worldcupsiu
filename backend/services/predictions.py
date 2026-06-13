import requests

from core.config import SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabase_admin


def upsert_prediction(bracket_data, access_token: str):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/user_predictions?on_conflict=user_id",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
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


def update_prediction(user_id: str, bracket_data, access_token: str):
    response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/user_predictions",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        params={
            "user_id": f"eq.{user_id}",
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


def list_all_predictions():
    response = (
        supabase_admin.table("user_predictions")
        .select("user_id,bracket_data,global_score")
        .execute()
    )
    return response.data or []


def update_prediction_score_admin(user_id: str, score: int, details=None):
    payload = {
        "global_score": score,
    }
    if details is not None:
        payload["score_breakdown"] = details

    response = (
        supabase_admin.table("user_predictions")
        .update(payload)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0] if response.data else None
