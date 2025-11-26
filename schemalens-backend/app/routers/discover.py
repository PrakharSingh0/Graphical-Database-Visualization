# app/routers/discover.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.utils.exporter import export_schema
from app.settings import settings
from app.db import SessionLocal
import app.models as models
from app.adapters import mysql_adapter, mongo_adapter

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MySQLRequest(BaseModel):
    mysql_url: Optional[str] = None
    db_name: Optional[str] = None
    save: bool = True
    connection_id: Optional[int] = None


class MongoRequest(BaseModel):
    mongo_uri: Optional[str] = None
    db_name: Optional[str] = None
    save: bool = True
    connection_id: Optional[int] = None


@router.post("/mysql", summary="Discover MySQL schema")
def discover_mysql(req: MySQLRequest, db: Session = Depends(get_db)):
    # priority: connection_id -> provided url -> env
    mysql_url = req.mysql_url or settings.MYSQL_URL

    if req.connection_id:
        profile = (
            db.query(models.ConnectionProfile)
            .filter(models.ConnectionProfile.id == req.connection_id)
            .first()
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Connection profile not found")
        if profile.db_type != "mysql":
            raise HTTPException(
                status_code=400, detail="Connection profile is not MySQL type"
            )
        mysql_url = profile.connection_string

    if not mysql_url:
        raise HTTPException(status_code=400, detail="MySQL URL not provided")

    try:
        schema = mysql_adapter.extract_mysql_schema(mysql_url, req.db_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MySQL discovery failed: {e}")

    export_path: Optional[str] = None
    if req.save:
        # export_schema returns a string like "/app/exports/mysql_<db>_YYYYMMDD_....json"
        export_path = export_schema(schema, prefix=f"mysql_{schema.get('database')}")

    return {"status": "ok", "schema": schema, "export_path": export_path}


@router.post("/mongo", summary="Discover MongoDB schema")
def discover_mongo(req: MongoRequest, db: Session = Depends(get_db)):
    mongo_uri = req.mongo_uri or settings.MONGO_URI

    if req.connection_id:
        profile = (
            db.query(models.ConnectionProfile)
            .filter(models.ConnectionProfile.id == req.connection_id)
            .first()
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Connection profile not found")
        if profile.db_type != "mongodb":
            raise HTTPException(
                status_code=400, detail="Connection profile is not MongoDB type"
            )
        mongo_uri = profile.connection_string

    if not mongo_uri:
        raise HTTPException(status_code=400, detail="Mongo URI not provided")

    if not req.db_name:
        raise HTTPException(
            status_code=400, detail="db_name required for Mongo discovery"
        )

    try:
        schema = mongo_adapter.extract_mongo_schema(mongo_uri, req.db_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mongo discovery failed: {e}")

    export_path: Optional[str] = None
    if req.save:
        # export_schema returns a string like "/app/exports/mongo_<db>_YYYYMMDD_....json"
        export_path = export_schema(schema, prefix=f"mongo_{schema.get('database')}")

    return {"status": "ok", "schema": schema, "export_path": export_path}
