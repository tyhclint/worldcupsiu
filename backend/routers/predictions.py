from fastapi import APIRouter, HTTPException, Request

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

@router.post("/store")
def store_prediction(payload: CreatePredictionRequest, request: Request):
    supabase = getattr(request.app.state, "supabase", None)
    if supabase is None:
        raise HTTPException(status_code=503, detail="Supabase client is not initialized")

    bracket_data = payload.bracket_data.model_dump(mode="json")

    try:
        response = (
            supabase
            .table("user_predictions")
            .insert({
                "user_id": None,
                "bracket_data": bracket_data,
                "global_score": 0,
            })
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to store prediction") from exc

    stored_prediction = response.data[0] if response.data else None

    return {
        "valid": True,
        "message": "Prediction stored",
        "prediction": stored_prediction,
    }
