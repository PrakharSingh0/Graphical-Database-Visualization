from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.connection import ConnectionProfile
from app.core.database import get_db
from app.utils.connection_builder import build_connection
from app.adapters.mysql_adapter import extract_mysql_schema
from app.adapters.mongo_adapter import extract_mongo_schema

router = APIRouter(prefix="/api/schema", tags=["Schema"])


@router.post("/discover/{connection_id}")
def discover_schema(connection_id: str, db: Session = Depends(get_db)):
    conn = db.query(ConnectionProfile).filter_by(id=connection_id).first()

    if not conn:
        return {"error": "Connection not found"}

    # ✅ DEFINE FIRST
    config = conn.config
    db_type = conn.db_type

    # ===== MYSQL =====
    if db_type == "mysql":
        url = build_connection(db_type, config)
        return extract_mysql_schema(url)

    # ===== MONGODB =====
    elif db_type == "mongodb":
        uri = build_connection(db_type, config)

        db_name = config.get("database")

        if not db_name:
            return {"error": "MongoDB database name is required"}

        return extract_mongo_schema(uri, db_name)

    return {"error": "Unsupported DB"}

