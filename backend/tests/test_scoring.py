import pytest

from schemas.knockout_format import (
    EXPECTED_GROUPS,
    EXPECTED_KNOCKOUT_MATCHES,
    BracketDataSchema,
    GroupPlacements,
)
from services.scoring import (
    score_bracket_predictions,
    score_group_stage_predictions,
    score_knockout_predictions,
)
from services.results import normalize_group_standings, normalize_knockout_standings


def make_bracket(knockout_overrides=None):
    knockout_overrides = knockout_overrides or {}
    sorted_groups = sorted(EXPECTED_GROUPS)
    group_stage = {
        group_key: {
            "first": f"{group_key.lower()}-first",
            "second": f"{group_key.lower()}-second",
            "third": f"{group_key.lower()}-third",
        }
        for group_key in sorted_groups
    }
    group_stage["Group_A"] = {
        "first": "mexico",
        "second": "canada",
        "third": "ghana",
    }
    group_stage["Group_B"] = {
        "first": "brazil",
        "second": "france",
        "third": "japan",
    }

    knockouts = {
        match_id: "wrong-team"
        for match_id in EXPECTED_KNOCKOUT_MATCHES
    }
    knockouts.update(knockout_overrides)

    return BracketDataSchema.model_validate(
        {
            "group_stage": group_stage,
            "wildcards": [
                "ghana",
                "japan",
                "group_c-third",
                "group_d-third",
                "group_e-third",
                "group_f-third",
                "group_g-third",
                "group_h-third",
            ],
            "knockouts": knockouts,
        }
    )


def complete_actual_group_results(bracket):
    return {
        group_key: [
            predictions.first,
            predictions.second,
            predictions.third,
            f"{group_key.lower()}-fourth",
        ]
        for group_key, predictions in bracket.group_stage.items()
    }


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


def test_score_knockout_predictions_scores_country_sets_by_round():
    bracket = make_bracket(
        {
            "M73": "france",
            "M74": "argentina",
            "M89": "spain",
            "M97": "england",
            "M101": "portugal",
            "M104": "netherlands",
        }
    )
    actual_results = {
        "round_of_32": {"mexico", "brazil", "ghana", "not-predicted"},
        "round_of_16": {"france", "argentina"},
        "quarter_finals": {"spain"},
        "semi_finals": {"england"},
        "final": {"portugal"},
        "champion": {"netherlands"},
    }

    result = score_knockout_predictions(bracket, actual_results)

    assert result["score"] == -25
    assert result["round_scores"]["round_of_32"]["score"] == -3
    assert result["round_scores"]["round_of_16"]["score"] == -4
    assert result["round_scores"]["quarter_finals"]["score"] == -3
    assert result["round_scores"]["semi_finals"]["score"] == -4
    assert result["round_scores"]["final"]["score"] == -5
    assert result["round_scores"]["champion"]["score"] == -6


def test_score_bracket_predictions_sums_group_and_knockout_scores():
    bracket = make_bracket({"M73": "france"})
    actual_group_results = complete_actual_group_results(bracket)
    actual_knockout_results = {
        "round_of_16": {"france"},
    }

    result = score_bracket_predictions(
        bracket,
        actual_group_results,
        actual_knockout_results,
    )

    assert result["group_score"] == 0
    assert result["knockout_score"] == -2
    assert result["score"] == -2


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


def test_normalize_knockout_standings_counts_later_stages_as_earlier_rounds():
    api_payload = {
        "response": [
            {
                "league": {
                    "standings": [
                        [
                            {
                                "rank": 1,
                                "group": "Group A",
                                "description": "Quarter-finals",
                                "team": {
                                    "id": 6,
                                    "name": "Brazil",
                                },
                            },
                            {
                                "rank": 2,
                                "group": "Group A",
                                "description": "Winner",
                                "team": {
                                    "id": 2,
                                    "name": "France",
                                },
                            },
                            {
                                "rank": 3,
                                "group": "Group A",
                                "description": None,
                                "team": {
                                    "id": 16,
                                    "name": "Mexico",
                                },
                            },
                        ],
                        [
                            {
                                "rank": 1,
                                "group": "Group Stage",
                                "description": "Quarter-finals",
                                "team": {
                                    "id": 6,
                                    "name": "Brazil",
                                },
                            },
                        ],
                    ],
                },
            }
        ],
    }

    result = normalize_knockout_standings(api_payload)

    assert "brazil" in result["round_of_32"]
    assert "brazil" in result["round_of_16"]
    assert "brazil" in result["quarter_finals"]
    assert "brazil" not in result["semi_finals"]
    assert "france" in result["champion"]
    assert "mexico" not in result["round_of_32"]
