# GigShield Machine Learning Pipeline

This service contains the complete AI/ML layer for **GigShield**, serving personalized parametric premiums, real-time disruption monitoring, and claim fraud detection for gig riders in India.

It is designed to run locally and integrate seamlessly with a Spring Boot backend and the mock sensor API.

---

## Directory Structure

```
ml/
├── data/                             # Synthetic datasets
│   ├── generate_synthetic_data.py    # Generates realistic data CSVs
│   ├── premium_dataset.csv
│   ├── disruption_dataset.csv
│   └── fraud_dataset.csv
├── models/                           # Trained joblib artifacts
│   ├── premium_model.joblib
│   ├── disruption_classifier.joblib
│   └── fraud_detector.joblib
├── requirements.txt                  # Python dependencies
├── features.py                       # Shared preprocessors & thresholds
├── train_premium_model.py            # Personalised premium regressor
├── train_disruption_classifier.py    # Disruption event multi-class classifier
├── train_fraud_detector.py           # Isolation Forest anomaly detector
├── app.py                            # Flask serving API (port 5000)
├── mock_sensor_api.py                # Mock weather sensor API (port 5001)
└── README.md                         # Project documentation
```

---

## Getting Started

### 1. Prerequisites
Ensure Python 3.11+ is installed. Then, install the required packages:
```bash
pip install -r ml/requirements.txt
```

### 2. Generate Synthetic Data
Run the generator script to construct realistic CSV datasets for model training under `ml/data/`:
```bash
python ml/data/generate_synthetic_data.py
```

### 3. Train Models
Run the training scripts to train, evaluate, and save the model artifacts:
```bash
# 1. Train dynamic premium regressor
python ml/train_premium_model.py

# 2. Train weather disruption classifier
python ml/train_disruption_classifier.py

# 3. Train claim fraud anomaly detector
python ml/train_fraud_detector.py
```

Training metrics (Accuracy, RMSE, F1, and Confusion Matrices) will print to the console. The models are saved to `ml/models/`.

---

## Running the Servers

Start the servers locally to accept REST calls:

### 1. Start the Mock Sensor API (Port 5001)
The mock sensor API feeds real-time rainfall, AQI, temp, and curfew signals.
```bash
python ml/mock_sensor_api.py
```

### 2. Start the GigShield ML API (Port 5000)
Loads all trained joblib models and serves predictions:
```bash
python ml/app.py
```

---

## Parametric Payout Logic & Thresholds

Our Disruption Classifier categorizes real-time metrics into **5 disruption classes**:
1. **No Disruption** — `0x` payout multiplier (Class 0)
2. **Minor Disruption** — `0.25x` payout multiplier (Class 1)
3. **Moderate Disruption** — `0.5x` payout multiplier (Class 2)
4. **Severe Disruption** — `1.0x` payout multiplier (Class 3)
5. **Extreme Disruption** — `1.5x` payout multiplier (Class 4)

### Parametric Triggers (features.py)
* **Rainfall Thresholds**: 
  - `>15 mm/hour` represents heavy, disruptive rainfall (severe/extreme).
  - `>5 mm/hour` represents light/moderate monsoon rainfall (minor/moderate).
* **AQI Thresholds**:
  - `>300` represents severe air pollution hazard (severe/extreme).
  - `>150` represents unhealthy air quality (minor/moderate).
* **Extreme Heat Thresholds**:
  - `>45°C` triggers extreme heat warnings (extreme).
  - `>40°C` triggers high heat exposure warnings (severe/moderate).
* **Civic Disruption Flag**:
  - `1` represents a curfew, strike, or protest curfew active (severe/extreme).

---

## Endpoint API Documentation

### ML API (Port 5000)

#### 1. Dynamic Premium Prediction
* **Endpoint**: `POST /predict/premium`
* **Request JSON**:
```json
{
  "plan": "RAKSHAK",
  "risk_zone": "MODERATE",
  "claim_history": 1,
  "policy_year": 2,
  "heat_addon": 1,
  "monthly_earnings": 25000,
  "daily_hours": 9,
  "vehicle_type": "two_wheeler",
  "platform": "Zomato",
  "disruption_days_hist": 8
}
```
* **Response JSON**:
```json
{
  "success": true,
  "data": {
    "final_price": 932.14,
    "risk_tier": "High"
  }
}
```

#### 2. Disruption Event Classification
* **Endpoint**: `POST /predict/disruption`
* **Request JSON**:
```json
{
  "rainfall": 18.5,
  "aqi": 110.0,
  "temperature": 28.0,
  "civic_event": 0
}
```
* **Response JSON**:
```json
{
  "success": true,
  "label": "Severe Disruption",
  "multiplier": 1.0,
  "confidence": 0.9984
}
```

#### 3. Fraud Anomaly Detection
* **Endpoint**: `POST /predict/fraud`
* **Request JSON**:
```json
{
  "distance_to_zone_km": 8.4,
  "claim_frequency_30d": 5,
  "avg_claim_amount_30d": 2200,
  "hours_since_last_claim": 4,
  "device_id_match": false,
  "gps_trajectory_score": 0.25,
  "event_cluster_count": 2
}
```
* **Response JSON**:
```json
{
  "success": true,
  "anomaly_score": 0.9421,
  "flagged": true
}
```

#### 4. Service Health
* **Endpoint**: `GET /health`
* **Response JSON**:
```json
{
  "status": "ok",
  "models_loaded": {
    "premium": true,
    "disruption": true,
    "fraud": true
  }
}
```

---

### Spring Boot 3.2 Compatibility APIs (Port 5000)

These endpoints run on the same port but are structured specifically for client consumption by the Spring Boot backend (`MLClient.java`).

* **POST `/ml/severity`**: Evaluates claim weather event type/value against the XGBoost disruption classifier. Returns `{"severity_class": "HIGH", "payout_modifier": 1.0, "confidence": 0.99}`.
* **POST `/ml/forecast`**: Predicts rider income replacement loss value. Returns `{"estimated_loss_inr": 300.0}`.
* **POST `/ml/fraud`**: Runs Isolation forest and maps raw score to `[0.0, 1.0]` (claims with scores `>= 0.8` trigger automatic rejection). Returns `{"fraud_score": 0.875, "decision": "FRAUD"}`.
* **POST `/ml/dashboard-risk`**: Fetches current zone sensors from port 5001 to dynamically calculate dashboard metrics for riders. Returns `{"overallRiskScore": 75, "rainRisk": "HIGH", "heatRisk": "LOW", "aqiRisk": "MEDIUM", "bandhRisk": "LOW", "predictedIncomeLoss": 600.0, "forecastMessage": "..."}`.

---

### Mock Sensor Feed API (Port 5001)

Provides real-time simulation metrics for Bangalore zones.

#### 1. Retrieve Current Weather & Civic Feed
* **Endpoint**: `GET /sensors/current?zone=KORAMANGALA`
* **Response JSON**:
```json
{
  "success": true,
  "data": {
    "zone": "KORAMANGALA",
    "rainfall": 5.5,
    "aqi": 160.0,
    "temperature": 32.0,
    "civic_event": 1
  }
}
```

* **Interactive Override Option**: Add query parameters to manually check specific configurations:
  `GET /sensors/current?zone=WHITEFIELD&rainfall=25.0&civic_event=1`
