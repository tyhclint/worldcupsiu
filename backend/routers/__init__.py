from .predictions import router as predictions_router
from .scoring import router as scoring_router
from .auth import router as auth_router
from .rooms import router as rooms_router
from .fantasy import router as fantasy_router
from fastapi import APIRouter


routers = [
    predictions_router,
    scoring_router,
    auth_router,
    rooms_router,
    fantasy_router,
]

api_router = APIRouter()
for router in routers:
    api_router.include_router(router)
