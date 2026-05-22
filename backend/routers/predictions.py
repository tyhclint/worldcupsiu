from fastapi import APIRouter, HTTPException

from schemas.knockout_format import CreatePredictionRequest
from services.predictions import insert_prediction


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
def store_prediction(payload: CreatePredictionRequest):
    bracket_data = payload.bracket_data.model_dump(mode="json")

    try:
        stored_prediction = insert_prediction(bracket_data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to store prediction") from exc

    return {
        "valid": True,
        "message": "Prediction stored",
        "prediction": stored_prediction,
    }
