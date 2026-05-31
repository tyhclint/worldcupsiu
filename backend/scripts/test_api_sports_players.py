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

    params = {
        "league": "1",
        "season": "2026",
        "team": team_id,
        "page": page,
    }

    response = requests.get(
        f"{API_FOOTBALL_BASE_URL}/players",
        headers={"x-apisports-key": os.environ["API_FOOTBALL_KEY"]},
        params=params,
        timeout=10,
    )

    print("Status:", response.status_code)
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
