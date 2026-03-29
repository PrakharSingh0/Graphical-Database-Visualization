from fastapi import APIRouter
from sqlalchemy import create_engine
from pymongo import MongoClient
from app.utils.connection_builder import build_connection

router = APIRouter(prefix="/api/test-connection", tags=["Test"])


@router.post("/")
def test_connection(data: dict):
    try:
        db_type = data["db_type"]
        config = data["config"]

        if db_type == "mysql":
            url = build_connection(db_type, config)
            engine = create_engine(url)
            conn = engine.connect()
            conn.close()

        elif db_type == "mongodb":
            uri = build_connection(db_type, config)
            client = MongoClient(uri)
            client.server_info()

        return {"status": "success"}

    except Exception as e:
        return {"status": "error", "message": str(e)}