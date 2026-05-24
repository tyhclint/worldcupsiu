from fastapi import APIRouter, Header, HTTPException

from core.config import supabase
from schemas.knockout_format import CreatePredictionRequest
from services.predictions import insert_prediction


router = APIRouter(
    tags=["predictions"],
)


def get_access_token(authorization: str) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Missing auth token")

    try:
        user_response = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid auth token") from exc

    if not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid auth token")

    return token


@router.post("/score")
def score_prediction(payload: CreatePredictionRequest):
    return {
        "valid": True,
        "score": 0,
        "message": "Scoring endpoint placeholder",
        "group_count": len(payload.bracket_data.group_stage),
        "wildcard_count": len(payload.bracket_data.wildcards),
        "knockout_pick_count": len(payload.bracket_data.knockouts),
    }

@router.post("/store")
def store_prediction(payload: CreatePredictionRequest, authorization: str = Header(...)):
    access_token = get_access_token(authorization)
    bracket_data = payload.bracket_data.model_dump(mode="json")

    try:
        stored_prediction = insert_prediction(bracket_data, access_token)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to store prediction") from exc

    return {
        "valid": True,
        "message": "Prediction stored",
        "prediction": stored_prediction,
    }
