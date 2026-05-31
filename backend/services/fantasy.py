import os

import requests

from core.config import SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL
from schemas.fantasy_format import ApiSportsSquad, ApiSportsSquadsResponse
from services.results import API_FOOTBALL_BASE_URL


API_SPORTS_TEAM_IDS = {
    "ALG": 1532,
    "ARG": 26,
    "AUS": 20,
    "AUT": 775,
    "BEL": 1,
    "BOS": 1113,
    "BRA": 6,
    "CAN": 5529,
    "CAP": 1533,
    "COL": 8,
    "CON": 1508,
    "CRO": 3,
    "CUR": 5530,
    "CZE": 770,
    "ECU": 2382,
    "EGY": 32,
    "ENG": 10,
    "FRA": 2,
    "GER": 25,
    "GHA": 1504,
    "HAI": 2386,
    "IRA": 22,
    "IRQ": 1567,
    "IVO": 1501,
    "JAP": 12,
    "JOR": 1548,
    "KOR": 17,
    "MEX": 16,
    "MOR": 31,
    "NET": 1118,
    "NOR": 1090,
    "NZL": 4673,
    "PAN": 11,
    "PAR": 2380,
    "POR": 27,
    "QAT": 1569,
    "SAU": 23,
    "SCO": 1108,
    "SEN": 13,
    "SOU": 1531,
    "SPA": 9,
    "SWE": 5,
    "SWI": 15,
    "TUN": 28,
    "TUR": 777,
    "URU": 7,
    "USA": 2384,
    "UZB": 1568,
}


def fetch_fantasy_squad(country_code: str) -> ApiSportsSquad:
    api_team_id = API_SPORTS_TEAM_IDS.get(country_code.upper())
    if api_team_id is None:
        raise ValueError(f"Unsupported country code: {country_code}")

    response = requests.get(
        f"{API_FOOTBALL_BASE_URL}/players/squads",
        headers={"x-apisports-key": os.environ["API_FOOTBALL_KEY"]},
        params={"team": str(api_team_id)},
        timeout=10,
    )
    response.raise_for_status()

    squad_response = ApiSportsSquadsResponse.model_validate(response.json())
    if not squad_response.response:
        raise ValueError(f"No squad found for country code: {country_code}")

    return squad_response.response[0]


def upsert_fantasy_squad(fantasy_squad, access_token: str):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/user_predictions?on_conflict=user_id",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        },
        json={
            "fantasy_squad": fantasy_squad,
        },
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()
    return data[0] if data else None


def retrieve_fantasy_squad(user_id: str, access_token: str):
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/user_predictions",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        params={
            "select": "fantasy_squad",
            "user_id": f"eq.{user_id}",
            "limit": "1",
        },
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()
    return data[0]["fantasy_squad"] if data else None
