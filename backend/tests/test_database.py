import pytest
import sqlite3
import os
from src.database import init_db, add_report, get_reports, DB_FILE

@pytest.fixture
def db_setup():
    # Use a temporary DB file or clean up
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    init_db()
    yield
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def test_database_flow(db_setup):
    # Initial state
    df = get_reports()
    assert df.empty
    
    # Add report
    add_report("Housing", "Mumbai", "Test description", ["tag1", "tag2"])
    
    # Check if added
    df = get_reports()
    assert len(df) == 1
    assert df.iloc[0]["category"] == "Housing"
    assert "tag1" in df.iloc[0]["tags"]
