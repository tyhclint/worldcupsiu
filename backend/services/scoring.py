import json
from pathlib import Path

from schemas.knockout_format import BracketDataSchema, GroupPlacements


RESULTS_FILE = Path(__file__).resolve().parents[1] / "data" / "fake_group_stage_results.json"
PLACEMENTS = (("first", 1), ("second", 2), ("third", 3), ("fourth", 4))
KNOCKOUT_ROUND_MATCHES = {
    "round_of_16": (
        "M73",
        "M74",
        "M75",
        "M76",
        "M77",
        "M78",
        "M79",
        "M80",
        "M81",
        "M82",
        "M83",
        "M84",
        "M85",
        "M86",
        "M87",
        "M88",
    ),
    "quarter_finals": ("M89", "M90", "M91", "M92", "M93", "M94", "M95", "M96"),
    "semi_finals": ("M97", "M98", "M99", "M100"),
    "final": ("M101", "M102"),
    "champion": ("M104",),
}
KNOCKOUT_ROUND_WEIGHTS = {
    "round_of_32": -1,
    "round_of_16": -2,
    "quarter_finals": -3,
    "semi_finals": -4,
    "final": -5,
    "champion": -6,
}


def load_fake_group_stage_results() -> dict[str, list[str]]:
    with RESULTS_FILE.open(encoding="utf-8") as file:
        return json.load(file)


def score_group_stage_predictions(
    group_stage: dict[str, GroupPlacements],
    actual_results: dict[str, list[str]] | None = None,
):
    results = actual_results or load_fake_group_stage_results()
    total_score = 0
    group_scores = {}

    for group_key, predictions in group_stage.items():
        actual_group = results.get(group_key)
        if not actual_group:
            raise ValueError(f"Missing results for {group_key}")

        actual_positions = {
            team_id: index + 1
            for index, team_id in enumerate(actual_group)
        }

        predicted_placements = {
            "first": predictions.first,
            "second": predictions.second,
            "third": predictions.third,
        }

        for team_id in predicted_placements.values():
            if team_id not in actual_positions:
                raise ValueError(f"{team_id} is not in {group_key}")

        inferred_fourth = [
            team_id
            for team_id in actual_group
            if team_id not in predicted_placements.values()
        ]
        if len(inferred_fourth) != 1:
            raise ValueError(f"Could not infer fourth place for {group_key}")

        predicted_placements["fourth"] = inferred_fourth[0]

        group_score = 0
        placement_scores = {}

        for placement, predicted_position in PLACEMENTS:
            team_id = predicted_placements[placement]
            actual_position = actual_positions[team_id]

            placement_score = abs(actual_position - predicted_position)
            group_score += placement_score
            placement_scores[placement] = {
                "team_id": team_id,
                "predicted_position": predicted_position,
                "actual_position": actual_position,
                "score": placement_score,
            }

        group_scores[group_key] = {
            "score": group_score,
            "placements": placement_scores,
        }
        total_score += group_score

    return {
        "score": total_score,
        "group_scores": group_scores,
    }


def predicted_round_of_32_teams(bracket: BracketDataSchema) -> set[str]:
    teams = set(bracket.wildcards)

    for predictions in bracket.group_stage.values():
        teams.add(predictions.first)
        teams.add(predictions.second)

    return teams


def predicted_knockout_teams_by_round(bracket: BracketDataSchema) -> dict[str, set[str]]:
    predicted_teams = {
        "round_of_32": predicted_round_of_32_teams(bracket),
    }

    for round_key, match_ids in KNOCKOUT_ROUND_MATCHES.items():
        predicted_teams[round_key] = {
            bracket.knockouts[match_id]
            for match_id in match_ids
        }

    return predicted_teams


def score_knockout_predictions(
    bracket: BracketDataSchema,
    actual_results: dict[str, set[str]] | None = None,
):
    results = actual_results or {}
    predictions = predicted_knockout_teams_by_round(bracket)
    total_score = 0
    round_scores = {}

    for round_key, weight in KNOCKOUT_ROUND_WEIGHTS.items():
        predicted_teams = predictions[round_key]
        actual_teams = set(results.get(round_key, set()))
        correct_teams = predicted_teams & actual_teams
        round_score = weight * len(correct_teams)

        round_scores[round_key] = {
            "score": round_score,
            "weight": weight,
            "correct_count": len(correct_teams),
            "correct_teams": sorted(correct_teams),
        }
        total_score += round_score

    return {
        "score": total_score,
        "round_scores": round_scores,
    }


def score_bracket_predictions(
    bracket: BracketDataSchema,
    actual_group_results: dict[str, list[str]] | None = None,
    actual_knockout_results: dict[str, set[str]] | None = None,
):
    group_result = score_group_stage_predictions(
        bracket.group_stage,
        actual_group_results,
    )
    knockout_result = score_knockout_predictions(
        bracket,
        actual_knockout_results,
    )

    return {
        "score": group_result["score"] + knockout_result["score"],
        "group_score": group_result["score"],
        "knockout_score": knockout_result["score"],
        "group_scores": group_result["group_scores"],
        "knockout_scores": knockout_result["round_scores"],
    }
