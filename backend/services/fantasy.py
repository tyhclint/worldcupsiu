import asyncio
import os

import httpx
import requests

from core.config import SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabase_admin
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


async def fetch_player_rating(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    player_id: int,
    player_name: str,
    league: int = 1,
    season: int = 2026,
):
    async with semaphore:
        response = await client.get(
            f"{API_FOOTBALL_BASE_URL}/players",
            headers={"x-apisports-key": os.environ["API_FOOTBALL_KEY"]},
            params={"id": str(player_id), "league": str(league), "season": str(season)},
        )
    response.raise_for_status()

    data = response.json()
    players = data.get("response", [])
    if not players:
        raise ValueError(f"Missing rating data for {player_name}")

    item = players[0]
    player = item.get("player", {})
    rating = item.get("statistics", [{}])[0].get("games", {}).get("rating")
    if rating is None:
        raise ValueError(f"Missing rating for {player_name}")

    return {
        "id": player.get("id", player_id),
        "name": player.get("name", player_name),
        "rating": float(rating) if rating is not None else None,
    }


async def score_fantasy_squad(fantasy_squad):
    selected_players = list(fantasy_squad["starters"].values()) + list(fantasy_squad["bench"].values())
    if len(selected_players) != 16:
        raise ValueError("Fantasy squad must include 16 players before scoring")

    semaphore = asyncio.Semaphore(10)

    async with httpx.AsyncClient(timeout=10) as client:
        rating_results = await asyncio.gather(*[
            fetch_player_rating(client, semaphore, player["id"], player["name"])
            for player in selected_players
        ], return_exceptions=True)

    errors = [str(result) for result in rating_results if isinstance(result, Exception)]
    if errors:
        raise ValueError("; ".join(errors))

    player_ratings = [result for result in rating_results if not isinstance(result, Exception)]
    ratings = [player["rating"] for player in player_ratings if player["rating"] is not None]

    return {
        "score": round(sum(ratings) / len(ratings), 2) if ratings else None,
        "players": player_ratings,
    }

def update_fantasy_score(user_id: str, fantasy_score: float, access_token: str):
    response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/user_fantasy_squads",
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
            "fantasy_score": fantasy_score,
        },
        timeout=10,
    )
    if not response.ok:
        raise ValueError(response.text)

    data = response.json()
    return data[0] if data else None


def upsert_fantasy_squad(user_id: str, fantasy_squad, access_token: str):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/user_fantasy_squads?on_conflict=user_id",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        },
        json={
            "user_id": user_id,
            "fantasy_squad": fantasy_squad,
        },
        timeout=10,
    )
    if not response.ok:
        raise ValueError(response.text)

    data = response.json()
    return data[0] if data else None


def retrieve_fantasy_squad(user_id: str, access_token: str):
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/user_fantasy_squads",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        params={
            "select": "fantasy_squad,fantasy_score",
            "user_id": f"eq.{user_id}",
            "limit": "1",
        },
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()
    return data[0] if data else None


def list_all_fantasy_squads():
    response = (
        supabase_admin.table("user_fantasy_squads")
        .select("user_id,fantasy_squad,fantasy_score")
        .execute()
    )
    return response.data or []


def update_fantasy_score_admin(user_id: str, fantasy_score: float | None, details=None):
    payload = {
        "fantasy_score": fantasy_score,
    }
    if details is not None:
        payload["fantasy_score_breakdown"] = details

    response = (
        supabase_admin.table("user_fantasy_squads")
        .update(payload)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0] if response.data else None
