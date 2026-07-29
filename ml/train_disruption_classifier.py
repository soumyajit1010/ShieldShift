import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
import xgboost as xgb

from features import DISRUPTION_FEATURES

def train_disruption_classifier():
    # Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "disruption_dataset.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    print(f"Loading disruption dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Separate features and target
    X = df[DISRUPTION_FEATURES]
    y = df["label"]
    
    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set size: {X_train.shape[0]} | Test set size: {X_test.shape[0]}")
    print(f"Class distribution in training: {y_train.value_counts().to_dict()}")
    
    # Initialize and train XGBoost Classifier
    model = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=5,
        n_estimators=100,
        learning_rate=0.1,
        max_depth=4,
        eval_metric="mlogloss",
        random_state=42
    )
    
    print("Training XGBoost Multi-class Classifier...")
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    cm = confusion_matrix(y_test, y_pred)
    
    print("\n=========================================")
    print("Disruption Classifier Evaluation Metrics")
    print("=========================================")
    print(f"Accuracy Score:                 {acc:.4f}")
    print(f"Weighted F1 Score:             {f1:.4f}")
    print("\nClassification Report:")
    target_names = [
        "No Disruption (0x)",
        "Minor Disruption (0.25x)",
        "Moderate Disruption (0.5x)",
        "Severe Disruption (1.0x)",
        "Extreme Disruption (1.5x)"
    ]
    print(classification_report(y_test, y_pred, target_names=target_names))
    print("Confusion Matrix:")
    print(cm)
    print("=========================================\n")
    
    # Save the model
    model_path = os.path.join(models_dir, "disruption_classifier.joblib")
    model_payload = {
        "model": model,
        "features": DISRUPTION_FEATURES,
        "target_names": target_names
    }
    joblib.dump(model_payload, model_path)
    print(f"Successfully saved trained model payload to {model_path}")

if __name__ == "__main__":
    train_disruption_classifier()
