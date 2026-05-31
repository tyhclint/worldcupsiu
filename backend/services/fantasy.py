import os

import requests

from schemas.fantasy_format import ApiSportsSquad, ApiSportsSquadsResponse
from services.results import API_FOOTBALL_BASE_URL


API_SPORTS_TEAM_IDS = {
    "ARG": 26,
    "AUS": 20,
    "BEL": 1,
    "BRA": 6,
    "CAM": 1530,
    "CAN": 5529,
    "COS": 29,
    "CRO": 3,
    "DEN": 21,
    "ECU": 2382,
    "ENG": 10,
    "FRA": 2,
    "GER": 25,
    "GHA": 1504,
    "IRA": 22,
    "JAP": 12,
    "KOR": 17,
    "MEX": 16,
    "MOR": 31,
    "NET": 1118,
    "POL": 24,
    "POR": 27,
    "QAT": 1569,
    "SAU": 23,
    "SEN": 13,
    "SER": 14,
    "SPA": 9,
    "SWI": 15,
    "TUN": 28,
    "URU": 7,
    "USA": 2384,
    "WAL": 767,
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
