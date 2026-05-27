from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers.scoring import router as scoring_router


def create_test_client():
    app = FastAPI()
    app.include_router(scoring_router)
    return TestClient(app)


def complete_group_stage_payload():
    return {
        "group_stage": {
            "Group_A": {"first": "mexico", "second": "south-africa", "third": "south-korea"},
            "Group_B": {"first": "qatar", "second": "switzerland", "third": "canada"},
            "Group_C": {"first": "morocco", "second": "scotland", "third": "brazil"},
            "Group_D": {"first": "turkiye", "second": "usa", "third": "paraguay"},
            "Group_E": {"first": "ecuador", "second": "ivory-coast", "third": "germany"},
            "Group_F": {"first": "sweden", "second": "netherlands", "third": "tunisia"},
            "Group_G": {"first": "egypt", "second": "iran", "third": "belgium"},
            "Group_H": {"first": "cabo-verde", "second": "spain", "third": "saudi-arabia"},
            "Group_I": {"first": "senegal", "second": "iraq", "third": "france"},
            "Group_J": {"first": "algeria", "second": "argentina", "third": "austria"},
            "Group_K": {"first": "colombia", "second": "uzbekistan", "third": "portugal"},
            "Group_L": {"first": "croatia", "second": "ghana", "third": "england"},
        },
    }


def expected_group_score(score, first, second, third, fourth):
    return {
        "score": score,
        "placements": {
            "first": first,
            "second": second,
            "third": third,
            "fourth": fourth,
        },
    }


def expected_placement(team_id, predicted_position, actual_position):
    return {
        "team_id": team_id,
        "predicted_position": predicted_position,
        "actual_position": actual_position,
        "score": abs(actual_position - predicted_position),
    }


def test_score_group_stage_endpoint_returns_score_response():
    client = create_test_client()

    response = client.post("/score/group-stage", json=complete_group_stage_payload())

    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["score"] == 68
    assert data["lower_is_better"] is True
    assert data["group_count"] == 12
    assert data["group_scores"] == {
        "Group_A": expected_group_score(
            6,
            expected_placement("mexico", 1, 2),
            expected_placement("south-africa", 2, 4),
            expected_placement("south-korea", 3, 1),
            expected_placement("czechia", 4, 3),
        ),
        "Group_B": expected_group_score(
            6,
            expected_placement("qatar", 1, 4),
            expected_placement("switzerland", 2, 1),
            expected_placement("canada", 3, 2),
            expected_placement("bosnia", 4, 3),
        ),
        "Group_C": expected_group_score(
            6,
            expected_placement("morocco", 1, 2),
            expected_placement("scotland", 2, 4),
            expected_placement("brazil", 3, 1),
            expected_placement("haiti", 4, 3),
        ),
        "Group_D": expected_group_score(
            4,
            expected_placement("turkiye", 1, 2),
            expected_placement("usa", 2, 1),
            expected_placement("paraguay", 3, 4),
            expected_placement("australia", 4, 3),
        ),
        "Group_E": expected_group_score(
            4,
            expected_placement("ecuador", 1, 2),
            expected_placement("ivory-coast", 2, 3),
            expected_placement("germany", 3, 1),
            expected_placement("curacao", 4, 4),
        ),
        "Group_F": expected_group_score(
            6,
            expected_placement("sweden", 1, 3),
            expected_placement("netherlands", 2, 1),
            expected_placement("tunisia", 3, 4),
            expected_placement("japan", 4, 2),
        ),
        "Group_G": expected_group_score(
            6,
            expected_placement("egypt", 1, 2),
            expected_placement("iran", 2, 4),
            expected_placement("belgium", 3, 1),
            expected_placement("new-zealand", 4, 3),
        ),
        "Group_H": expected_group_score(
            6,
            expected_placement("cabo-verde", 1, 3),
            expected_placement("spain", 2, 1),
            expected_placement("saudi-arabia", 3, 4),
            expected_placement("uruguay", 4, 2),
        ),
        "Group_I": expected_group_score(
            6,
            expected_placement("senegal", 1, 2),
            expected_placement("iraq", 2, 4),
            expected_placement("france", 3, 1),
            expected_placement("norway", 4, 3),
        ),
        "Group_J": expected_group_score(
            6,
            expected_placement("algeria", 1, 4),
            expected_placement("argentina", 2, 1),
            expected_placement("austria", 3, 2),
            expected_placement("jordan", 4, 3),
        ),
        "Group_K": expected_group_score(
            6,
            expected_placement("colombia", 1, 2),
            expected_placement("uzbekistan", 2, 4),
            expected_placement("portugal", 3, 1),
            expected_placement("congo-dr", 4, 3),
        ),
        "Group_L": expected_group_score(
            6,
            expected_placement("croatia", 1, 2),
            expected_placement("ghana", 2, 4),
            expected_placement("england", 3, 1),
            expected_placement("panama", 4, 3),
        ),
    }


def test_score_group_stage_endpoint_rejects_incomplete_groups():
    client = create_test_client()
    payload = complete_group_stage_payload()
    del payload["group_stage"]["Group_L"]

    response = client.post("/score/group-stage", json=payload)

    assert response.status_code == 422
