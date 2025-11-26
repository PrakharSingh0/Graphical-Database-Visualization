from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.routers import discover, sample, connections  # <-- connections imported here

app = FastAPI(title="SchemaLens Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # dev only
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- static exports (from previous step) ---
APP_DIR = Path(__file__).resolve().parent
EXPORT_DIR = APP_DIR / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/app/exports", StaticFiles(directory=EXPORT_DIR), name="exports")


# --- routers ---
# schema discovery
app.include_router(discover.router, prefix="/api/schema", tags=["discover"])
# optional sample route: /api/schema/sample
app.include_router(sample.router, prefix="/api/schema", tags=["sample"])
# connections: /api/connections/...
app.include_router(connections.router, prefix="/api", tags=["connections"])
