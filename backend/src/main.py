"""
main.py
entrypoint for backend
"""

import config_router
import form_router
import logfire
from beanie import init_beanie
from config_model import UIConfig
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

# load these from config.Settings
MONGO_URI = "mongodb://mongo:27017"
DB_NAME = "mmr-config"


app = FastAPI(title="dynamic ui config api")

# logfire: configure and instrument fastapi
logfire.configure()
logfire.instrument_fastapi(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def app_init():
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(database=client[DB_NAME], document_models=[UIConfig])


app.include_router(config_router.router, prefix="/config", tags=["ui-config"])
app.include_router(form_router.router, prefix="/form", tags=["form"])
