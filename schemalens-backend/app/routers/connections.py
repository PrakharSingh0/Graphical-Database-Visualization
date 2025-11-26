# app/routers/connections.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import SessionLocal
import app.models as models

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----- Pydantic Schemas -----

class ConnectionBase(BaseModel):
    name: str = Field(..., description="Human-friendly name for this connection (eg. local mysql)")
    db_type: str = Field(..., description="Database type, e.g. mysql, mongodb, postgres, sqlite")
    connection_string: str = Field(..., description="Connection string / URI")


class ConnectionCreate(ConnectionBase):
    pass


class ConnectionOut(ConnectionBase):
    id: int

    class Config:
        orm_mode = True


# ----- Routes -----

@router.get("/connections/", response_model=List[ConnectionOut])
def list_connections(db: Session = Depends(get_db)):
    """
    List all saved connection profiles.
    """
    profiles = db.query(models.ConnectionProfile).order_by(models.ConnectionProfile.id.desc()).all()
    return profiles


@router.post("/connections/", response_model=ConnectionOut, status_code=status.HTTP_201_CREATED)
def create_connection(payload: ConnectionCreate, db: Session = Depends(get_db)):
    """
    Create a new connection profile.
    """
    profile = models.ConnectionProfile(
        name=payload.name,
        db_type=payload.db_type,
        connection_string=payload.connection_string,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/connections/{conn_id}", status_code=204)
def delete_connection(conn_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.ConnectionProfile).filter(models.ConnectionProfile.id == conn_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Connection profile not found")
    db.delete(profile)
    db.commit()
    return Response(status_code=204)
