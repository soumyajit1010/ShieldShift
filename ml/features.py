import pandas as pd
import numpy as np

# =====================================================================
# Constant Parameters and Thresholds (Parametric Trigger Logic)
# =====================================================================
PLAN_BASE_PREMIUMS = {
    "SAATHI": 399.0,
    "RAKSHAK": 699.0,
    "SURAKSHA": 999.0
}

ZONE_RISK_FACTORS = {
    "SAFE": 0.85,
    "MODERATE": 1.0,
    "HIGH": 1.25
}

CLAIM_HISTORY_FACTORS = {
    0: 0.90,
    1: 1.00,
    2: 1.15
}

LOYALTY_FACTORS = {
    1: 1.00,
    2: 0.95,
    3: 0.90
}

# Parametric thresholds
RAINFALL_THRESHOLD_HEAVY = 15.0      # > 15mm/hr triggers Severe/Extreme disruption
RAINFALL_THRESHOLD_MODERATE = 5.0    # > 5mm/hr triggers Minor/Moderate disruption

AQI_THRESHOLD_SEVERE = 300.0         # > 300 triggers Severe/Extreme disruption
AQI_THRESHOLD_MODERATE = 150.0       # > 150 triggers Minor/Moderate disruption

TEMP_THRESHOLD_EXTREME = 45.0        # > 45C triggers Extreme disruption
TEMP_THRESHOLD_HIGH = 40.0           # > 40C triggers Severe disruption

# =====================================================================
# Feature Lists for XGBoost / Isolation Forest Models
# =====================================================================
PREMIUM_FEATURES = [
    "plan_enc",
    "zone_enc",
    "claim_history",
    "policy_year",
    "heat_addon",
    "monthly_earnings",
    "daily_hours",
    "veh_enc",
    "plat_enc",
    "disruption_days_hist",
    "zone_factor",
    "claim_factor",
    "loyalty_factor",
    "base_premium"
]

DISRUPTION_FEATURES = [
    "rainfall",
    "aqi",
    "temperature",
    "civic_event"
]

FRAUD_FEATURES = [
    "distance_to_zone_km",
    "claim_frequency_30d",
    "avg_claim_amount_30d",
    "hours_since_last_claim",
    "device_id_match",
    "gps_trajectory_score",
    "event_cluster_count"
]

# =====================================================================
# Preprocessing / Mapping Functions
# =====================================================================

def preprocess_premium_input(data):
    """
    Standardizes raw premium request dictionary and outputs a flat dictionary
    with the exact numerical columns expected by the XGBoost premium regressor.
    """
    plan = str(data.get('plan', 'RAKSHAK')).upper()
    risk_zone = str(data.get('risk_zone', 'MODERATE')).upper()
    claim_history = int(data.get('claim_history', 0))
    policy_year = int(data.get('policy_year', 1))
    heat_addon = int(data.get('heat_addon', 0))
    monthly_earnings = float(data.get('monthly_earnings', 20000.0))
    daily_hours = float(data.get('daily_hours', 8.0))
    vehicle_type = str(data.get('vehicle_type', 'two_wheeler')).lower()
    platform = str(data.get('platform', 'Zomato')).title()
    disruption_days_hist = int(data.get('disruption_days_hist', 5))

    # Calculate Factors
    base_premium = PLAN_BASE_PREMIUMS.get(plan, 699.0)
    zone_factor = ZONE_RISK_FACTORS.get(risk_zone, 1.0)
    
    # Cap values at same bounds used in training/existing code
    claim_val = min(claim_history, 2)
    claim_factor = CLAIM_HISTORY_FACTORS.get(claim_val, 1.15)
    
    policy_val = min(policy_year, 3)
    loyalty_factor = LOYALTY_FACTORS.get(policy_val, 0.90)

    # Encodings
    plan_map = {"SAATHI": 0, "RAKSHAK": 1, "SURAKSHA": 2}
    zone_map = {"SAFE": 0, "MODERATE": 1, "HIGH": 2}
    veh_map = {"two_wheeler": 0, "three_wheeler": 1, "bicycle": 2, "ev_two_wheeler": 3}
    plat_map = {"Zomato": 0, "Swiggy": 1, "Zepto": 2, "Blinkit": 3}

    plan_enc = plan_map.get(plan, 1)
    zone_enc = zone_map.get(risk_zone, 1)
    veh_enc = veh_map.get(vehicle_type, 0)
    plat_enc = plat_map.get(platform, 0)

    return {
        "plan_enc": plan_enc,
        "zone_enc": zone_enc,
        "claim_history": claim_val,
        "policy_year": policy_val,
        "heat_addon": heat_addon,
        "monthly_earnings": monthly_earnings,
        "daily_hours": daily_hours,
        "veh_enc": veh_enc,
        "plat_enc": plat_enc,
        "disruption_days_hist": disruption_days_hist,
        "zone_factor": zone_factor,
        "claim_factor": claim_factor,
        "loyalty_factor": loyalty_factor,
        "base_premium": base_premium
    }

def get_disruption_label_and_multiplier(class_idx):
    """
    Maps model class index (0 to 4) to disruption name and payout multiplier.
    """
    mapping = {
        0: {"label": "No Disruption", "multiplier": 0.0},
        1: {"label": "Minor Disruption", "multiplier": 0.25},
        2: {"label": "Moderate Disruption", "multiplier": 0.5},
        3: {"label": "Severe Disruption", "multiplier": 1.0},
        4: {"label": "Extreme Disruption", "multiplier": 1.5}
    }
    return mapping.get(class_idx, {"label": "No Disruption", "multiplier": 0.0})

def compute_parametric_label(rainfall, aqi, temperature, civic_event):
    """
    Deterministic rule-based logic representing target labels for disruption classifier,
    encoding parametric trigger thresholds:
      - Rainfall > 15mm/hr (Severe/Extreme)
      - AQI > 300 (Severe/Extreme)
      - Civic disruption curfew, strike, protest (Severe/Extreme)
      - Extreme heat > 45C (Extreme), > 40C (Severe)
    """
    # Extreme conditions
    is_extreme_rain = rainfall > RAINFALL_THRESHOLD_HEAVY
    is_extreme_aqi = aqi > AQI_THRESHOLD_SEVERE
    is_extreme_heat = temperature > TEMP_THRESHOLD_EXTREME
    is_civic = int(civic_event) == 1

    # Moderate conditions
    is_mod_rain = rainfall > RAINFALL_THRESHOLD_MODERATE
    is_mod_aqi = aqi > AQI_THRESHOLD_MODERATE
    is_mod_heat = temperature > TEMP_THRESHOLD_HIGH

    # Sum of extreme metrics
    extreme_count = sum([is_extreme_rain, is_extreme_aqi, is_extreme_heat])

    if is_civic:
        # Civic curfew + any extreme weather -> Extreme Disruption
        if extreme_count > 0:
            return 4  # Extreme Disruption (1.5x)
        else:
            return 3  # Severe Disruption (1.0x)

    if extreme_count >= 2:
        return 4  # Extreme Disruption (1.5x)
    elif extreme_count == 1:
        return 3  # Severe Disruption (1.0x)
    
    # Moderate/Minor classification
    mod_count = sum([is_mod_rain, is_mod_aqi, is_mod_heat])
    if mod_count >= 2:
        return 2  # Moderate Disruption (0.5x)
    elif mod_count == 1:
        return 1  # Minor Disruption (0.25x)
        
    return 0  # No Disruption (0x)
