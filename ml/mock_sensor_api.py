import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for cross-origin requests
CORS(app)

# Predefined weather states for various Bangalore zones to simulate realistic scenarios
ZONE_SENSOR_DATA = {
    "WHITEFIELD": {
        "zone": "WHITEFIELD",
        "rainfall": 18.5,        # Heavy Rain (Parametric trigger > 15)
        "aqi": 120.0,
        "temperature": 27.5,
        "civic_event": 0
    },
    "MARATHAHALLI": {
        "zone": "MARATHAHALLI",
        "rainfall": 2.0,
        "aqi": 340.0,            # Severe AQI (Parametric trigger > 300)
        "temperature": 29.0,
        "civic_event": 0
    },
    "ELECTRONIC CITY": {
        "zone": "ELECTRONIC CITY",
        "rainfall": 0.0,
        "aqi": 95.0,
        "temperature": 46.5,     # Extreme Heat (Parametric trigger > 45)
        "civic_event": 0
    },
    "KORAMANGALA": {
        "zone": "KORAMANGALA",
        "rainfall": 5.5,         # Moderate rain
        "aqi": 160.0,            # Moderate AQI
        "temperature": 32.0,
        "civic_event": 1         # Civic disruption event active (curfew/strike)
    },
    "HSR LAYOUT": {
        "zone": "HSR LAYOUT",
        "rainfall": 1.2,
        "aqi": 75.0,
        "temperature": 30.5,
        "civic_event": 0         # Standard normal operations
    }
}

DEFAULT_SENSOR_DATA = {
    "rainfall": 0.0,
    "aqi": 50.0,
    "temperature": 25.0,
    "civic_event": 0
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "mock_sensor_api"}), 200

@app.route('/sensors/current', methods=['GET'])
def get_sensor_data():
    """
    Returns simulated sensor feed for a given zone.
    Allows query parameter overrides for easy manual verification.
    Example: GET /sensors/current?zone=HSR%20LAYOUT&rainfall=25.0
    """
    zone_arg = request.args.get('zone', '').upper().strip()
    
    # Retrieve base data for the zone or fall back to default
    if zone_arg in ZONE_SENSOR_DATA:
        sensor_data = ZONE_SENSOR_DATA[zone_arg].copy()
    else:
        sensor_data = DEFAULT_SENSOR_DATA.copy()
        sensor_data["zone"] = zone_arg or "DEFAULT"

    # Allow query parameter overrides for manual testing/testing extreme combinations
    if 'rainfall' in request.args:
        try:
            sensor_data['rainfall'] = float(request.args.get('rainfall'))
        except ValueError:
            pass
            
    if 'aqi' in request.args:
        try:
            sensor_data['aqi'] = float(request.args.get('aqi'))
        except ValueError:
            pass
            
    if 'temperature' in request.args:
        try:
            sensor_data['temperature'] = float(request.args.get('temperature'))
        except ValueError:
            pass
            
    if 'civic_event' in request.args:
        try:
            sensor_data['civic_event'] = int(request.args.get('civic_event'))
        except ValueError:
            pass

    return jsonify({
        "success": True,
        "data": sensor_data
    }), 200

@app.route('/sensors/all', methods=['GET'])
def get_all_zones():
    """
    Helper endpoint to list all predefined zone configurations.
    """
    return jsonify({
        "success": True,
        "zones": ZONE_SENSOR_DATA
    }), 200

if __name__ == '__main__':
    # Listen on port 5001
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting Mock Sensor API on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
