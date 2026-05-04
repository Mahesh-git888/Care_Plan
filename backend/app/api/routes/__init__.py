from fastapi import APIRouter

from backend.app.api.routes.intake import router as intake_router

api_router = APIRouter()
api_router.include_router(intake_router)
