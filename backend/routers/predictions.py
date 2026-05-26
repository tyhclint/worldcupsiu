from fastapi import APIRouter, Header, HTTPException

from core.config import supabase
from schemas.knockout_format import CreatePredictionRequest
from services.predictions import insert_prediction, retrieve_prediction, update_prediction
from services.auth import get_access_token


router = APIRouter(
    tags=["predictions"],
)

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


@router.get("/retrieve")
def retrieve_user_prediction(authorization: str = Header(...)):
    access_token = get_access_token(authorization)

    try:
        user_response = supabase.auth.get_user(access_token)
        bracket_data = retrieve_prediction(user_response.user.id, access_token)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to retrieve prediction") from exc

    return {
        "bracket_data": bracket_data,
    }


@router.patch("/update")
def update_user_prediction(payload: CreatePredictionRequest, authorization: str = Header(...)):
    access_token = get_access_token(authorization)
    bracket_data = payload.bracket_data.model_dump(mode="json")

    try:
        user_response = supabase.auth.get_user(access_token)
        updated_prediction = update_prediction(user_response.user.id, bracket_data, access_token)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to update prediction") from exc

    if updated_prediction is None:
        raise HTTPException(status_code=404, detail="No prediction found to update")

    return {
        "valid": True,
        "message": "Prediction updated",
        "prediction": updated_prediction,
    }
