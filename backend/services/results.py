import re
import os
from typing import Any

import requests


API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"


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


def normalize_group_name(group_name: str) -> str:
    return group_name.strip().replace(" ", "_")


def normalize_group_standings(api_payload: dict[str, Any]) -> dict[str, list[str]]:
    standings = api_payload["response"][0]["league"]["standings"]
    normalized_results = {}

    for group_standings in standings:
        sorted_group = sorted(group_standings, key=lambda row: row["rank"])
        group_key = normalize_group_name(sorted_group[0]["group"])

        normalized_results[group_key] = [
            normalize_team_name(row["team"]["name"])
            for row in sorted_group
        ]

    return normalized_results
