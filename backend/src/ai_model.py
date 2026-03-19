import pandas as pd
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

MODEL_PATH = "data/model.pkl"

class AIModel:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
            except Exception:
                self.model = None

    def train_and_evaluate(self, df):
        """
        Trains a model on the provided DataFrame.
        Expects 'description' and 'category' columns.
        Returns a dictionary with metrics.
        """
        if 'description' not in df.columns or 'category' not in df.columns:
            raise ValueError("CSV must contain 'description' and 'category' columns.")

        # Drop NA
        df = df.dropna(subset=['description', 'category'])
        
        X = df['description']
        y = df['category']

        if len(df) < 5:
            return {"error": "Not enough data to train (need at least 5 records)."}

        # Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Pipeline
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(stop_words='english')),
            ('clf', SGDClassifier(loss='hinge', penalty='l2', alpha=1e-3, random_state=42))
        ])

        # Train
        pipeline.fit(X_train, y_train)

        # Evaluate
        predictions = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)

        # Save
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(pipeline, f)
        
        self.model = pipeline

        return {
            "accuracy": accuracy,
            "failure_rate": 1.0 - accuracy,
            "train_size": len(X_train),
            "test_size": len(X_test)
        }

    def predict(self, text):
        if not self.model:
            return None
        try:
            return self.model.predict([text])[0]
        except Exception:
            return None

# Singleton instance
ai_model = AIModel()
