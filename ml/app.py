import os
import joblib
import pandas as pd
import numpy as np
import urllib.request
import urllib.parse
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

from features import (
    PREMIUM_FEATURES, DISRUPTION_FEATURES, FRAUD_FEATURES,
    preprocess_premium_input, get_disruption_label_and_multiplier
)

app = Flask(__name__)
CORS(app)

# =====================================================================
# Load Models at Startup
# =====================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# 1. Premium Regressor Model
PREMIUM_MODEL_PATH = os.path.join(MODELS_DIR, "premium_model.joblib")
try:
    premium_data = joblib.load(PREMIUM_MODEL_PATH)
    premium_model = premium_data["model"]
    print("[OK] XGBoost Premium Regressor loaded successfully.")
except Exception as e:
    print(f"[WARNING] Failed to load Premium Regressor: {e}")
    premium_model = None

# 2. Disruption Classifier Model
DISRUPTION_MODEL_PATH = os.path.join(MODELS_DIR, "disruption_classifier.joblib")
try:
    disruption_data = joblib.load(DISRUPTION_MODEL_PATH)
    disruption_model = disruption_data["model"]
    print("[OK] XGBoost Disruption Classifier loaded successfully.")
except Exception as e:
    print(f"[WARNING] Failed to load Disruption Classifier: {e}")
    disruption_model = None

# 3. Fraud Anomaly Detector Model
FRAUD_MODEL_PATH = os.path.join(MODELS_DIR, "fraud_detector.joblib")
try:
    fraud_data = joblib.load(FRAUD_MODEL_PATH)
    fraud_detector = fraud_data["model"]
    print("[OK] Isolation Forest Fraud Detector loaded successfully.")
except Exception as e:
    print(f"[WARNING] Failed to load Fraud Detector: {e}")
    fraud_detector = None


# =====================================================================
# Endpoints
# =====================================================================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "models_loaded": {
            "premium": premium_model is not None,
            "disruption": disruption_model is not None,
            "fraud": fraud_detector is not None
        }
    }), 200


@app.route('/predict/premium', methods=['POST'])
def predict_premium():
    """
    Predicts a rider's dynamic personalized premium.
    Input: raw rider profile details.
    Output: final premium price (INR) and risk-tier label (Low/Medium/High).
    """
    if not premium_model:
        return jsonify({"success": False, "message": "Premium model is not loaded"}), 500
        
    try:
        data = request.get_json() or {}
        
        # Preprocess using features module
        flat_input = preprocess_premium_input(data)
        
        # Convert to single-row DataFrame with correct columns
        df_input = pd.DataFrame([flat_input])[PREMIUM_FEATURES]
        
        # Predict premium value
        pred_premium = float(premium_model.predict(df_input)[0])
        
        # Classify risk tier based on premium value
        if pred_premium < 500.0:
            risk_tier = "Low"
        elif pred_premium < 900.0:
            risk_tier = "Medium"
        else:
            risk_tier = "High"
            
        return jsonify({
            "success": True,
            "data": {
                "final_price": round(pred_premium, 2),
                "risk_tier": risk_tier
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/predict/disruption', methods=['POST'])
def predict_disruption():
    """
    Classifies weather sensor values and civic event status.
    Input: rainfall, aqi, temperature, civic_event.
    Output: disruption class label, multiplier value, and prediction confidence.
    """
    if not disruption_model:
        return jsonify({"success": False, "message": "Disruption model is not loaded"}), 500

    try:
        data = request.get_json() or {}
        
        # Reconstruct standard inputs
        features_dict = {
            "rainfall": float(data.get("rainfall", 0.0)),
            "aqi": float(data.get("aqi", 50.0)),
            "temperature": float(data.get("temperature", 25.0)),
            "civic_event": int(data.get("civic_event", 0))
        }
        
        df_input = pd.DataFrame([features_dict])[DISRUPTION_FEATURES]
        
        # Run prediction
        class_idx = int(disruption_model.predict(df_input)[0])
        probs = disruption_model.predict_proba(df_input)[0]
        confidence = float(probs[class_idx])
        
        disruption_info = get_disruption_label_and_multiplier(class_idx)
        
        return jsonify({
            "success": True,
            "label": disruption_info["label"],
            "multiplier": disruption_info["multiplier"],
            "confidence": round(confidence, 4)
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/predict/fraud', methods=['POST'])
def predict_fraud():
    """
    Unsupervised fraud anomaly check.
    Input: distance_to_zone_km, claim_frequency_30d, avg_claim_amount_30d, etc.
    Output: anomaly score (0 to 1) and flagged boolean.
    """
    if not fraud_detector:
        return jsonify({"success": False, "message": "Fraud model is not loaded"}), 500

    try:
        data = request.get_json() or {}
        
        # Reconstruct features dict
        device_match = data.get("device_id_match", 1)
        if isinstance(device_match, bool):
            device_match = 1 if device_match else 0
            
        features_dict = {
            "distance_to_zone_km": float(data.get("distance_to_zone_km", 0.0)),
            "claim_frequency_30d": int(data.get("claim_frequency_30d", 0)),
            "avg_claim_amount_30d": float(data.get("avg_claim_amount_30d", 500.0)),
            "hours_since_last_claim": int(data.get("hours_since_last_claim", 168)),
            "device_id_match": int(device_match),
            "gps_trajectory_score": float(data.get("gps_trajectory_score", 1.0)),
            "event_cluster_count": int(data.get("event_cluster_count", 5))
        }
        
        df_input = pd.DataFrame([features_dict])[FRAUD_FEATURES]
        
        # predict: -1 = anomaly, 1 = normal
        pred_label = int(fraud_detector.predict(df_input)[0])
        decision_val = float(fraud_detector.decision_function(df_input)[0])
        
        # Sigmoid mapping to convert raw decision function score into a normalized 0 to 1 score
        # Anomalies will have score >= 0.8
        fraud_score = float(1.0 / (1.0 + np.exp(decision_val * 15.0)))
        
        return jsonify({
            "success": True,
            "anomaly_score": round(fraud_score, 4),
            "flagged": pred_label == -1
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# =====================================================================
# Spring Boot 3.2 Compatibility Endpoints (port 5000 /ml/*)
# =====================================================================

@app.route('/ml/severity', methods=['POST'])
def ml_severity():
    """
    Endpoint maps Java SeverityRequest to Disruption Event Classifier.
    """
    if not disruption_model:
        # Fallback to simple calculation if model not loaded
        return jsonify({
            "severity_class": "MEDIUM",
            "payout_modifier": 1.2,
            "confidence": 0.90
        })
        
    try:
        data = request.get_json() or {}
        disruption_type = str(data.get("disruption_type", "HEAVY_RAIN")).upper().strip()
        severity_value = float(data.get("severity_value", 0.0))
        
        # Reconstruct sensors based on what the event is
        rainfall = 0.0
        aqi = 50.0
        temperature = 25.0
        civic_event = 0
        
        if disruption_type == "HEAVY_RAIN":
            rainfall = severity_value
        elif disruption_type == "FLOOD":
            rainfall = max(20.0, severity_value)  # Flood implies heavy rainfall
        elif disruption_type == "EXTREME_HEAT":
            temperature = severity_value
        elif disruption_type == "SEVERE_AQI":
            aqi = severity_value
        elif disruption_type == "CIVIC":
            civic_event = 1
            
        df_input = pd.DataFrame([{
            "rainfall": rainfall,
            "aqi": aqi,
            "temperature": temperature,
            "civic_event": civic_event
        }])[DISRUPTION_FEATURES]
        
        class_idx = int(disruption_model.predict(df_input)[0])
        probs = disruption_model.predict_proba(df_input)[0]
        confidence = float(probs[class_idx])
        
        disruption_info = get_disruption_label_and_multiplier(class_idx)
        multiplier = disruption_info["multiplier"]
        
        # Map output to severity class labels expected by backend
        if class_idx == 0:
            severity_class = "LOW"
        elif class_idx <= 2:
            severity_class = "MEDIUM"
        else:
            severity_class = "HIGH"
            
        return jsonify({
            "severity_class": severity_class,
            "payout_modifier": multiplier,
            "confidence": round(confidence, 4)
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/ml/forecast', methods=['POST'])
def ml_forecast():
    """
    Computes parametric income loss based on duration and hourly income.
    """
    try:
        data = request.get_json() or {}
        duration_hours = float(data.get("duration_hours", 1.0))
        hourly_income = float(data.get("worker_avg_hourly_income", 150.0))
        
        estimated_loss = duration_hours * hourly_income
        
        return jsonify({
            "estimated_loss_inr": round(estimated_loss, 2)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/ml/fraud', methods=['POST'])
def ml_fraud():
    """
    Maps Java FraudRequest to Fraud Isolation Forest.
    """
    if not fraud_detector:
        # Fallback to legacy static rule logic
        data = request.get_json() or {}
        frequency = int(data.get("claim_frequency_30d", 0))
        fraud_score = min(frequency * 0.1, 1.0)
        decision = "FRAUD" if fraud_score >= 0.8 else "LEGIT"
        return jsonify({"fraud_score": fraud_score, "decision": decision})
        
    try:
        data = request.get_json() or {}
        
        device_match = data.get("device_id_match", True)
        if isinstance(device_match, bool):
            device_match = 1 if device_match else 0
            
        features_dict = {
            "distance_to_zone_km": float(data.get("distance_to_zone_km", 0.0)),
            "claim_frequency_30d": int(data.get("claim_frequency_30d", 0)),
            "avg_claim_amount_30d": float(data.get("avg_claim_amount_30d", 500.0)),
            "hours_since_last_claim": int(data.get("hours_since_last_claim", 168)),
            "device_id_match": int(device_match),
            "gps_trajectory_score": float(data.get("gps_trajectory_score", 1.0)),
            "event_cluster_count": int(data.get("event_cluster_count", 5))
        }
        
        df_input = pd.DataFrame([features_dict])[FRAUD_FEATURES]
        
        # predict: -1 = anomaly, 1 = normal
        pred_label = int(fraud_detector.predict(df_input)[0])
        decision_val = float(fraud_detector.decision_function(df_input)[0])
        
        # Calculate fraud score via sigmoid mapping
        fraud_score = float(1.0 / (1.0 + np.exp(decision_val * 15.0)))
        decision = "FRAUD" if fraud_score >= 0.8 else "LEGIT"
        
        return jsonify({
            "fraud_score": round(fraud_score, 4),
            "decision": decision
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/ml/dashboard-risk', methods=['POST'])
def ml_dashboard_risk():
    """
    Computes real-time dynamic dashboard risks for a zone.
    Integrates live values from Mock Sensor API (port 5001).
    """
    try:
        data = request.get_json() or {}
        zone = str(data.get("zone", "")).upper().strip()
        platform = str(data.get("platform", "")).title().strip()
        avg_hourly_income = float(data.get("avgHourlyIncome", 150.0))
        avg_daily_hours = float(data.get("avgDailyHours", 8.0))
        
        # Retrieve live sensor metrics from mock sensor feed (port 5001)
        rainfall, aqi, temp, civic_event = 0.0, 50.0, 25.0, 0
        try:
            # Query mock sensor API running on local port 5001
            url = f"http://localhost:5001/sensors/current?zone={urllib.parse.quote(zone)}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=1.5) as response:
                sensor_res = json.loads(response.read().decode('utf-8'))
                if sensor_res.get("success"):
                    s_data = sensor_res.get("data", {})
                    rainfall = float(s_data.get("rainfall", 0.0))
                    aqi = float(s_data.get("aqi", 50.0))
                    temp = float(s_data.get("temperature", 25.0))
                    civic_event = int(s_data.get("civic_event", 0))
        except Exception as conn_err:
            print(f"[WARNING] Could not connect to Mock Sensor API at 5001: {conn_err}. Using fallback zone stats.")
            # Local fallback stats if sensor API is offline
            if zone == "WHITEFIELD":
                rainfall, aqi, temp, civic_event = 18.5, 120.0, 27.5, 0
            elif zone == "MARATHAHALLI":
                rainfall, aqi, temp, civic_event = 2.0, 340.0, 29.0, 0
            elif zone == "ELECTRONIC CITY":
                rainfall, aqi, temp, civic_event = 0.0, 95.0, 46.5, 0
            elif zone == "KORAMANGALA":
                rainfall, aqi, temp, civic_event = 5.5, 160.0, 32.0, 1
            else:
                rainfall, aqi, temp, civic_event = 1.0, 75.0, 30.0, 0
                
        # Evaluate individual risks based on parameters
        rain_risk = "HIGH" if rainfall > 15.0 else ("MEDIUM" if rainfall > 5.0 else "LOW")
        heat_risk = "HIGH" if temp > 45.0 else ("MEDIUM" if temp > 40.0 else "LOW")
        aqi_risk = "HIGH" if aqi > 300.0 else ("MEDIUM" if aqi > 150.0 else "LOW")
        bandh_risk = "HIGH" if civic_event == 1 else "LOW"
        
        # Calculate overall risk score and multiplier using Disruption model
        overall_risk = 20
        multiplier = 0.0
        
        if disruption_model:
            df_input = pd.DataFrame([{
                "rainfall": rainfall,
                "aqi": aqi,
                "temperature": temp,
                "civic_event": civic_event
            }])[DISRUPTION_FEATURES]
            
            probs = disruption_model.predict_proba(df_input)[0]
            # Overall risk score is 100 * probability of having any disruption (classes 1, 2, 3, 4)
            overall_risk = int((1.0 - probs[0]) * 100)
            
            class_idx = int(disruption_model.predict(df_input)[0])
            dis_info = get_disruption_label_and_multiplier(class_idx)
            multiplier = dis_info["multiplier"]
        else:
            # Fallback simple overall risk formula
            if rain_risk == "HIGH" or aqi_risk == "HIGH" or heat_risk == "HIGH" or bandh_risk == "HIGH":
                overall_risk = 85
                multiplier = 1.0
            elif rain_risk == "MEDIUM" or aqi_risk == "MEDIUM":
                overall_risk = 45
                multiplier = 0.5
            
        # Income loss prediction based on current multiplier
        predicted_income_loss = round(avg_hourly_income * avg_daily_hours * multiplier, 2)
        
        # Pick appropriate forecast message
        if overall_risk >= 80:
            forecast = (
                f"Severe weather or civic disruption detected in {zone} ({overall_risk}% risk). "
                f"Income losses estimated up to ₹{predicted_income_loss}. Safe operations advised."
            )
        elif overall_risk >= 40:
            forecast = (
                f"Moderate weather adjustments expected in {zone} ({overall_risk}% risk). "
                "Minor delivery delays probable."
            )
        else:
            forecast = "Stable conditions. Standard delivery operations expected."
            
        return jsonify({
            "overallRiskScore": overall_risk,
            "rainRisk": rain_risk,
            "heatRisk": heat_risk,
            "aqiRisk": aqi_risk,
            "bandhRisk": bandh_risk,
            "predictedIncomeLoss": predicted_income_loss,
            "forecastMessage": forecast
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == '__main__':
    # Listen on port 5000
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting GigShield ML Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
