from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.db import Base

class ConnectionProfile(Base):
    __tablename__ = "connection_profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    db_type = Column(String(32), nullable=False)
    connection_string = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
