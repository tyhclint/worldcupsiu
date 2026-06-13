import pytest

from schemas.knockout_format import GroupPlacements
from services.scoring import score_group_stage_predictions
from services.results import normalize_group_standings


def test_score_group_stage_predictions_uses_absolute_distance():
    group_stage = {
        "Group_A": GroupPlacements(
            first="mexico",
            second="south-korea",
            third="south-africa",
        ),
    }
    actual_results = {
        "Group_A": ["south-korea", "mexico", "czechia", "south-africa"],
    }

    result = score_group_stage_predictions(group_stage, actual_results)

    assert result["score"] == 4
    assert result["group_scores"]["Group_A"]["score"] == 4
    assert result["group_scores"]["Group_A"]["placements"]["first"]["score"] == 1
    assert result["group_scores"]["Group_A"]["placements"]["second"]["score"] == 1
    assert result["group_scores"]["Group_A"]["placements"]["third"]["score"] == 1
    assert result["group_scores"]["Group_A"]["placements"]["fourth"]["team_id"] == "czechia"
    assert result["group_scores"]["Group_A"]["placements"]["fourth"]["score"] == 1


def test_score_group_stage_predictions_returns_zero_for_perfect_prediction():
    group_stage = {
        "Group_A": GroupPlacements(
            first="south-korea",
            second="mexico",
            third="czechia",
        ),
    }
    actual_results = {
        "Group_A": ["south-korea", "mexico", "czechia", "south-africa"],
    }

    result = score_group_stage_predictions(group_stage, actual_results)

    assert result["score"] == 0


def test_score_group_stage_predictions_rejects_team_outside_group():
    group_stage = {
        "Group_A": GroupPlacements(
            first="brazil",
            second="mexico",
            third="czechia",
        ),
    }
    actual_results = {
        "Group_A": ["south-korea", "mexico", "czechia", "south-africa"],
    }

    with pytest.raises(ValueError, match="brazil is not in Group_A"):
        score_group_stage_predictions(group_stage, actual_results)


def test_normalize_group_standings_uses_api_team_ids():
    api_payload = {
        "response": [
            {
                "league": {
                    "standings": [
                        [
                            {
                                "rank": 1,
                                "group": "Group B",
                                "team": {
                                    "id": 1113,
                                    "name": "Bosnia & Herzegovina",
                                },
                            },
                            {
                                "rank": 2,
                                "group": "Group B",
                                "team": {
                                    "id": 777,
                                    "name": "Türkiye",
                                },
                            },
                        ]
                    ],
                },
            }
        ],
    }

    result = normalize_group_standings(api_payload)

    assert result["Group_B"] == ["bosnia", "turkiye"]
