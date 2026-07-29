import os
import numpy as np
import pandas as pd

# Add the parent directory of this script to the Python path to import features
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from features import (
    PLAN_BASE_PREMIUMS, ZONE_RISK_FACTORS, CLAIM_HISTORY_FACTORS, LOYALTY_FACTORS,
    compute_parametric_label, preprocess_premium_input
)

# Set random seed for reproducibility
np.random.seed(42)

def generate_premium_data(num_samples=5000):
    """
    Generates realistic premium records for Indian gig delivery riders.
    Uses the formulas and factors from features.py to calculate a base premium
    and then applies a regression formula with noise to get final_premium.
    """
    data = []
    plans = ["SAATHI", "RAKSHAK", "SURAKSHA"]
    zones = ["SAFE", "MODERATE", "HIGH"]
    vehicles = ["two_wheeler", "three_wheeler", "bicycle", "ev_two_wheeler"]
    platforms = ["Zomato", "Swiggy", "Zepto", "Blinkit"]

    for _ in range(num_samples):
        # Sample raw features
        plan = np.random.choice(plans, p=[0.3, 0.5, 0.2])
        zone = np.random.choice(zones, p=[0.4, 0.4, 0.2])
        vehicle = np.random.choice(vehicles, p=[0.7, 0.05, 0.1, 0.15])
        platform = np.random.choice(platforms)
        
        claim_history = int(np.random.choice([0, 1, 2, 3, 4], p=[0.6, 0.25, 0.1, 0.03, 0.02]))
        policy_year = int(np.random.choice([1, 2, 3, 4], p=[0.5, 0.3, 0.15, 0.05]))
        heat_addon = int(np.random.choice([0, 1], p=[0.8, 0.2]))
        
        # Indian delivery rider income typically 12,000 to 40,000 INR
        monthly_earnings = float(np.random.uniform(12000.0, 40000.0))
        # Hours worked daily: 4 (part-time) to 12 (extreme full-time)
        daily_hours = float(np.random.uniform(4.0, 12.0))
        # Disruption history count (number of days zone was disrupted)
        disruption_days_hist = int(np.random.randint(0, 25))

        # Build raw dict
        raw_row = {
            "plan": plan,
            "risk_zone": zone,
            "claim_history": claim_history,
            "policy_year": policy_year,
            "heat_addon": heat_addon,
            "monthly_earnings": monthly_earnings,
            "daily_hours": daily_hours,
            "vehicle_type": vehicle,
            "platform": platform,
            "disruption_days_hist": disruption_days_hist
        }

        # Apply preprocessing function to calculate numeric features & factors
        preprocessed = preprocess_premium_input(raw_row)
        
        # Calculate ground truth target premium
        # We start with base premium and apply factors, then add exposure components
        base = preprocessed["base_premium"]
        
        # Base premium scaling
        premium_val = base
        premium_val *= preprocessed["zone_factor"]
        premium_val *= preprocessed["claim_factor"]
        premium_val *= preprocessed["loyalty_factor"]
        
        # Exposure adjustments
        premium_val += preprocessed["heat_addon"] * 75.0
        premium_val += preprocessed["disruption_days_hist"] * 12.0
        premium_val += (preprocessed["daily_hours"] - 8.0) * 20.0
        premium_val += (preprocessed["monthly_earnings"] / 1000.0) * 8.0
        
        # Vehicle premium adjusts
        # EV = slightly cheaper, bicycle = cheap, 3 wheeler = slightly higher
        veh_adjust = {0: 0.0, 1: 50.0, 2: -100.0, 3: -30.0}
        premium_val += veh_adjust.get(preprocessed["veh_enc"], 0.0)

        # Add Gaussian noise
        noise = np.random.normal(0.0, 25.0)
        final_premium = max(150.0, premium_val + noise)  # Floor premium at 150 INR

        # Add to output row
        preprocessed["final_premium"] = round(final_premium, 2)
        
        # Save raw values too for transparency/reference
        preprocessed["raw_plan"] = plan
        preprocessed["raw_risk_zone"] = zone
        preprocessed["raw_vehicle_type"] = vehicle
        preprocessed["raw_platform"] = platform
        
        data.append(preprocessed)

    df = pd.DataFrame(data)
    return df

def generate_disruption_data(num_samples=3000):
    """
    Generates weather sensor records and targets.
    Metrics reflect standard Indian weather ranges (monsoon rains, summer heat waves, high winter AQI).
    Ensures all 5 disruption categories (0 to 4) are well represented.
    """
    data = []
    profiles = ["normal", "minor", "moderate", "severe", "extreme"]
    
    for _ in range(num_samples):
        profile = np.random.choice(profiles, p=[0.45, 0.20, 0.15, 0.12, 0.08])
        
        if profile == "normal":
            rainfall = float(np.random.uniform(0.0, 3.0))
            aqi = float(np.random.uniform(15.0, 100.0))
            temperature = float(np.random.uniform(22.0, 35.0))
            civic_event = 0
            
        elif profile == "minor":
            # 1 moderate trigger (rainfall > 5, aqi > 150, or temp > 40)
            trigger_type = np.random.choice(["rain", "aqi", "temp"])
            if trigger_type == "rain":
                rainfall = float(np.random.uniform(6.0, 12.0))
                aqi = float(np.random.uniform(20.0, 100.0))
                temperature = float(np.random.uniform(25.0, 35.0))
            elif trigger_type == "aqi":
                rainfall = float(np.random.uniform(0.0, 2.0))
                aqi = float(np.random.uniform(160.0, 220.0))
                temperature = float(np.random.uniform(25.0, 35.0))
            else:
                rainfall = float(np.random.uniform(0.0, 2.0))
                aqi = float(np.random.uniform(20.0, 100.0))
                temperature = float(np.random.uniform(41.0, 43.0))
            civic_event = 0
            
        elif profile == "moderate":
            # 2 moderate triggers
            rainfall = float(np.random.uniform(7.0, 14.0))
            aqi = float(np.random.uniform(160.0, 240.0))
            temperature = float(np.random.uniform(30.0, 38.0))
            civic_event = 0
            
        elif profile == "severe":
            # 1 extreme trigger or 1 civic curfew without other extremes
            trigger_type = np.random.choice(["rain", "aqi", "temp", "civic"])
            if trigger_type == "rain":
                rainfall = float(np.random.uniform(16.0, 30.0))
                aqi = float(np.random.uniform(30.0, 130.0))
                temperature = float(np.random.uniform(20.0, 28.0))
                civic_event = 0
            elif trigger_type == "aqi":
                rainfall = 0.0
                aqi = float(np.random.uniform(310.0, 420.0))
                temperature = float(np.random.uniform(20.0, 30.0))
                civic_event = 0
            elif trigger_type == "temp":
                rainfall = 0.0
                aqi = float(np.random.uniform(50.0, 150.0))
                temperature = float(np.random.uniform(41.0, 44.5)) # severe heat, not quite extreme
                civic_event = 0
            else:
                rainfall = float(np.random.uniform(0.0, 4.0))
                aqi = float(np.random.uniform(50.0, 120.0))
                temperature = float(np.random.uniform(25.0, 35.0))
                civic_event = 1
                
        else: # extreme
            # Multiple extreme triggers or civic curfew + extreme weather
            trigger_type = np.random.choice(["multi_weather", "civic_plus_weather"])
            if trigger_type == "multi_weather":
                rainfall = float(np.random.uniform(18.0, 45.0))
                aqi = float(np.random.uniform(320.0, 490.0))
                temperature = float(np.random.uniform(20.0, 28.0))
                civic_event = 0
            else:
                rainfall = float(np.random.uniform(16.0, 30.0)) # rain > 15
                aqi = float(np.random.uniform(80.0, 250.0))
                temperature = float(np.random.uniform(25.0, 35.0))
                civic_event = 1

        # Compute deterministic label using parametric rule logic
        label = compute_parametric_label(rainfall, aqi, temperature, civic_event)
        
        data.append({
            "rainfall": round(rainfall, 2),
            "aqi": round(aqi, 2),
            "temperature": round(temperature, 2),
            "civic_event": civic_event,
            "label": label
        })
        
    return pd.DataFrame(data)

def generate_fraud_data(num_samples=2000, contamination=0.06):
    """
    Generates claim records for Isolation Forest anomaly detection.
    Contamination parameter determines the ratio of anomalous claims.
    """
    num_anomalies = int(num_samples * contamination)
    num_normals = num_samples - num_anomalies
    
    data = []
    
    # 1. Generate normal claims
    for _ in range(num_normals):
        # Rider is near the active zone when claiming
        distance_to_zone_km = float(np.random.exponential(scale=0.8)) # mostly under 2 km
        distance_to_zone_km = min(distance_to_zone_km, 3.5)
        
        # Rider hasn't claimed frequently in past 30 days
        claim_frequency_30d = int(np.random.choice([0, 1, 2], p=[0.75, 0.20, 0.05]))
        
        # Average claim amount reflects normal daily income replacement (e.g. 200 to 1200 INR)
        avg_claim_amount_30d = float(np.random.uniform(200.0, 1200.0))
        
        # It's been a reasonable amount of hours since last claim (e.g. days)
        hours_since_last_claim = int(np.random.randint(48, 720))
        
        # Device ID matches registered device
        device_id_match = int(np.random.choice([0, 1], p=[0.01, 0.99]))
        
        # High GPS consistency trajectory score
        gps_trajectory_score = float(np.random.uniform(0.75, 1.0))
        
        # Realistic event cluster count (other riders claiming in the same zone around same time)
        event_cluster_count = int(np.random.randint(3, 25))
        
        data.append({
            "distance_to_zone_km": round(distance_to_zone_km, 2),
            "claim_frequency_30d": claim_frequency_30d,
            "avg_claim_amount_30d": round(avg_claim_amount_30d, 2),
            "hours_since_last_claim": hours_since_last_claim,
            "device_id_match": device_id_match,
            "gps_trajectory_score": round(gps_trajectory_score, 2),
            "event_cluster_count": event_cluster_count,
            "is_anomaly": 0
        })
        
    # 2. Generate anomalous claims (spoofing, cluster anomalies, timing patterns)
    for _ in range(num_anomalies):
        anomaly_type = np.random.choice(["gps_spoof", "high_freq", "lone_wolf", "device_share"])
        
        if anomaly_type == "gps_spoof":
            # Claiming for a zone very far from GPS location
            distance_to_zone_km = float(np.random.uniform(6.0, 25.0))
            claim_frequency_30d = int(np.random.randint(0, 3))
            avg_claim_amount_30d = float(np.random.uniform(500.0, 1500.0))
            hours_since_last_claim = int(np.random.randint(24, 400))
            device_id_match = 1
            gps_trajectory_score = float(np.random.uniform(0.0, 0.40)) # Low trajectory consistency
            event_cluster_count = int(np.random.randint(5, 20))
            
        elif anomaly_type == "high_freq":
            # Claiming repeatedly in short periods
            distance_to_zone_km = float(np.random.uniform(0.0, 1.5))
            claim_frequency_30d = int(np.random.randint(6, 15)) # unusually high frequency
            avg_claim_amount_30d = float(np.random.uniform(1000.0, 3500.0))
            hours_since_last_claim = int(np.random.randint(1, 10)) # hours ago
            device_id_match = int(np.random.choice([0, 1], p=[0.2, 0.8]))
            gps_trajectory_score = float(np.random.uniform(0.60, 0.95))
            event_cluster_count = int(np.random.randint(2, 10))
            
        elif anomaly_type == "lone_wolf":
            # Claiming for a disruption where no other riders claimed (low event cluster)
            distance_to_zone_km = float(np.random.uniform(0.0, 1.0))
            claim_frequency_30d = int(np.random.randint(0, 2))
            avg_claim_amount_30d = float(np.random.uniform(800.0, 2500.0))
            hours_since_last_claim = int(np.random.randint(72, 720))
            device_id_match = 1
            gps_trajectory_score = float(np.random.uniform(0.80, 1.0))
            event_cluster_count = int(np.random.choice([0, 1])) # claim when there was actually no cluster event
            
        else: # device_share
            # Logged in from a foreign device
            distance_to_zone_km = float(np.random.uniform(0.0, 2.0))
            claim_frequency_30d = int(np.random.randint(1, 4))
            avg_claim_amount_30d = float(np.random.uniform(500.0, 2000.0))
            hours_since_last_claim = int(np.random.randint(12, 168))
            device_id_match = 0 # No device match
            gps_trajectory_score = float(np.random.uniform(0.1, 0.70))
            event_cluster_count = int(np.random.randint(3, 15))
            
        data.append({
            "distance_to_zone_km": round(distance_to_zone_km, 2),
            "claim_frequency_30d": claim_frequency_30d,
            "avg_claim_amount_30d": round(avg_claim_amount_30d, 2),
            "hours_since_last_claim": hours_since_last_claim,
            "device_id_match": device_id_match,
            "gps_trajectory_score": round(gps_trajectory_score, 2),
            "event_cluster_count": event_cluster_count,
            "is_anomaly": 1
        })
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    # Create target directories if they don't exist
    os.makedirs(os.path.join(os.path.dirname(__file__)), exist_ok=True)
    data_dir = os.path.dirname(__file__)
    
    print("Generating synthetic datasets...")
    
    premium_df = generate_premium_data()
    premium_path = os.path.join(data_dir, "premium_dataset.csv")
    premium_df.to_csv(premium_path, index=False)
    print(f" Saved premium dataset to {premium_path} ({premium_df.shape[0]} rows)")

    disruption_df = generate_disruption_data()
    disruption_path = os.path.join(data_dir, "disruption_dataset.csv")
    disruption_df.to_csv(disruption_path, index=False)
    print(f" Saved disruption dataset to {disruption_path} ({disruption_df.shape[0]} rows)")

    fraud_df = generate_fraud_data()
    fraud_path = os.path.join(data_dir, "fraud_dataset.csv")
    fraud_df.to_csv(fraud_path, index=False)
    print(f" Saved fraud dataset to {fraud_path} ({fraud_df.shape[0]} rows)")
    
    print("Dataset generation complete!")
