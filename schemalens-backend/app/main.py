from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.settings import settings
from app.routers import sample, connections, discover
from app.db import engine, Base
import app.models as models

app = FastAPI(title="SchemaLens Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sample.router, prefix="/api/schema")
app.include_router(discover.router, prefix="/api/schema")
app.include_router(connections.router, prefix="/api/connections")

@app.get("/health")
def health():
    return {"status":"ok"}

Base.metadata.create_all(bind=engine)
