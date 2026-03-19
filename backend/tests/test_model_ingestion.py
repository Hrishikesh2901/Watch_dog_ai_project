import pytest
import pandas as pd
from src.ai_model import ai_model, AIModel
from src.database import import_csv_to_db, init_db, get_reports
import os

DB_FILE = "data/reports.db"

@pytest.fixture
def setup_db():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    init_db()
    yield
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def test_model_training():
    # Create dummy data
    df = pd.DataFrame({
        'description': ['bad service', 'good service', 'bad service', 'good service', 'ok service', 'bad service'],
        'category': ['A', 'B', 'A', 'B', 'C', 'A']
    })
    
    metrics = ai_model.train_and_evaluate(df)
    assert 'accuracy' in metrics
    assert metrics['train_size'] > 0
    
    # Test prediction
    pred = ai_model.predict("bad service")
    assert pred is not None

def test_csv_import(setup_db):
    csv_content = b"category,location,description\nA,LocA,Desc1\nB,LocB,Desc2"
    res = import_csv_to_db(csv_content)
    assert res['success'] == True
    assert res['count'] == 2
    
    df = get_reports()
    assert len(df) == 2
    assert df.iloc[0]['category'] == 'A'
