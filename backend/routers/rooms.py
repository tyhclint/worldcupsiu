from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rooms import create_room, join_room, get_my_rooms

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

@router.post("/{room_id}/join")
def api_join_room(room_id: str, req: RoomJoinRequest):
    try:
        join_room(room_id, req.user_id)
        return {"message": "Successfully joined the room"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not join room. Are you already in it?")

@router.get("/")
def api_get_user_rooms(user_id: str):
    try:
        rooms = get_my_rooms(user_id)
        return {"rooms": rooms}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))