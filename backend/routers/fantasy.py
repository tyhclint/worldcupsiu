import requests
from fastapi import APIRouter, Header, HTTPException

from core.config import supabase
from schemas.fantasy_format import ApiSportsSquad, FantasyScoreResponse, SaveFantasySquadRequest
from services.auth import get_access_token
from services.fantasy import (
    fetch_fantasy_squad,
    retrieve_fantasy_squad,
    score_fantasy_squad,
    update_fantasy_score,
    upsert_fantasy_squad,
)


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
        fantasy_record = retrieve_fantasy_squad(user_response.user.id, access_token)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to retrieve fantasy squad") from exc

    return {
        "fantasy_squad": fantasy_record["fantasy_squad"] if fantasy_record else None,
        "fantasy_score": fantasy_record["fantasy_score"] if fantasy_record else None,
    }


@router.get("/squad/score", response_model=FantasyScoreResponse)
async def score_user_fantasy_squad(authorization: str = Header(...)):
    access_token = get_access_token(authorization)

    try:
        user_response = supabase.auth.get_user(access_token)
        fantasy_record = retrieve_fantasy_squad(user_response.user.id, access_token)

        if fantasy_record is None:
            raise HTTPException(status_code=404, detail="No fantasy squad found")

        score_result = await score_fantasy_squad(fantasy_record["fantasy_squad"])
        update_fantasy_score(user_response.user.id, score_result["score"], access_token)
        return score_result
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.patch("/squad")
async def save_fantasy_squad(
    payload: SaveFantasySquadRequest,
    authorization: str = Header(...),
):
    access_token = get_access_token(authorization)
    fantasy_squad = payload.fantasy_squad.model_dump(mode="json")

    try:
        user_response = supabase.auth.get_user(access_token)
        saved_squad = upsert_fantasy_squad(
            user_response.user.id,
            fantasy_squad,
            access_token,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "valid": True,
        "message": "Fantasy squad saved",
        "fantasy_score": saved_squad.get("fantasy_score") if saved_squad else None,
        "prediction": saved_squad,
    }
