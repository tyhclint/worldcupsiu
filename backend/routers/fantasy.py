import requests
from fastapi import APIRouter, Header, HTTPException

from core.config import supabase
from schemas.fantasy_format import ApiSportsSquad, SaveFantasySquadRequest
from services.auth import get_access_token
from services.fantasy import fetch_fantasy_squad, retrieve_fantasy_squad, upsert_fantasy_squad


router = APIRouter(
    tags=["fantasy"],
    prefix="/fantasy",
)


@router.get("/squads/{country_code}", response_model=ApiSportsSquad)
def get_fantasy_squad(country_code: str):
    try:
        return fetch_fantasy_squad(country_code)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="Failed to fetch squad") from exc


@router.get("/squad")
def retrieve_user_fantasy_squad(authorization: str = Header(...)):
    access_token = get_access_token(authorization)

    try:
        user_response = supabase.auth.get_user(access_token)
        fantasy_squad = retrieve_fantasy_squad(user_response.user.id, access_token)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to retrieve fantasy squad") from exc

    return {
        "fantasy_squad": fantasy_squad,
    }


@router.patch("/squad")
def save_fantasy_squad(
    payload: SaveFantasySquadRequest,
    authorization: str = Header(...),
):
    access_token = get_access_token(authorization)
    fantasy_squad = payload.fantasy_squad.model_dump(mode="json")

    try:
        saved_squad = upsert_fantasy_squad(fantasy_squad, access_token)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to save fantasy squad") from exc

    return {
        "valid": True,
        "message": "Fantasy squad saved",
        "prediction": saved_squad,
    }
