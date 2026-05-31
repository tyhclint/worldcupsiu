import requests
from fastapi import APIRouter, HTTPException

from schemas.fantasy_format import ApiSportsSquad
from services.fantasy import fetch_fantasy_squad


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
