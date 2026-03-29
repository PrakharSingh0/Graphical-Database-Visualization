from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.connection import ConnectionProfile
from app.core.database import get_db

router = APIRouter(prefix="/api/connections", tags=["Connections"])


# ✅ CREATE
@router.post("/")
def create_connection(data: dict, db: Session = Depends(get_db)):
    conn = ConnectionProfile(**data)
    db.add(conn)
    db.commit()
    db.refresh(conn)
    return conn


# ✅ READ ALL
@router.get("/")
def list_connections(db: Session = Depends(get_db)):
    return db.query(ConnectionProfile).all()


# ✅ READ ONE (optional but useful)
@router.get("/{connection_id}")
def get_connection(connection_id: str, db: Session = Depends(get_db)):
    conn = db.query(ConnectionProfile).filter_by(id=connection_id).first()

    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    return conn


# ✅ UPDATE
@router.put("/{connection_id}")
def update_connection(connection_id: str, data: dict, db: Session = Depends(get_db)):
    conn = db.query(ConnectionProfile).filter_by(id=connection_id).first()

    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    # Update fields
    conn.name = data.get("name", conn.name)
    conn.db_type = data.get("db_type", conn.db_type)
    conn.mode = data.get("mode", conn.mode)
    conn.config = data.get("config", conn.config)

    db.commit()
    db.refresh(conn)

    return {"message": "Updated successfully", "data": conn}


# ✅ DELETE
@router.delete("/{connection_id}")
def delete_connection(connection_id: str, db: Session = Depends(get_db)):
    conn = db.query(ConnectionProfile).filter_by(id=connection_id).first()

    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    db.delete(conn)
    db.commit()

    return {"message": "Deleted successfully"}