from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from supabase import Client, create_client
from dotenv import load_dotenv
import os

from routers import api_router

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SECRET_KEY"),
    )

    # Test connection
    try:
        app.state.supabase.table("user_predictions").select("*").limit(1).execute()
        print("Supabase connection established")
    except Exception as e:
        print(f"Supabase connection failed: {e}")

    yield

    app.state.supabase = None

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def read_root():
    return {"status": "ok"}
