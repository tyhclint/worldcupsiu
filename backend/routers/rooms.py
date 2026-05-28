from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rooms import create_room, fetch_room_members_data, join_room, get_user_rooms

router = APIRouter(    
    prefix="/rooms",
    tags=["rooms"],
    )


class RoomCreateRequest(BaseModel):
    name: str
    user_id: str  

class RoomJoinRequest(BaseModel):
    user_id: str


@router.post("/")
def api_create_room(req: RoomCreateRequest):
    try:
        room = create_room(req.name, req.user_id)
        return {"message": "Room created successfully", "room": room}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/")
def api_get_user_rooms(user_id: str):
    try:
        rooms = get_user_rooms(user_id)
        return {"rooms": rooms}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{room_id}/join")
def api_join_room(room_id: str, req: RoomJoinRequest):
    try:
        join_room(room_id, req.user_id)
        return {"message": "Successfully joined the room"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not join room. Are you already in it?")



@router.get("/{room_id}/members")
def api_get_room_members(room_id: str):
    try:
        members_data = fetch_room_members_data(room_id)
        return {"members": members_data}
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch room members")
    