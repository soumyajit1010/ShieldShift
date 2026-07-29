import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb

from features import PREMIUM_FEATURES

def train_premium_model():
    # Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "premium_dataset.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    print(f"Loading premium dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Separate features and target
    X = df[PREMIUM_FEATURES]
    y = df["final_premium"]
    
    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training set size: {X_train.shape[0]} | Test set size: {X_test.shape[0]}")
    
    # Initialize and train XGBoost Regressor
    model = xgb.XGBRegressor(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    
    print("Training XGBoost Regressor...")
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("\n=========================================")
    print("Premium Regressor Model Evaluation Metrics")
    print("=========================================")
    print(f"Root Mean Squared Error (RMSE): INR {rmse:.2f}")
    print(f"Mean Absolute Error (MAE):      INR {mae:.2f}")
    print(f"R-squared Score (R2):           {r2:.4f}")
    print("=========================================\n")
    
    # Save the model
    model_path = os.path.join(models_dir, "premium_model.joblib")
    # For compatibility, save a structure containing the model and features
    model_payload = {
        "model": model,
        "features": PREMIUM_FEATURES
    }
    joblib.dump(model_payload, model_path)
    print(f"Successfully saved trained model payload to {model_path}")

if __name__ == "__main__":
    train_premium_model()
