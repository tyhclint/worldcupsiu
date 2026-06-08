import json
import os
import sys

import requests
from dotenv import load_dotenv
load_dotenv()


API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"


def main():
    team_id = sys.argv[1] if len(sys.argv) > 1 else "10"
    page = sys.argv[2] if len(sys.argv) > 2 else "1"

    team_players_params = {
        "league": "1",
        "season": "2026",
        "team": team_id,
        "page": page,
    }
    all_players_params = {
        "league": "1",
        "season": "2026",
        "page": page,
    }

    headers = {"x-apisports-key": os.environ["API_FOOTBALL_KEY"]}

    team_players_response = requests.get(
        f"{API_FOOTBALL_BASE_URL}/players",
        headers=headers,
        params=team_players_params,
        timeout=10,
    )
    all_players_response = requests.get(
        f"{API_FOOTBALL_BASE_URL}/players",
        headers=headers,
        params=all_players_params,
        timeout=10,
    )

    print("Team players status:", team_players_response.status_code)
    print(json.dumps(team_players_response.json(), indent=2, ensure_ascii=False))
    print()
    print("All players status:", all_players_response.status_code)
    print(json.dumps(all_players_response.json(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
