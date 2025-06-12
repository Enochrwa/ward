import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
CA_CERT = os.getenv("CA_CERT")  # Full certificate content (multiline or \n)

# Write CA cert to a temporary file
ca_cert_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pem")
ca_cert_file.write(CA_CERT.encode("utf-8"))
ca_cert_file.close()

# Connect with SQLAlchemy using temp CA cert
connect_args = {
    "ssl": {
        "ca": ca_cert_file.name
    }
}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
