import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
