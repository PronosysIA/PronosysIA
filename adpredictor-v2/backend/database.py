import os
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().with_name(".env")
load_dotenv(ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/adpredictor")


def with_query_param(url: str, key: str, value: str) -> str:
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.setdefault(key, value)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))

# Render/Supabase compatibility: postgres:// -> postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Supabase recommends SSL and NullPool when using the transaction pooler on port 6543.
is_supabase = "supabase.com" in DATABASE_URL
is_supabase_pooler = is_supabase and ":6543/" in DATABASE_URL
if is_supabase:
    DATABASE_URL = with_query_param(DATABASE_URL, "sslmode", "require")

engine_kwargs = {"pool_pre_ping": True}
if is_supabase_pooler:
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs.update({"pool_size": 5, "max_overflow": 10, "pool_recycle": 300})

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
