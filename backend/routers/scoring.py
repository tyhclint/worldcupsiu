from fastapi import APIRouter, HTTPException

from schemas.knockout_format import ScorePredictionRequest
from services.scoring import score_group_stage_predictions
from services.results import fetch_worldcup_standings, normalize_group_standings


router = APIRouter(
    tags=["scoring"],
    prefix="/score",
)


@router.post("/group-stage")
def score_prediction(payload: ScorePredictionRequest):
    group_stage = payload.bracket_data.group_stage if payload.bracket_data else payload.group_stage

    try:
        # Uncomment later on when world cup starts and we have real group standing results
        # raw_standings = fetch_worldcup_standings()
        # actual_results = normalize_group_standings(raw_standings)
        # score_result = score_group_stage_predictions(group_stage, actual_results)
        ##################################################################################

        # comment out this line when world cup starts (line below is for testing only)
        score_result = score_group_stage_predictions(group_stage)

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "valid": True,
        "score": score_result["score"],
        "message": "Group stage score calculated with fake results",
        "lower_is_better": True,
        "group_scores": score_result["group_scores"],
        "group_count": len(group_stage),
    }
