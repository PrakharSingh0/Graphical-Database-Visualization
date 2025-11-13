from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session
import os

DATABASE_URL = os.environ.get("SCHEMALENS_DB_URL") or "sqlite:///./schemalens_meta.db"
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True))
Base = declarative_base()
