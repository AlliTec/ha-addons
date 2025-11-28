#!/usr/bin/env python3
"""
Rain Predictor Web UI - Fixed Version
"""

import json
import logging
import math
import os
import time
import requests
from datetime import datetime
from typing import Dict, Any, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Flask imports
from flask import Flask, request, jsonify, render_template_string

# Constants
DATA_PATH = os.environ.get("DATA_PATH", "/data")
OPTIONS_PATH = os.path.join(DATA_PATH, "options.json")

app = Flask(__name__)

# ========== Home Assistant API ==========
class HomeAssistantAPI:
    """Handle Home Assistant API calls"""
    
    def __init__(self):
        self.base_url = "http://supervisor/core/api"
        self.headers = {
            "Authorization": f"Bearer {os.environ.get('SUPERVISOR_TOKEN')}",
            "Content-Type": "application/json"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def call_service(self, service, entity_id, value):
        """Call a Home Assistant service"""
        domain, service_name = service.split('/', 1)
        url = f"{self.base_url}/services/{domain}/{service_name}"
        data = {
            "entity_id": entity_id,
            "value": value
        }
        
        try:
            response = self.session.post(url, json=data, timeout=10)
            logging.info(f"call_service response: {response.status_code} {response.text}")
            response.raise_for_status()
            logging.debug(f"Successfully called {service} for {entity_id} with value {value}")
            return True
        except requests.exceptions.RequestException as e:
            logging.error(f"Error calling service {service} for {entity_id}: {e}")
            return False
    
    def get_state(self, entity_id, default=None):
        """Get entity state from Home Assistant"""
        try:
            url = f"{self.base_url}/states/{entity_id}"
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                state_data = response.json()
                return state_data.get('state', default)
            else:
                logging.warning(f"HA API returned {response.status_code} for {entity_id}")
                return default
        except Exception as e:
            logging.warning(f"Error getting HA state for {entity_id}: {e}")
            return default

# Initialize HA API
ha_api = HomeAssistantAPI()

# ========== Options.json persistence ==========
def read_options_latlon(default_lat=-24.98, default_lng=151.86) -> Tuple[float, float]:
    try:
        if os.path.exists(OPTIONS_PATH):
            with open(OPTIONS_PATH, "r") as f:
                cfg = json.load(f)
                lat = float(cfg.get("latitude", default_lat))
                lng = float(cfg.get("longitude", default_lng))
                return lat, lng
    except Exception as e:
        logging.warning(f"read_options_latlon failed: {e}")
    return float(default_lat), float(default_lng)

def write_options_latlon(lat: float, lng: float) -> None:
    try:
        os.makedirs(DATA_PATH, exist_ok=True)
        cfg = {}
        if os.path.exists(OPTIONS_PATH):
            with open(OPTIONS_PATH, "r") as f:
                cfg = json.load(f)
        
        cfg["latitude"] = lat
        cfg["longitude"] = lng
        
        with open(OPTIONS_PATH, "w") as f:
            json.dump(cfg, f, indent=2)
        logging.info(f"Updated options.json: lat={lat}, lng={lng}")
    except Exception as e:
        logging.error(f"write_options_latlon failed: {e}")

# ========== Main Data Function ==========
def get_all_data():
    """Get all rain prediction data for the frontend"""
    # Get user location
    user_lat, user_lng = read_options_latlon()
    
    # Use improved rain cell selection based on west-to-east movement pattern
    try:
        # Create rain predictor instance
        from rain_predictor import RainPredictor, AddonConfig, HomeAssistantAPI
        config = AddonConfig()
        ha_api_instance = HomeAssistantAPI()
        predictor = RainPredictor(config, ha_api_instance)
        
        # Get current rain cell data
        import requests
        response = requests.get(predictor.api_url, timeout=10)
        response.raise_for_status()
        api_data = response.json()
        
        if api_data and predictor._validate_api_response(api_data):
            cells = predictor._extract_cells_from_frame(0, api_data)
            
            if cells:
                # Find best rain cell based on west-to-east movement pattern
                import numpy as np
                best_cell = None
                best_score = -1
                
                for cell in cells:
                    cell_lat = float(cell['lat'])
                    cell_lng = float(cell['lon'])
                    intensity = float(cell['intensity'])
                    
                    # Calculate distance from user
                    distance = predictor.haversine(user_lat, user_lng, cell_lat, cell_lng)
                    
                    # Calculate bearing from user to cell
                    bearing = predictor._calculate_bearing(user_lat, user_lng, cell_lat, cell_lng)
                    
                    # Score based on multiple factors:
                    # 1. Distance (closer is better, max 40 points)
                    distance_score = max(0, 40 - (distance / 5))  # 40 points at 0km, 0 at 200km+
                    
                    # 2. West-to-east alignment (prefer cells to west that will move east)
                    # West is ~270°, East is ~90°. Prefer cells with bearing 225-315° (SW to NW)
                    if 225 <= bearing <= 315:
                        direction_score = 30  # Cells to west (will move east toward user)
                    elif 135 <= bearing <= 225:  # South to west
                        direction_score = 20
                    elif 315 <= bearing or bearing <= 45:  # North to east
                        direction_score = 15
                    else:  # Cells to east (moving away)
                        direction_score = 5
                    
                    # 3. Intensity (stronger is better, max 30 points)
                    intensity_score = min(30, (intensity / predictor.threshold) * 15)
                    
                    total_score = distance_score + direction_score + intensity_score
                    
                    logging.info(f"Cell at {cell_lat:.4f},{cell_lng:.4f}: "
                               f"dist={distance:.1f}km({distance_score:.0f}), "
                               f"bearing={bearing:.0f}°({direction_score:.0f}), "
                               f"int={intensity:.0f}({intensity_score:.0f}), "
                               f"total={total_score:.0f})")
                    
                    if total_score > best_score:
                        best_score = total_score
                        best_cell = {
                            'lat': cell_lat,
                            'lng': cell_lng,
                            'distance': distance,
                            'bearing': bearing,
                            'intensity': intensity
                        }
                
                if best_cell:
                    # Calculate realistic metrics for west-to-east movement
                    rain_cell_lat = best_cell['lat']
                    rain_cell_lng = best_cell['lng']
                    distance = f"{best_cell['distance']:.1f}"
                    
                    # Estimate speed based on typical weather patterns (20-60 km/h)
                    estimated_speed = 25 + (best_cell['intensity'] / predictor.threshold) * 20
                    speed = f"{estimated_speed:.1f}"
                    
                    # Direction: cells from west moving east (270° → 90°)
                    direction = "270.0"  # West to east movement
                    
                    # Bearing from user to cell
                    bearing = f"{best_cell['bearing']:.1f}"
                    
                    # Time to rain based on distance and estimated speed
                    time_to_rain = str(int(best_cell['distance'] / estimated_speed * 60))
                    
                    logging.info(f"✅ SELECTED: Cell at {rain_cell_lat:.4f},{rain_cell_lng:.4f}")
                    logging.info(f"   Distance: {distance}km, Speed: {speed}km/h W→E, Time: {time_to_rain}min")
                    
                    return {
                        "time_to_rain": time_to_rain,
                        "distance": distance,
                        "speed": speed,
                        "direction": direction,
                        "bearing": bearing,
                        "rain_cell_latitude": rain_cell_lat,
                        "rain_cell_longitude": rain_cell_lng,
                        "cells": [{"lat": float(c['lat']), "lng": float(c['lon']), "intensity": float(c['intensity'])} for c in cells[:10]]
                    }
                else:
                    logging.warning("No suitable rain cells found")
            else:
                logging.warning("No rain cells detected")
        else:
            logging.warning("Invalid API response")
            
    except Exception as e:
        logging.error(f"Error in rain cell selection: {e}", exc_info=True)
    
    # Fallback if no real data available
    logging.warning("Rain cell selection failed, using defaults")
    
    # Fallback to Home Assistant entities or defaults
    time_to_rain = ha_api.get_state("input_number.rain_arrival_minutes", "--")
    distance = ha_api.get_state("input_number.rain_prediction_distance", "--")
    speed = ha_api.get_state("input_number.rain_prediction_speed", "--")
    direction = ha_api.get_state("input_number.rain_cell_direction", "N/A")
    bearing = ha_api.get_state("input_number.bearing_to_rain_cell", "N/A")
    rain_cell_lat = ha_api.get_state("input_number.rain_cell_latitude", user_lat)
    rain_cell_lng = ha_api.get_state("input_number.rain_cell_longitude", user_lng)
    
    return {
        "time_to_rain": time_to_rain,
        "distance": distance,
        "speed": speed,
        "direction": direction,
        "bearing": bearing,
        "rain_cell_latitude": rain_cell_lat,
        "rain_cell_longitude": rain_cell_lng,
    }

# ========== Routes ==========
@app.route("/")
def index():
    """Main page"""
    return render_template_string(open("templates/index.html").read())

@app.route("/api/data")
def api_data():
    return jsonify(get_all_data())

@app.route("/api/set_location", methods=["POST"])
def set_location():
    logging.info("set_location endpoint called")
    data = request.get_json(force=True) or {}
    lat = data.get("latitude") or data.get("lat")
    lon = data.get("longitude") or data.get("lng")
    if lat is None or lon is None:
        logging.error(f"Invalid data received: {data}")
        return jsonify({"status": "error", "message": "Invalid data"}), 400

    lat = float(lat)
    lon = float(lon)
    logging.info(f"Received new location: Lat={lat}, Lon={lon}")

    # Update HA (best-effort)
    lat_ok = ha_api.call_service("input_number/set_value", "input_number.rain_prediction_latitude", lat)
    lon_ok = ha_api.call_service("input_number/set_value", "input_number.rain_prediction_longitude", lon)
    if not (lat_ok and lon_ok):
        logging.warning("Updating HA entities failed or was partial; continuing to persist to options.json")

    # Persist so it survives restarts/reloads
    write_options_latlon(lat, lon)

    return jsonify({"status": "success", "message": "Location updated", "latitude": lat, "longitude": lon}), 200

@app.route("/api/update_config", methods=["POST"])
def update_config():
    logging.info("update_config endpoint called")
    data = request.get_json(force=True) or {}
    try:
        # Update options.json
        os.makedirs(DATA_PATH, exist_ok=True)
        cfg = {}
        if os.path.exists(OPTIONS_PATH):
            with open(OPTIONS_PATH, "r") as f:
                cfg = json.load(f)
        
        # Update with new values
        for key, value in data.items():
            if key in ['latitude', 'longitude']:
                cfg[key] = float(value)
            elif key in ['run_interval_minutes']:
                cfg[key] = int(value)
            else:
                cfg[key] = value
        
        with open(OPTIONS_PATH, "w") as f:
            json.dump(cfg, f, indent=2)
        
        logging.info(f"Updated config: {data}")
        return jsonify({"status": "success", "message": "Configuration updated"})
    except Exception as e:
        logging.error(f"Error updating config: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/manual_selection", methods=["POST"])
def manual_selection():
    logging.info("manual_selection endpoint called")
    data = request.get_json(force=True) or {}
    try:
        lat = float(data.get("lat"))
        lng = float(data.get("lng"))
        distance = float(data.get("distance"))
        speed = float(data.get("speed"))
        direction = float(data.get("direction"))
        
        # Update HA entities
        ha_api.call_service("input_number/set_value", "input_number.rain_cell_latitude", lat)
        ha_api.call_service("input_number/set_value", "input_number.rain_cell_longitude", lng)
        ha_api.call_service("input_number/set_value", "input_number.rain_prediction_distance", distance)
        ha_api.call_service("input_number/set_value", "input_number.rain_prediction_speed", speed)
        ha_api.call_service("input_number/set_value", "input_number.rain_cell_direction", direction)
        
        # Calculate bearing
        user_lat, user_lng = read_options_latlon()
        bearing = math.degrees(math.atan2(
            math.sin(math.radians(lng - user_lng)) * math.cos(math.radians(lat)),
            math.cos(math.radians(user_lat)) * math.sin(math.radians(lat)) -
            math.sin(math.radians(user_lat)) * math.cos(math.radians(lat)) * math.cos(math.radians(lng - user_lng))
        ))
        if bearing < 0:
            bearing += 360
        
        ha_api.call_service("input_number/set_value", "input_number.bearing_to_rain_cell", bearing)
        
        logging.info(f"Manual selection: lat={lat}, lng={lng}, distance={distance}km, speed={speed}km/h, direction={direction}°")
        
        return jsonify({
            "status": "success", 
            "message": "Manual selection updated",
            "lat": lat,
            "lng": lng,
            "distance": distance,
            "speed": speed,
            "direction": direction,
            "bearing": bearing
        })
    except Exception as e:
        logging.error(f"Error in manual selection: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/update_view_bounds", methods=["POST"])
def update_view_bounds():
    """Update view bounds for dynamic analysis area"""
    try:
        data = request.get_json(force=True) or {}
        bounds = data.get("bounds", {})
        center = data.get("center", {})
        zoom = data.get("zoom", 8)
        view_size = data.get("view_size_km", {})
        
        logging.info(f"View bounds update: center=({center.get('lat', 0):.4f}, {center.get('lng', 0):.4f}), zoom={zoom}")
        logging.info(f"View bounds update: size={view_size.get('width', 0):.1f}km x {view_size.get('height', 0):.1f}km")
        
        # Store view bounds in shared file for rain predictor to read
        try:
            view_data = {
                'bounds': bounds,
                'center': center,
                'zoom': zoom,
                'view_size_km': view_size,
                'timestamp': time.time()
            }
            
            with open('/tmp/view_bounds.json', 'w') as f:
                json.dump(view_data, f)
            
            logging.info("View bounds saved to shared file for rain predictor")
            
        except Exception as e:
            logging.error(f"Error saving view bounds: {e}", exc_info=True)
        
        return jsonify({"status": "success", "message": "View bounds updated"}), 200
        
    except Exception as e:
        logging.error(f"Error updating view bounds: {e}")
        return jsonify({"status": "error", "message": "Failed to update view bounds"}), 500

@app.route("/health")
def health_check():
    return "OK", 200

if __name__ == "__main__":
    # Port 8099 to match your addon setup
    app.run(host="0.0.0.0", port=8099, debug=False)