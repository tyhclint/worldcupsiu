import json
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

from services.results import normalize_group_standings


load_dotenv(BACKEND_ROOT / ".env")

api_key = os.environ["API_FOOTBALL_KEY"]
url = "https://v3.football.api-sports.io/standings"

response = requests.get(
    url,
    headers={"x-apisports-key": api_key},
    params={"league": "1", "season": "2022"},
    timeout=10,
)
response.raise_for_status()

normalized = normalize_group_standings(response.json())
print(json.dumps(normalized, indent=2))
