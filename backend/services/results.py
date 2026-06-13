import re
import os
from typing import Any

import requests


API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"

API_TEAM_ID_TO_TEAM_ID = {
    1: "belgium",
    2: "france",
    3: "croatia",
    5: "sweden",
    6: "brazil",
    7: "uruguay",
    8: "colombia",
    9: "spain",
    10: "england",
    11: "panama",
    12: "japan",
    13: "senegal",
    15: "switzerland",
    16: "mexico",
    17: "south-korea",
    20: "australia",
    22: "iran",
    23: "saudi-arabia",
    25: "germany",
    26: "argentina",
    27: "portugal",
    28: "tunisia",
    31: "morocco",
    32: "egypt",
    770: "czechia",
    775: "austria",
    777: "turkiye",
    1090: "norway",
    1108: "scotland",
    1113: "bosnia",
    1118: "netherlands",
    1501: "ivory-coast",
    1504: "ghana",
    1508: "congo-dr",
    1531: "south-africa",
    1532: "algeria",
    1533: "cabo-verde",
    1548: "jordan",
    1567: "iraq",
    1568: "uzbekistan",
    1569: "qatar",
    2380: "paraguay",
    2382: "ecuador",
    2384: "usa",
    2386: "haiti",
    4673: "new-zealand",
    5529: "canada",
    5530: "curacao",
}


def fetch_worldcup_standings(season: int = 2026) -> dict[str, Any]:
    response = requests.get(
        f"{API_FOOTBALL_BASE_URL}/standings",
        headers={"x-apisports-key": os.environ["API_FOOTBALL_KEY"]},
        params={"league": "1", "season": str(season)},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def normalize_team_name(team_name: str) -> str:
    return re.sub(r"\s+", "-", team_name.strip().lower())


def normalize_team(team: dict[str, Any]) -> str:
    team_id = team.get("id")
    if team_id in API_TEAM_ID_TO_TEAM_ID:
        return API_TEAM_ID_TO_TEAM_ID[team_id]

    return normalize_team_name(team["name"])


def normalize_group_name(group_name: str) -> str:
    return group_name.strip().replace(" ", "_")


def normalize_group_standings(api_payload: dict[str, Any]) -> dict[str, list[str]]:
    standings = api_payload["response"][0]["league"]["standings"]
    normalized_results = {}

    for group_standings in standings:
        sorted_group = sorted(group_standings, key=lambda row: row["rank"])
        group_key = normalize_group_name(sorted_group[0]["group"])

        normalized_results[group_key] = [
            normalize_team(row["team"])
            for row in sorted_group
        ]

    return normalized_results
