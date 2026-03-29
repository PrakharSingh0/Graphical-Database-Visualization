from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.connection import ConnectionProfile
from app.routers.discover import discover_schema
from app.analyzer.schema_analyzer import analyze_schema

router = APIRouter(prefix="/api/analyze", tags=["Analysis"])


@router.get("/{connection_id}")
def analyze(connection_id: str, db: Session = Depends(get_db)):
    print("🔍 Searching for ID:", connection_id)

    connection = db.query(ConnectionProfile).filter_by(id=connection_id).first()

    if not connection:
        print("❌ Not found in DB")
        return {"error": "Connection not found"}

    # get schema
    schema = discover_schema(connection_id, db)

    # analyze
    result = analyze_schema(schema)

    return result