from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal
import app.models as models
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db=SessionLocal()
    try: yield db
    finally: db.close()

class ConnCreate(BaseModel):
    name:str
    db_type:str
    connection_string:str

@router.post("/")
def create_conn(c:ConnCreate, db:Session=Depends(get_db)):
    rec=models.ConnectionProfile(name=c.name, db_type=c.db_type, connection_string=c.connection_string)
    db.add(rec); db.commit(); db.refresh(rec)
    return rec

@router.get("/")
def list_conn(db:Session=Depends(get_db)):
    return db.query(models.ConnectionProfile).all()
