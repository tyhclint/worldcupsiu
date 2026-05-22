from core.config import supabase


def insert_prediction(bracket_data):
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

    return response.data[0] if response.data else None
