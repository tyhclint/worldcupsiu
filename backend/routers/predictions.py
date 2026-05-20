from fastapi import APIRouter

from schema import CreatePredictionRequest


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
