import asyncio

from cron_script import update_scores
from schemas.knockout_format import EXPECTED_KNOCKOUT_MATCHES


GROUP_TEAMS = {
    "Group_A": [
        (16, "Mexico", "mexico"),
        (17, "South Korea", "south-korea"),
        (1531, "South Africa", "south-africa"),
        (770, "Czechia", "czechia"),
    ],
    "Group_B": [
        (15, "Switzerland", "switzerland"),
        (5529, "Canada", "canada"),
        (1113, "Bosnia & Herzegovina", "bosnia"),
        (1569, "Qatar", "qatar"),
    ],
    "Group_C": [
        (6, "Brazil", "brazil"),
        (31, "Morocco", "morocco"),
        (2386, "Haiti", "haiti"),
        (1108, "Scotland", "scotland"),
    ],
    "Group_D": [
        (2384, "USA", "usa"),
        (777, "Türkiye", "turkiye"),
        (20, "Australia", "australia"),
        (2380, "Paraguay", "paraguay"),
    ],
    "Group_E": [
        (25, "Germany", "germany"),
        (2382, "Ecuador", "ecuador"),
        (1501, "Ivory Coast", "ivory-coast"),
        (5530, "Curaçao", "curacao"),
    ],
    "Group_F": [
        (1118, "Netherlands", "netherlands"),
        (12, "Japan", "japan"),
        (5, "Sweden", "sweden"),
        (28, "Tunisia", "tunisia"),
    ],
    "Group_G": [
        (1, "Belgium", "belgium"),
        (32, "Egypt", "egypt"),
        (4673, "New Zealand", "new-zealand"),
        (22, "Iran", "iran"),
    ],
    "Group_H": [
        (9, "Spain", "spain"),
        (7, "Uruguay", "uruguay"),
        (1533, "Cape Verde Islands", "cabo-verde"),
        (23, "Saudi Arabia", "saudi-arabia"),
    ],
    "Group_I": [
        (2, "France", "france"),
        (13, "Senegal", "senegal"),
        (1090, "Norway", "norway"),
        (1567, "Iraq", "iraq"),
    ],
    "Group_J": [
        (26, "Argentina", "argentina"),
        (775, "Austria", "austria"),
        (1548, "Jordan", "jordan"),
        (1532, "Algeria", "algeria"),
    ],
    "Group_K": [
        (27, "Portugal", "portugal"),
        (8, "Colombia", "colombia"),
        (1508, "Congo DR", "congo-dr"),
        (1568, "Uzbekistan", "uzbekistan"),
    ],
    "Group_L": [
        (10, "England", "england"),
        (3, "Croatia", "croatia"),
        (11, "Panama", "panama"),
        (1504, "Ghana", "ghana"),
    ],
}


def fake_standings():
    standings = []

    for group_key, teams in GROUP_TEAMS.items():
        group_name = group_key.replace("_", " ")
        standings.append([
            {
                "rank": index + 1,
                "group": group_name,
                "team": {
                    "id": api_id,
                    "name": api_name,
                },
            }
            for index, (api_id, api_name, _team_id) in enumerate(teams)
        ])

    return {
        "response": [
            {
                "league": {
                    "standings": standings,
                },
            }
        ],
    }


def fake_prediction_record():
    group_stage = {
        group_key: {
            "first": teams[0][2],
            "second": teams[1][2],
            "third": teams[2][2],
        }
        for group_key, teams in GROUP_TEAMS.items()
    }

    return {
        "user_id": "user-1",
        "bracket_data": {
            "group_stage": group_stage,
            "wildcards": [
                "team-1",
                "team-2",
                "team-3",
                "team-4",
                "team-5",
                "team-6",
                "team-7",
                "team-8",
            ],
            "knockouts": {
                match_id: "mexico"
                for match_id in EXPECTED_KNOCKOUT_MATCHES
            },
        },
    }


def test_update_prediction_scores_dry_run_does_not_write(monkeypatch):
    writes = []

    monkeypatch.setattr(update_scores, "fetch_worldcup_standings", fake_standings)
    monkeypatch.setattr(update_scores, "list_all_predictions", lambda: [fake_prediction_record()])
    monkeypatch.setattr(
        update_scores,
        "update_prediction_score_admin",
        lambda user_id, score: writes.append((user_id, score)),
    )

    stats = update_scores.update_prediction_scores(dry_run=True, limit=None)

    assert stats == {"updated": 1, "failed": 0, "skipped": 0}
    assert writes == []


def test_update_prediction_scores_writes_when_not_dry_run(monkeypatch):
    writes = []

    monkeypatch.setattr(update_scores, "fetch_worldcup_standings", fake_standings)
    monkeypatch.setattr(update_scores, "list_all_predictions", lambda: [fake_prediction_record()])
    monkeypatch.setattr(
        update_scores,
        "update_prediction_score_admin",
        lambda user_id, score: writes.append((user_id, score)),
    )

    stats = update_scores.update_prediction_scores(dry_run=False, limit=None)

    assert stats == {"updated": 1, "failed": 0, "skipped": 0}
    assert writes == [("user-1", 0)]


def test_update_fantasy_scores_dry_run_does_not_write(monkeypatch):
    writes = []

    fake_squad = {
        "starters": {
            f"starter-{index}": {"id": index, "name": f"Player {index}"}
            for index in range(11)
        },
        "bench": {
            f"bench-{index}": {"id": index + 11, "name": f"Player {index + 11}"}
            for index in range(5)
        },
    }

    async def fake_score_fantasy_squad(squad):
        return {"score": 8.5, "players": []}

    monkeypatch.setattr(
        update_scores,
        "list_all_fantasy_squads",
        lambda: [{"user_id": "user-1", "fantasy_squad": fake_squad}],
    )
    monkeypatch.setattr(update_scores, "score_fantasy_squad", fake_score_fantasy_squad)
    monkeypatch.setattr(
        update_scores,
        "update_fantasy_score_admin",
        lambda user_id, score: writes.append((user_id, score)),
    )

    stats = asyncio.run(update_scores.update_fantasy_scores(dry_run=True, limit=None))

    assert stats == {"updated": 1, "failed": 0, "skipped": 0}
    assert writes == []
