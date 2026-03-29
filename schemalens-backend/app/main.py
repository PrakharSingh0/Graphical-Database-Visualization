from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import connections, discover, test_connection
from app.core.database import Base, engine

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SchemaLens API")

# CORS (frontend connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(connections.router)
app.include_router(discover.router)
app.include_router(test_connection.router)


@app.get("/")
def root():
    return {"message": "SchemaLens Backend Running 🚀"}