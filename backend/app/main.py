from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.services.seed_data import seed_database

# Routers
from app.api.auth import router as auth_router
from app.api.travel_requests import router as travel_requests_router
from app.api.groups import router as groups_router
from app.api.quotations import router as quotations_router
from app.api.notifications import router as notifications_router
from app.api.admin import router as admin_router
from app.api.ai_agent import router as ai_agent_router
from app.api.flights import router as flights_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    init_db()
    # Seed mock data
    seed_database()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Group Flight Booking Platform by CORRUPTX",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(travel_requests_router, prefix=settings.API_V1_STR)
app.include_router(groups_router, prefix=settings.API_V1_STR)
app.include_router(quotations_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(ai_agent_router, prefix=settings.API_V1_STR)
app.include_router(flights_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "brand": settings.APP_NAME,
        "team": settings.TEAM_NAME,
        "team_id": settings.TEAM_ID,
        "status": "operational",
        "api_docs": "/docs",
        "message": "Travel Together. Unlock Better Group Fare Opportunities."
    }
