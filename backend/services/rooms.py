from core.config import supabase

def create_room(name: str, user_id: str):
    room_res = supabase.table("rooms").insert({"name": name}).execute()
    room_data = room_res.data[0]

    supabase.table("user_room_links").insert({
        "room_id": room_data["id"],
        "user_id": user_id
    }).execute()
    
    return room_data

def join_room(room_id: str, user_id: str):
    response = supabase.table("user_room_links").insert({
        "room_id": room_id,
        "user_id": user_id
    }).execute()
    return response.data

def get_user_rooms(user_id: str):
    response = supabase.table("user_room_links") \
        .select("room_id, rooms(id, name, created_at)") \
        .eq("user_id", user_id) \
        .execute()

    return [item["rooms"] for item in response.data if item.get("rooms")]



def fetch_room_members_data(room_id: str) -> list:
    """
    Fetches all members for a given room, including their usernames and bracket data.
    Returns a list of member dictionaries.
    """
    # 1. Fetch from the link table
    members_response = supabase.table('user_room_links').select('user_id').eq('room_id', room_id).execute()
    
    user_ids = [record['user_id'] for record in members_response.data]
    
    if not user_ids:
        return []

    # 2. Fetch from the users table (using 'user_id' instead of 'id')
    users_res = supabase.table('users').select('user_id, username').in_('user_id', user_ids).execute()
    
    # 3. Fetch from the predictions and fantasy tables.
    predictions_res = supabase.table('user_predictions').select('user_id, bracket_data, global_score').in_('user_id', user_ids).execute()
    fantasy_res = supabase.table('user_fantasy_squads').select('user_id, fantasy_squad, fantasy_score').in_('user_id', user_ids).execute()
    
    members_data = []
    
    for user_record in users_res.data:
        uid = user_record['user_id']
    
        # Find this user's prediction data
        user_pred = next((p for p in predictions_res.data if p['user_id'] == uid), None)
        user_fantasy = next((f for f in fantasy_res.data if f['user_id'] == uid), None)
        
        members_data.append({
            "user_id": uid,
            "username": user_record['username'],
            "bracket_data": user_pred['bracket_data'] if user_pred else None,
            "fantasy_squad": user_fantasy['fantasy_squad'] if user_fantasy else None,
            "fantasy_score": user_fantasy['fantasy_score'] if user_fantasy and user_fantasy.get('fantasy_score') is not None else 0,
            # Safely grab the global_score, defaulting to 0 if they don't have one yet
            "score": user_pred['global_score'] if user_pred and user_pred.get('global_score') is not None else 0 
        })

    return members_data
