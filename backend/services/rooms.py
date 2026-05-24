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