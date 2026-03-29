from sqlalchemy import Column, String, JSON
from app.core.database import Base
import uuid

class ConnectionProfile(Base):
    __tablename__ = "connections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    db_type = Column(String, nullable=False)
    mode = Column(String, nullable=False)
    config = Column(JSON, nullable=False)