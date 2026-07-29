import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import IsolationForest
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

from features import FRAUD_FEATURES

def train_fraud_detector():
    # Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "fraud_dataset.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    print(f"Loading fraud dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Separate features and evaluation label
    X = df[FRAUD_FEATURES]
    y = df["is_anomaly"] # 0 for normal, 1 for anomaly
    
    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set size: {X_train.shape[0]} | Test set size: {X_test.shape[0]}")
    
    # Calculate contamination rate on training data
    contamination = y_train.mean()
    print(f"Calculated contamination rate from training labels: {contamination:.4f}")
    
    # Initialize and train Isolation Forest
    model = IsolationForest(
        contamination=contamination,
        n_estimators=150,
        max_samples="auto",
        random_state=42
    )
    
    print("Training Isolation Forest Anomaly Detector...")
    model.fit(X_train)
    
    # Predict and evaluate on test set
    # Isolation forest predicts: 1 for normal (inlier), -1 for anomalous (outlier)
    test_preds_raw = model.predict(X_test)
    y_pred = np.where(test_preds_raw == -1, 1, 0)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print("\n=========================================")
    print("Fraud Detector (Isolation Forest) Metrics")
    print("=========================================")
    print(f"Model Contamination Parameter: {contamination:.4f}")
    print(f"Test Accuracy Score:           {acc:.4f}")
    print(f"Test Precision Score:          {prec:.4f}")
    print(f"Test Recall Score:             {rec:.4f}")
    print(f"Test F1 Score:                 {f1:.4f}")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Normal (0)", "Anomaly (1)"]))
    print("=========================================\n")
    
    # Save the model
    model_path = os.path.join(models_dir, "fraud_detector.joblib")
    model_payload = {
        "model": model,
        "features": FRAUD_FEATURES,
        "contamination": contamination
    }
    joblib.dump(model_payload, model_path)
    print(f"Successfully saved trained model payload to {model_path}")

if __name__ == "__main__":
    train_fraud_detector()
