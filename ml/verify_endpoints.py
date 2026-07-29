import urllib.request
import json

def test_get(url):
    print(f"GET {url}")
    try:
        with urllib.request.urlopen(url, timeout=2.0) as res:
            data = json.loads(res.read().decode('utf-8'))
            print("Response:", json.dumps(data, indent=2))
            return True, data
    except Exception as e:
        print("ERROR:", e)
        return False, None

def test_post(url, payload):
    print(f"POST {url}")
    print("Payload:", json.dumps(payload))
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=2.0) as res:
            data = json.loads(res.read().decode('utf-8'))
            print("Response:", json.dumps(data, indent=2))
            return True, data
    except Exception as e:
        print("ERROR:", e)
        return False, None

def run_tests():
    print("====================================================")
    print("Verifying GigShield ML API & Sensor API Endpoints")
    print("====================================================\n")
    
    # 1. Health checks
    test_get("http://localhost:5001/health")
    test_get("http://localhost:5000/health")
    
    # 2. Mock Sensor API zone fetch
    test_get("http://localhost:5001/sensors/current?zone=KORAMANGALA")
    # test overrides
    test_get("http://localhost:5001/sensors/current?zone=HSR%20LAYOUT&rainfall=25.0&civic_event=1")
    
    # 3. Predict Premium
    premium_payload = {
        "plan": "RAKSHAK",
        "risk_zone": "MODERATE",
        "claim_history": 1,
        "policy_year": 2,
        "heat_addon": 1,
        "monthly_earnings": 25000.0,
        "daily_hours": 9.0,
        "vehicle_type": "two_wheeler",
        "platform": "Zomato",
        "disruption_days_hist": 8
    }
    test_post("http://localhost:5000/predict/premium", premium_payload)
    
    # 4. Predict Disruption
    disruption_payload = {
        "rainfall": 18.5,
        "aqi": 110.0,
        "temperature": 28.0,
        "civic_event": 0
    }
    test_post("http://localhost:5000/predict/disruption", disruption_payload)
    
    # 5. Predict Fraud
    fraud_payload = {
        "distance_to_zone_km": 8.4,
        "claim_frequency_30d": 5,
        "avg_claim_amount_30d": 2200.0,
        "hours_since_last_claim": 4,
        "device_id_match": False,
        "gps_trajectory_score": 0.25,
        "event_cluster_count": 2
    }
    test_post("http://localhost:5000/predict/fraud", fraud_payload)
    
    # 6. Legacy /ml/severity Compatibility
    severity_payload = {
        "disruption_type": "HEAVY_RAIN",
        "severity_value": 18.5,
        "duration_hours": 3.0,
        "zone_risk_tier": 2,
        "time_of_day": 14,
        "historical_avg_severity": 10.0
    }
    test_post("http://localhost:5000/ml/severity", severity_payload)
    
    # 7. Legacy /ml/forecast Compatibility
    forecast_payload = {
        "disruption_type": "HEAVY_RAIN",
        "severity_class": "HIGH",
        "duration_hours": 4.0,
        "worker_avg_hourly_income": 150.0,
        "zone_risk_tier": 2,
        "time_of_day": 14
    }
    test_post("http://localhost:5000/ml/forecast", forecast_payload)
    
    # 8. Legacy /ml/fraud Compatibility
    legacy_fraud_payload = {
        "worker_id": 101,
        "distance_to_zone_km": 0.5,
        "platform_status": "ACTIVE",
        "claim_frequency_30d": 1,
        "avg_claim_amount_30d": 350.0,
        "hours_since_last_claim": 120,
        "device_id_match": True,
        "gps_trajectory_score": 0.95,
        "event_cluster_count": 8
    }
    test_post("http://localhost:5000/ml/fraud", legacy_fraud_payload)
    
    # 9. Legacy /ml/dashboard-risk Compatibility
    dashboard_payload = {
        "zone": "KORAMANGALA",
        "platform": "Zomato",
        "avgHourlyIncome": 180.0,
        "avgDailyHours": 8.5
    }
    test_post("http://localhost:5000/ml/dashboard-risk", dashboard_payload)

if __name__ == "__main__":
    run_tests()
