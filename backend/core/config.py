import os
from supabase import create_client, Client
#@TODO: @clint use this instead of creaing a client in main
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)