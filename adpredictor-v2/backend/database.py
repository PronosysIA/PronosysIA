import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/adpredictor")

# Render/Supabase compatibility: postgres:// -> postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Supabase pooler (port 6543) needs statement_cache_size=0 to avoid prepared statement issues
is_supabase_pooler = ":6543/" in DATABASE_URL
engine_kwargs = {"pool_pre_ping": True, "pool_size": 5, "max_overflow": 10}
if is_supabase_pooler:
    engine_kwargs["connect_args"] = {"options": "-c statement_cache_size=0"}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()