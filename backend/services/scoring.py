import json
from pathlib import Path

from schemas.knockout_format import GroupPlacements


RESULTS_FILE = Path(__file__).resolve().parents[1] / "data" / "fake_group_stage_results.json"
PLACEMENTS = (("first", 1), ("second", 2), ("third", 3), ("fourth", 4))


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
