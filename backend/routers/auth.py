from fastapi import APIRouter, HTTPException, Request


router = APIRouter(
    tags=["predictions"],
)