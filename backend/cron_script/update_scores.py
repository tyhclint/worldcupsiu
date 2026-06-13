import argparse
import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from schemas.knockout_format import BracketDataSchema
from services.fantasy import (
    list_all_fantasy_squads,
    score_fantasy_squad,
    update_fantasy_score_admin,
)
from services.predictions import (
    list_all_predictions,
    update_prediction_score_admin,
)
from services.results import fetch_worldcup_standings, normalize_group_standings
from services.scoring import score_group_stage_predictions


def limit_records(records, limit: int | None):
    if limit is None:
        return records
    return records[:limit]


def update_prediction_scores(dry_run: bool, limit: int | None):
    raw_standings = fetch_worldcup_standings()
    actual_results = normalize_group_standings(raw_standings)
    records = limit_records(list_all_predictions(), limit)

    stats = {"updated": 0, "failed": 0, "skipped": 0}

    for record in records:
        user_id = record.get("user_id")
        bracket_data = record.get("bracket_data")

        if not user_id or not bracket_data:
            stats["skipped"] += 1
            print(f"[predictions] skipped record missing user_id or bracket_data: {record}")
            continue

        try:
            bracket = BracketDataSchema.model_validate(bracket_data)
            score_result = score_group_stage_predictions(
                bracket.group_stage,
                actual_results,
            )
            score = score_result["score"]

            if dry_run:
                print(f"[dry-run][predictions] user_id={user_id} global_score={score}")
            else:
                update_prediction_score_admin(user_id, score)
                print(f"[predictions] user_id={user_id} global_score={score}")

            stats["updated"] += 1
        except Exception as exc:
            stats["failed"] += 1
            print(f"[predictions] failed user_id={user_id}: {exc}")

    return stats


async def update_fantasy_scores(dry_run: bool, limit: int | None):
    records = limit_records(list_all_fantasy_squads(), limit)
    stats = {"updated": 0, "failed": 0, "skipped": 0}

    for record in records:
        user_id = record.get("user_id")
        fantasy_squad = record.get("fantasy_squad")

        if not user_id or not fantasy_squad:
            stats["skipped"] += 1
            print(f"[fantasy] skipped record missing user_id or fantasy_squad: {record}")
            continue

        try:
            score_result = await score_fantasy_squad(fantasy_squad)
            fantasy_score = score_result["score"]

            if dry_run:
                print(f"[dry-run][fantasy] user_id={user_id} fantasy_score={fantasy_score}")
            else:
                update_fantasy_score_admin(user_id, fantasy_score)
                print(f"[fantasy] user_id={user_id} fantasy_score={fantasy_score}")

            stats["updated"] += 1
        except Exception as exc:
            stats["failed"] += 1
            print(f"[fantasy] failed user_id={user_id}: {exc}")

    return stats


async def run(args):
    print("Starting score update job")

    prediction_stats = None
    fantasy_stats = None

    if not args.skip_predictions:
        try:
            prediction_stats = update_prediction_scores(args.dry_run, args.limit)
        except Exception as exc:
            print(f"[predictions] phase failed: {exc}")

    if not args.skip_fantasy:
        try:
            fantasy_stats = await update_fantasy_scores(args.dry_run, args.limit)
        except Exception as exc:
            print(f"[fantasy] phase failed: {exc}")

    print("Score update job complete")
    if prediction_stats is not None:
        print(f"Prediction stats: {prediction_stats}")
    if fantasy_stats is not None:
        print(f"Fantasy stats: {fantasy_stats}")


def parse_args():
    parser = argparse.ArgumentParser(description="Update user bracket and fantasy scores.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Calculate and log scores without writing updates to Supabase.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only process the first N records from each score table.",
    )
    parser.add_argument(
        "--skip-predictions",
        action="store_true",
        help="Skip bracket prediction scoring.",
    )
    parser.add_argument(
        "--skip-fantasy",
        action="store_true",
        help="Skip fantasy squad scoring.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    asyncio.run(run(parse_args()))
