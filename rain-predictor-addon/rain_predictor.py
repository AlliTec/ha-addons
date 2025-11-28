#!/usr/bin/env python3
"""
Rain Predictor Home Assistant Addon - Debug Version
"""

import json
import time
import logging
import os
import sys
import requests
import numpy as np
from datetime import datetime, timedelta
from PIL import Image, ImageDraw
import io
from scipy.ndimage import label
import math
from math import radians, cos, sin, asin, sqrt, atan2, degrees
import signal

VERSION = "1.1.37"

class AddonConfig:
    """Load and manage addon configuration"""

    def __init__(self):
        self.data_path = os.environ.get("DATA_PATH", "/data")
        self.options_path = os.path.join(self.data_path, "options.json")
        self.config = self._load_config()
        self._validate_config()

    def _load_config(self):
        """Load configuration from addon options"""
        try:
            with open(self.options_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logging.warning(f"Configuration file not found at {self.options_path}, using defaults.")
            return {}
        except json.JSONDecodeError as e:
            logging.error(f"Invalid configuration JSON at {self.options_path}: {e}")
            return {}
    
    def _validate_config(self):
        """Validate required configuration options"""
        required = ['latitude', 'longitude', 'entities']
        for key in required:
            if key not in self.config:
                logging.warning(f"Missing required configuration: {key}")
        
        if 'time' not in self.config.get('entities', {}):
            logging.warning("Time entity must be configured")
    
    def get(self, key, default=None):
        """Get configuration value with dot notation support"""
        logging.debug(f"AddonConfig.get called with key: {key}, default: {default}")
        keys = key.split('.')
        value = self.config
        try:
            for k in keys:
                value = value[k]
            logging.debug(f"AddonConfig.get returning value for {key}: {value}")
            return value
        except (KeyError, TypeError):
            logging.debug(f"AddonConfig.get key not found for {key}. Returning default: {default}")
            return default

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

class RainCell:
    """Represents a tracked rain cell"""
    
    def __init__(self, cell_id, lat, lon, timestamp, intensity=0):
        self.id = cell_id
        self.positions = [(lat, lon, timestamp)]
        self.intensity = intensity
        self.last_seen = timestamp
    
    def add_position(self, lat, lon, timestamp, intensity=0):
        """Add a new position observation with validation"""
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            logging.warning(f"Invalid coordinates: ({lat}, {lon}) - skipping")
            return
        
        # Check for duplicate timestamps
        if self.positions and (timestamp - self.positions[-1][2]).total_seconds() < 60:
            logging.warning(f"Timestamp too close: {timestamp} vs {self.positions[-1][2]} - skipping")
            return
        
        self.positions.append((lat, lon, timestamp))
        self.last_seen = timestamp
        self.intensity = max(self.intensity, intensity)
        
        if len(self.positions) > 10:
            self.positions = self.positions[-10:]
        
        logging.debug(f"Added position to cell {self.id}: ({lat:.4f},{lon:.4f})@{timestamp}, track_len={len(self.positions)}")
    
    def get_velocity(self):
        """Calculate velocity from last two positions with enhanced accuracy"""
        if len(self.positions) < 2:
            return None, None
        
        (lat1, lon1, t1), (lat2, lon2, t2) = self.positions[-2:]
        
        time_diff = (t2 - t1).total_seconds() / 3600.0
        if time_diff <= 0:
            logging.warning(f"Invalid time difference: {time_diff:.4f}h for cell track")
            return None, None
        
        distance_km = self._haversine(lat1, lon1, lat2, lon2)
        bearing = self._calculate_bearing(lat1, lon1, lat2, lon2)
        speed_kph = distance_km / time_diff
        
        # Enhanced validation and debugging - temporarily disabled for debugging
        # if distance_km < 0.01:  # Less than 10m movement (reduced from 100m)
        #     logging.info(f"VELOCITY: Minimal movement ({distance_km:.3f}km), treating as stationary")
        #     return 0.0, bearing
        
        # Cap unrealistic speeds
        if speed_kph > 200:  # Cap at 200 KPH (hurricane speed)
            logging.warning(f"VELOCITY: Unrealistic speed {speed_kph:.1f}kph capped to 200kph")
            speed_kph = 200.0
        
        # Debug logging for velocity calculation
        logging.info(f"VELOCITY DEBUG: pos1=({lat1:.4f},{lon1:.4f})@{t1}, pos2=({lat2:.4f},{lon2:.4f})@{t2}")
        logging.info(f"VELOCITY DEBUG: time_diff={time_diff:.4f}h, distance={distance_km:.2f}km, speed={speed_kph:.1f}kph, bearing={bearing:.1f}°")
        
        return speed_kph, bearing
    
    def _haversine(self, lat1, lon1, lat2, lon2):
        """Calculate great-circle distance"""
        R = 6371
        lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad
        a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
        c = 2 * asin(sqrt(a))
        return R * c
    
    def _calculate_bearing(self, lat1, lon1, lat2, lon2):
        """Calculate bearing from point 1 to point 2"""
        lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2_rad - lon1_rad
        y = sin(dlon) * cos(lat2_rad)
        x = cos(lat1_rad) * sin(lat2_rad) - sin(lat1_rad) * cos(lat2_rad) * cos(dlon)
        bearing = atan2(y, x)
        return (degrees(bearing) + 360) % 360
    
    def _project_position(self, lat, lon, distance_km, bearing_deg):
        """Project new position given distance and bearing from current position"""
        lat_rad, lon_rad = radians(lat), radians(lon)
        bearing_rad = radians(bearing_deg)
        
        # Earth radius in km
        R = 6371.0
        
        # Calculate destination point
        lat2_rad = asin(sin(lat_rad) * cos(distance_km / R) + 
                        cos(lat_rad) * sin(distance_km / R) * cos(bearing_rad))
        lon2_rad = lon_rad + atan2(sin(bearing_rad) * sin(distance_km / R) * cos(lat_rad),
                                   cos(distance_km / R) - sin(lat_rad) * sin(lat2_rad))
        
        return degrees(lat2_rad), degrees(lon2_rad)

class RainPredictor:
    """Main rain prediction logic"""
    
    def __init__(self, config, ha_api):
        logging.info(f"Loaded config: {config}")
        self.config = config
        self.ha_api = ha_api
        self.running = False
        self.tracked_cells = {}
        self.next_cell_id = 1
        # Extract configuration values
        self.latitude = config.get('latitude', -24.98)
        self.longitude = config.get('longitude', 151.86)
        self.run_interval = config.get('run_interval_minutes', 3) * 60
        self.api_url = config.get('api_url', 'https://api.rainviewer.com/public/weather-maps.json')
        
        # Entity IDs
        self.entities = {
            'time': config.get('entities.time'),
            'distance': config.get('entities.distance'),
            'speed': config.get('entities.speed'),
            'direction': config.get('entities.direction'),
            'bearing': config.get('entities.bearing'),
            'rain_cell_latitude': config.get('entities.rain_cell_latitude'),
            'rain_cell_longitude': config.get('entities.rain_cell_longitude')
        }
        logging.debug(f"RainPredictor initialized with time entity: {self.entities['time']}")

        self._setup_logging()
        # Default values
        self.defaults = {
            'no_rain': config.get('defaults.no_rain_value', 999),
            'no_direction': config.get('defaults.no_direction_value', -1),
            'no_bearing': config.get('defaults.no_bearing_value', -1)
        }
        
        # Image settings
        self.image_size = config.get('image_settings.size', 256)
        self.image_zoom = config.get('image_settings.zoom', 8)
        self.image_color = config.get('image_settings.color_scheme', 3)
        self.image_opts = config.get('image_settings.options', '0_0')
        
        # Analysis settings
        self.threshold = config.get('analysis_settings.rain_threshold', 50)  # Lowered from 75 to detect lighter rain
        self.lat_range = config.get('analysis_settings.lat_range_deg', 5.0)
        self.lon_range = config.get('analysis_settings.lon_range_deg', 5.0)
        self.arrival_angle_threshold = config.get('analysis_settings.arrival_angle_threshold_deg', 90)  # Increased from 45° to be less restrictive

        # Debug settings
        self.debug_dir = config.get('debug.debug_dir', '/share/rain_predictor_debug')
        self.save_debug_images = config.get('debug.save_images', False)
        
        # Tracking settings
        self.max_track_dist = config.get('tracking_settings.max_tracking_distance_km', 150)  # Extended for long-range tracking
        self.min_track_len = config.get('tracking_settings.min_track_length', 3)  # Increased for more reliable tracking
        
        # View bounds for focused analysis
        self.view_bounds = None
        self.view_center = None
        

        
        logging.info(f"Rain Predictor {VERSION} initialized")
        self._log_config()
    
    def _setup_logging(self):
        """Setup logging based on configuration"""
        log_level = self.config.get('debug.log_level', 'INFO')
        level = getattr(logging, log_level.upper(), logging.INFO)
        
        logging.basicConfig(
            level=level,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[logging.StreamHandler(sys.stdout)]
        )
    
    def set_view_bounds(self, bounds, center, zoom, view_size_km):
        """Set current map view bounds for focused analysis"""
        self.view_bounds = bounds
        self.view_center = center
        self.view_zoom = zoom
        self.view_size_km = view_size_km
        logging.info(f"View bounds set: center=({center.get('lat', 0):.4f}, {center.get('lng', 0):.4f}), zoom={zoom}")
        logging.info(f"View bounds set: size={view_size_km.get('width', 0):.1f}km x {view_size_km.get('height', 0):.1f}km")
    
    def _load_view_bounds_from_file(self):
        """Load current view bounds from shared file"""
        try:
            with open('/tmp/view_bounds.json', 'r') as f:
                view_data = json.load(f)
            
            # Check if data is recent (within last 30 seconds)
            if time.time() - view_data.get('timestamp', 0) < 30:
                self.set_view_bounds(
                    view_data.get('bounds', {}),
                    view_data.get('center', {}),
                    view_data.get('zoom', 8),
                    view_data.get('view_size_km', {})
                )
                return True
            else:
                logging.debug("View bounds data is stale, ignoring")
                return False
                
        except FileNotFoundError:
            logging.debug("No view bounds file found")
            return False
        except Exception as e:
            logging.debug(f"Error loading view bounds: {e}")
            return False
    
    def _log_config(self):
        """Log current configuration"""
        logging.info("=" * 60)
        logging.info(f"Location: ({self.latitude}, {self.longitude})")
        logging.info(f"Run interval: {self.run_interval/60} minutes")
        logging.info(f"Time entity: {self.entities['time']}")
        logging.info(f"Image: Size={self.image_size}, Zoom={self.image_zoom}")
        logging.info(f"Threshold: {self.threshold}")
        logging.info(f"Lat/Lon Range: {self.lat_range}° x {self.lon_range}°")
        logging.info(f"Angle threshold: {self.arrival_angle_threshold}°")
        logging.info(f"Max track distance: {self.max_track_dist}km")
        logging.info(f"Min track length: {self.min_track_len}")
        logging.info(f"Save images: {self.save_debug_images}")
        logging.info("=" * 60)
    
    def haversine(self, lat1, lon1, lat2, lon2):
        """Calculate great-circle distance between two points"""
        R = 6371
        try:
            lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(radians, [lat1, lon1, lat2, lon2])
            dlon = lon2_rad - lon1_rad
            dlat = lat2_rad - lat1_rad
            a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
            c = 2 * asin(sqrt(a))
            return max(0, R * c)
        except ValueError as e:
            logging.error(f"Haversine error: {e}")
            return float('inf')
    
    def calculate_bearing(self, lat1, lon1, lat2, lon2):
        """Calculate initial bearing from point 1 to point 2"""
        try:
            lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(radians, [lat1, lon1, lat2, lon2])
            dlon = lon2_rad - lon1_rad
            y = sin(dlon) * cos(lat2_rad)
            x = cos(lat1_rad) * sin(lat2_rad) - sin(lat1_rad) * cos(lat2_rad) * cos(dlon)
            bearing = atan2(y, x)
            return (degrees(bearing) + 360) % 360
        except ValueError as e:
            logging.error(f"Bearing calculation error: {e}")
            return None
    
    def degrees_to_cardinal(self, degrees):
        """Convert degrees to cardinal direction"""
        if degrees is None or degrees < 0:
            return '--'
        
        normalized = ((float(degrees) % 360) + 360) % 360
        directions = [
            ('N', 348.75, 360), ('N', 0, 11.25),
            ('NNE', 11.25, 33.75), ('NE', 33.75, 56.25),
            ('ENE', 56.25, 78.75), ('E', 78.75, 101.25),
            ('ESE', 101.25, 123.75), ('SE', 123.75, 146.25),
            ('SSE', 146.25, 168.75), ('S', 168.75, 191.25),
            ('SSW', 191.25, 213.75), ('SW', 213.75, 236.25),
            ('WSW', 236.25, 258.75), ('W', 258.75, 281.25),
            ('WNW', 281.25, 303.75), ('NW', 303.75, 326.25),
            ('NNW', 326.25, 348.75)
        ]
        
        for name, min_deg, max_deg in directions:
            if min_deg <= normalized < max_deg:
                return name
        return 'N'
    
    def download_radar_image(self, image_url):
        """Download radar image from URL"""
        logging.debug(f"Downloading: {image_url}")
        try:
            response = requests.get(image_url, stream=True, timeout=15)
            response.raise_for_status()
            data = response.content
            
            if self.save_debug_images:
                self._save_debug_image(data, image_url)
            
            return data
        except requests.exceptions.RequestException as e:
            logging.error(f"Error downloading image: {e}")
            return None
    
    def _save_debug_image(self, data, url):
        """Save downloaded image for debugging with annotations"""
        if not self.save_debug_images:
            return

        try:
            os.makedirs(self.debug_dir, exist_ok=True)
            timestamp = int(time.time())

            # Save original
            filename = f"radar_{timestamp}.png"
            filepath = os.path.join(self.debug_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(data)

            # Create annotated version
            img = Image.open(io.BytesIO(data)).convert('RGB')
            draw = ImageDraw.Draw(img)

            # Draw center crosshair (your location)
            center_x = img.width // 2
            center_y = img.height // 2
            size = 10
            draw.line([(center_x - size, center_y), (center_x + size, center_y)], fill='red', width=3)
            draw.line([(center_x, center_y - size), (center_x, center_y + size)], fill='red', width=3)
            draw.ellipse([center_x-15, center_y-15, center_x+15, center_y+15], outline='red', width=2)

            annotated_path = os.path.join(self.debug_dir, f"annotated_{timestamp}.png")
            img.save(annotated_path)

            logging.debug(f"Debug images saved: {filepath}, {annotated_path}")
        except Exception as e:
            logging.error(f"Error saving debug image: {e}")
    
    def analyze_radar_data(self, past_frames, api_data):
        """Analyze radar data and predict rain arrival"""
        logging.info("=" * 60)
        logging.info(f"ANALYZING {len(past_frames)} FRAMES")
        logging.info("=" * 60)
        
        # Load current view bounds for focused analysis
        self._load_view_bounds_from_file()
        
        prediction = {
            'time_to_rain': None,
            'speed_kph': None,
            'distance_km': None,
            'direction_deg': None,
            'bearing_to_cell_deg': None
        }
        
        if not past_frames:
            logging.warning("❌ No frames to analyze")
            return prediction
            
        if len(past_frames) < 2:
            logging.warning(f"❌ Only {len(past_frames)} frame(s) - need at least 2 for tracking")
            return prediction
        
        # Check if rain is currently at location
        latest_frame = sorted(past_frames, key=lambda f: f.get('time', 0))[-1]
        if self._check_current_rain(latest_frame, api_data):
            logging.info("🌧️  RAIN DETECTED AT CURRENT LOCATION!")
            return {
                'time_to_rain': 0,
                'speed_kph': 0,
                'distance_km': 0,
                'direction_deg': self.defaults['no_direction'],
                'bearing_to_cell_deg': self.defaults['no_bearing']
            }
        
        # Process all frames and track cells
        try:
            sorted_frames = sorted(past_frames, key=lambda f: f.get('time', 0))
            logging.info(f"Processing frames from {datetime.fromtimestamp(sorted_frames[0]['time'])} to {datetime.fromtimestamp(sorted_frames[-1]['time'])}")
            
            total_cells_detected = 0
            for i, frame in enumerate(sorted_frames):
                frame_time = datetime.fromtimestamp(frame['time'])
                logging.info(f"\n--- Frame {i+1}/{len(sorted_frames)} at {frame_time} ---")
                
                cells = self._extract_cells_from_frame(frame, api_data)
                logging.info(f"Found {len(cells)} cell(s) in frame at {frame_time}")
                
                if cells:
                    total_cells_detected += len(cells)
                    # Use view center if available, otherwise user location
                    center_lat = self.view_center.get('lat') if self.view_center else self.latitude
                    center_lon = self.view_center.get('lng') if self.view_center else self.longitude
                    
                    for j, cell in enumerate(cells):
                        dist = self.haversine(center_lat, center_lon, cell['lat'], cell['lon'])
                        bearing = self.calculate_bearing(center_lat, center_lon, cell['lat'], cell['lon'])
                        logging.info(f"  Cell {j+1}: lat={cell['lat']:.4f}, lon={cell['lon']:.4f}, "
                                   f"intensity={cell['intensity']:.1f}, size={cell['size']}, "
                                   f"dist={dist:.1f}km, bearing={bearing:.1f}°")
                    
                    self._update_tracked_cells(cells, frame_time)
            
            logging.info(f"\n📊 SUMMARY: Detected {total_cells_detected} total cells across all frames")
            logging.info(f"Currently tracking {len(self.tracked_cells)} cell(s)")
            
            # Show tracking details
            for cell_id, cell in self.tracked_cells.items():
                logging.info(f"\nTracked Cell #{cell_id}:")
                logging.info(f"  Positions: {len(cell.positions)}")
                logging.info(f"  Intensity: {cell.intensity:.1f}")
                speed, direction = cell.get_velocity()
                if speed and direction:
                    logging.info(f"  Velocity: {speed:.1f} km/h at {direction:.1f}°")
                else:
                    logging.info(f"  Velocity: Not enough data yet")
            
            # Find threatening cell
            threat = self._find_threatening_cell()
            
            if threat:
                logging.info(f"\n⚠️  THREAT DETECTED: {threat}")
                prediction.update(threat)
            else:
                logging.info("\n✅ No threatening cells detected")
        
        except Exception as e:
            logging.error(f"❌ Error in radar analysis: {e}", exc_info=True)
        
        return prediction
    
    def _check_current_rain(self, frame, api_data):
        """Check if rain is currently at location"""
        return False
    
    def _extract_cells_from_frame(self, frame, api_data):
        """Extract rain cells from radar frame with enhanced tracking"""
        try:
            # Construct radar frame URL from API data (correct format with color parameter)
            host = api_data.get('host', 'https://tilecache.rainviewer.com').replace('https://', '')
            timestamp = api_data['radar']['past'][0]['time']
            img_url = f"https://{host}/v2/radar/{timestamp}/256/0/0/0/2/1_1.png"
            logging.info(f"Downloading frame: {img_url}")
            
            response = requests.get(img_url)
            img = Image.open(io.BytesIO(response.content))
            
            # Convert to grayscale and threshold
            img_gray = img.convert('L')
            img_array = np.array(img_gray)
            
            # Apply threshold to identify rain areas
            thresholded = (img_array > self.threshold).astype(np.uint8) * 255
            
            # Find connected components (rain cells)
            labeled_image, num_labels = label(thresholded)
            
            logging.debug(f"Found {num_labels} connected components")
            
            cells = []
            img_height, img_width = img_array.shape
            
            # Use dynamic analysis area based on user view or fallback to configured range
            if hasattr(self, 'view_size_km') and self.view_size_km:
                # Calculate lat/lon ranges based on view size
                view_width_km = self.view_size_km.get('width', 100)
                view_height_km = self.view_size_km.get('height', 100)
                lat_range = view_height_km / 111.0  # ~111km per degree latitude
                lon_range = view_width_km / (111.0 * math.cos(math.radians(self.latitude)))
                logging.info(f"Using view-based analysis: {view_width_km:.1f}km x {view_height_km:.1f}km ({lat_range:.3f}° x {lon_range:.3f}°)")
            else:
                # Fallback to configured analysis range
                lat_range = self.lat_range
                lon_range = self.lon_range
                logging.info(f"Using configured analysis range: {lat_range:.1f}° x {lon_range:.1f}°")
            
            lat_inc = lat_range / img_height
            lon_inc = lon_range / img_width
            center_y = (img_height - 1) / 2.0
            center_x = (img_width - 1) / 2.0
            
            for i in range(1, num_labels + 1):
                y_coords, x_coords = np.where(labeled_image == i)
                cell_size = len(y_coords)
                
                if cell_size < 5:
                    logging.debug(f"  Component {i}: size {cell_size} too small, skipping")
                    continue
                
                centroid_x, centroid_y = np.mean(x_coords), np.mean(y_coords)
                lat_offset = (center_y - centroid_y) * lat_inc
                lon_offset = (centroid_x - center_x) * lon_inc
                
                # Use dynamic center based on user view or fallback to configured location
                if hasattr(self, 'view_center') and self.view_center:
                    center_lat = self.view_center.get('lat', self.latitude)
                    center_lon = self.view_center.get('lng', self.longitude)
                else:
                    center_lat = self.latitude
                    center_lon = self.longitude
                
                est_lat = np.clip(center_lat + lat_offset, -90, 90)
                est_lon = np.clip(center_lon + lon_offset, -180, 180)
                
                intensity = np.mean(img_array[y_coords, x_coords])
                
                cells.append({
                    'lat': est_lat,
                    'lon': est_lon,
                    'intensity': intensity,
                    'size': cell_size
                })
                
                logging.debug(f"  Component {i}: size={cell_size}, intensity={intensity:.1f}, "
                            f"centroid=({centroid_x:.1f},{centroid_y:.1f}), "
                            f"location=({est_lat:.4f},{est_lon:.4f})")
            
            return cells
            
        except Exception as e:
            logging.error(f"Error extracting cells: {e}", exc_info=True)
            return []
    
    def _update_tracked_cells(self, detected_cells, timestamp):
        """Update tracked cells with enhanced matching algorithm for extreme accuracy"""
        unmatched_cells = detected_cells.copy()
        matched_count = 0
        
        for cell_id, tracked_cell in list(self.tracked_cells.items()):
            if not tracked_cell.positions:
                continue
            
            last_lat, last_lon, _ = tracked_cell.positions[-1]
            
            # Enhanced prediction with multiple factors
            predicted_lat, predicted_lon = last_lat, last_lon
            confidence_score = 1.0
            
            if len(tracked_cell.positions) >= 2:
                speed_kph, direction_deg = tracked_cell.get_velocity()
                if speed_kph and direction_deg is not None:
                    # Predict movement over 5 minute interval (RainViewer frame interval)
                    time_hours = 5.0 / 60.0  # 5 minutes in hours
                    predicted_distance = speed_kph * time_hours
                    
                    # Add acceleration/deceleration consideration
                    if len(tracked_cell.positions) >= 3:
                        # Calculate recent speed trend
                        recent_speeds = []
                        for i in range(len(tracked_cell.positions) - 2, len(tracked_cell.positions)):
                            if i > 0:
                                pos1 = tracked_cell.positions[i-1]
                                pos2 = tracked_cell.positions[i]
                                time_diff = (pos2[2] - pos1[2]).total_seconds() / 3600.0
                                if time_diff > 0:
                                    dist = self.haversine(pos1[0], pos1[1], pos2[0], pos2[1])
                                    recent_speeds.append(dist / time_diff)
                        
                        if recent_speeds:
                            avg_speed = sum(recent_speeds) / len(recent_speeds)
                            speed_trend = (speed_kph - avg_speed) / avg_speed if avg_speed > 0 else 0
                            # Adjust predicted distance based on trend
                            predicted_distance *= (1.0 + speed_trend * 0.3)
                            confidence_score *= 0.9 if abs(speed_trend) > 0.2 else 1.0
                    
                    predicted_lat, predicted_lon = tracked_cell._project_position(
                        last_lat, last_lon, predicted_distance, direction_deg
                    )
                    logging.debug(f"Track #{cell_id}: enhanced prediction {predicted_distance:.1f}km @ {direction_deg:.1f}° (confidence: {confidence_score:.2f})")
            
            best_cell = None
            best_score = float('inf')
            best_match_details = {}
            
            for cell in unmatched_cells:
                # Distance from last known position
                dist_from_last = self.haversine(last_lat, last_lon, cell['lat'], cell['lon'])
                
                # Use dynamic tracking distance based on view size or fallback to configured max
                if hasattr(self, 'view_size_km') and self.view_size_km:
                    # Calculate dynamic tracking distance based on view size (1.5x view diagonal)
                    view_width = self.view_size_km.get('width', 100)
                    view_height = self.view_size_km.get('height', 100)
                    view_diagonal = math.sqrt(view_width**2 + view_height**2)
                    dynamic_max_dist = max(view_diagonal * 1.5, self.max_track_dist * 0.5)  # At least 50% of configured
                else:
                    dynamic_max_dist = self.max_track_dist
                
                # Skip if too far from last known position
                if dist_from_last > dynamic_max_dist:
                    continue
                
                # Multiple scoring factors
                score_factors = {
                    'distance': 0,
                    'prediction': 0,
                    'movement': 0,
                    'intensity': 0,
                    'size': 0
                }
                
                # Factor 1: Distance from last position (primary)
                score_factors['distance'] = dist_from_last
                
                # Factor 2: Directional consistency (if we have velocity)
                if len(tracked_cell.positions) >= 2:
                    dist_from_predicted = self.haversine(predicted_lat, predicted_lon, cell['lat'], cell['lon'])
                    score_factors['prediction'] = dist_from_predicted * 0.7  # Weight prediction accuracy
                    
                    # Factor 3: Movement consistency
                    expected_distance = self.haversine(last_lat, last_lon, predicted_lat, predicted_lon)
                    actual_distance = dist_from_last
                    if expected_distance > 0:
                        movement_consistency = abs(expected_distance - actual_distance) / expected_distance
                        score_factors['movement'] = movement_consistency * 2.0  # Penalize inconsistent movement
                
                # Factor 4: Intensity consistency
                if tracked_cell.intensity > 0:
                    intensity_diff = abs(tracked_cell.intensity - cell.get('intensity', 0))
                    score_factors['intensity'] = intensity_diff * 0.1
                else:
                    score_factors['intensity'] = 0
                
                # Factor 5: Size consistency
                if hasattr(tracked_cell, 'last_size') and tracked_cell.last_size:
                    size_diff = abs(tracked_cell.last_size - cell.get('size', 0))
                    score_factors['size'] = size_diff * 0.01
                else:
                    score_factors['size'] = 0
                
                # Calculate weighted total score
                total_score = (
                    score_factors['distance'] * 1.0 +
                    score_factors['prediction'] +
                    score_factors['movement'] +
                    score_factors['intensity'] +
                    score_factors['size']
                ) * confidence_score
                
                # Apply confidence weighting
                if confidence_score < 0.8:
                    total_score *= 1.2  # Penalty for low confidence predictions
                
                if total_score < best_score:
                    best_score = total_score
                    best_cell = cell
                    best_match_details = {
                        'factors': score_factors,
                        'confidence': confidence_score,
                        'total_score': total_score
                    }
            
            if best_cell:
                tracked_cell.add_position(
                    best_cell['lat'],
                    best_cell['lon'],
                    timestamp,
                    best_cell.get('intensity', 0)
                )
                # Store size for consistency checking
                tracked_cell.last_size = best_cell.get('size', 0)
                
                unmatched_cells.remove(best_cell)
                matched_count += 1
                actual_dist = self.haversine(last_lat, last_lon, best_cell['lat'], best_cell['lon'])
                
                logging.info(f"✅ Track #{cell_id}: ENHANCED MATCH")
                logging.info(f"   Movement: {actual_dist:.1f}km (score: {best_score:.2f}, confidence: {confidence_score:.2f})")
                logging.info(f"   Factors: dist={best_match_details['factors']['distance']:.2f}, "
                           f"pred={best_match_details['factors']['prediction']:.2f}, "
                           f"move={best_match_details['factors']['movement']:.2f}")
            else:
                logging.debug(f"❌ Track #{cell_id}: no suitable match found")
        
        # Enhanced new track creation with quality filtering
        high_quality_cells = []
        for cell in unmatched_cells:
            # Quality criteria for new tracks
            intensity = cell.get('intensity', 0)
            size = cell.get('size', 0)
            
            # Only create tracks for significant rain cells
            if intensity >= self.threshold * 0.8 and size >= 3:
                high_quality_cells.append(cell)
            else:
                logging.debug(f"Skipping low-quality cell: intensity={intensity:.1f}, size={size}")
        
        for cell in high_quality_cells:
            new_track = RainCell(
                self.next_cell_id,
                cell['lat'],
                cell['lon'],
                timestamp,
                cell.get('intensity', 0)
            )
            new_track.last_size = cell.get('size', 0)
            self.tracked_cells[self.next_cell_id] = new_track
            logging.info(f"➕ Created HIGH-QUALITY track ID {self.next_cell_id} "
                        f"(intensity: {cell.get('intensity', 0):.1f}, size: {cell.get('size', 0)})")
            self.next_cell_id += 1
        
        # Enhanced cleanup with performance-based retention
        current_time = timestamp
        removed_count = 0
        for cell_id in list(self.tracked_cells.keys()):
            track = self.tracked_cells[cell_id]
            age = (current_time - track.last_seen).total_seconds() / 60.0
            
            # Keep high-performing tracks longer
            base_retention = 30  # minutes
            if len(track.positions) >= 3:
                speed, direction = track.get_velocity()
                if speed and speed > 5:  # Keep fast-moving cells longer
                    base_retention = 45
                if track.intensity > self.threshold * 1.5:  # Keep intense cells longer
                    base_retention = 60
            
            if age > base_retention:
                del self.tracked_cells[cell_id]
                logging.debug(f"Removed track ID {cell_id} (age: {age:.1f}min > {base_retention}min)")
                removed_count += 1
        
        total_matches = matched_count + len(high_quality_cells)
        logging.info(f"🎯 ENHANCED TRACKING: {matched_count} matched, {len(high_quality_cells)} new high-quality, {removed_count} removed")
        logging.info(f"📊 Track quality: {total_matches}/{len(detected_cells)} cells tracked ({(total_matches/len(detected_cells)*100):.1f}% coverage)")
    
    def _validate_api_response(self, api_data):
        """Validate that API response has required structure"""
        try:
            if not isinstance(api_data, dict):
                logging.error("API response is not a dictionary")
                return False

            if 'radar' not in api_data:
                logging.error("API response missing 'radar' key")
                return False

            radar_data = api_data['radar']
            if not isinstance(radar_data, dict):
                logging.error("'radar' data is not a dictionary")
                return False

            if 'past' not in radar_data:
                logging.error("'radar' data missing 'past' key")
                return False

            past_frames = radar_data['past']
            if not isinstance(past_frames, list) or len(past_frames) == 0:
                logging.warning("No past radar frames available")
                return False

            # Check that frames have required fields
            for frame in past_frames[:1]:  # Just check the first frame
                if not isinstance(frame, dict):
                    logging.error("Frame data is not a dictionary")
                    return False
                if 'path' not in frame:
                    logging.error("Frame missing 'path' field")
                    return False

            return True

        except Exception as e:
            logging.error(f"Error validating API response: {e}")
            return False

    def _update_entities(self, values):
        """Update Home Assistant entities with prediction values"""
        logging.info(f"Entities time value in _update_entities: {self.entities['time']}")
        if not self.entities['time']:
            logging.warning("No time entity configured, skipping entity updates")
            return

        try:
            # Update time to rain
            if self.entities['time']:
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['time'], values['time'])

            # Update distance
            if self.entities.get('distance'):
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['distance'], values['distance'])

            # Update speed
            if self.entities.get('speed'):
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['speed'], values['speed'])

            # Update direction
            if self.entities.get('direction'):
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['direction'], values['direction'])

            # Update bearing
            if self.entities.get('bearing'):
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['bearing'], values['bearing'])

            # Update rain cell latitude
            if self.entities.get('rain_cell_latitude'):
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['rain_cell_latitude'], values['rain_cell_latitude'])

            # Update rain cell longitude
            if self.entities.get('rain_cell_longitude'):
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['rain_cell_longitude'], values['rain_cell_longitude'])

            logging.info("Successfully updated Home Assistant entities")

        except Exception as e:
            logging.error(f"Error updating entities: {e}")

    def _find_threatening_cell(self):
        """Comprehensive analysis of ALL rain cells to find most likely threat"""
        logging.info(f"\n🌧️ COMPREHENSIVE RAIN ANALYSIS - Evaluating {len(self.tracked_cells)} tracked cells")
        logging.info(f"🔍 Analysis settings: threshold={self.threshold}, angle_threshold={self.arrival_angle_threshold}°, max_dist={self.max_track_dist}km")
        
        # Collect all valid rain cells with their threat potential
        valid_cells = []
        all_directions = []
        all_speeds = []
        
        for cell_id, cell in self.tracked_cells.items():
            logging.info(f"\n  Cell #{cell_id}:")
            logging.info(f"    Track length: {len(cell.positions)} position(s)")
            
            if len(cell.positions) < self.min_track_len:
                logging.info(f"    ❌ Track too short (need {self.min_track_len})")
                continue
            
            # Get both initial detection position and current position
            initial_lat, initial_lon, _ = cell.positions[0]  # First detection position
            current_lat, current_lon, _ = cell.positions[-1]  # Current position
            speed_kph, direction_deg = cell.get_velocity()
            
            # NEW: Handle cells with no velocity data using weather pattern assumptions
            if speed_kph is None or direction_deg is None or speed_kph < 1:
                logging.info(f"    ⚠️ No reliable velocity data ({speed_kph if speed_kph else 'None'} km/h)")
                
                # Use west-to-east weather pattern assumption (common for many regions)
                assumed_speed_kph = 25.0  # Typical rain cell movement speed
                assumed_direction_deg = 270.0  # West to east (270°)
                
                # Check if cell is positioned to intercept with west-to-east movement
                bearing_from_user = self.calculate_bearing(self.latitude, self.longitude, current_lat, current_lon)
                
                # For west-to-east movement, cell should be WEST of user (bearing 225-315°)
                # But more specifically: should be in western quadrant (240-300°) for eastward movement to reach user
                if bearing_from_user is not None:
                    is_west_of_user = 240 <= bearing_from_user <= 300  # Tighter range: WSW to WNW
                    
                    if is_west_of_user:
                        logging.info(f"    ✅ Using assumed west-to-east pattern: {assumed_speed_kph:.1f} km/h @ {assumed_direction_deg:.1f}°")
                        logging.info(f"       Cell is west of user (bearing {bearing_from_user:.1f}°) - could intercept")
                        speed_kph = assumed_speed_kph
                        direction_deg = assumed_direction_deg
                    else:
                        logging.info(f"    ❌ Cell not positioned for west-to-east intercept (bearing {bearing_from_user:.1f}°)")
                        continue
                else:
                    logging.info(f"    ❌ Cannot calculate bearing to user")
                    continue
            else:
                logging.info(f"    ✅ Using measured velocity: {speed_kph:.1f} km/h @ {direction_deg:.1f}°")
            
            # Calculate threat metrics from current position (for accurate ETA)
            distance_km = self.haversine(current_lat, current_lon, self.latitude, self.longitude)
            bearing_to_location = self.calculate_bearing(current_lat, current_lon, self.latitude, self.longitude)
            bearing_from_user_to_cell = self.calculate_bearing(self.latitude, self.longitude, current_lat, current_lon)
            
            if bearing_to_location is None or bearing_from_user_to_cell is None:
                logging.info(f"    ❌ Cannot calculate bearing")
                continue
            
            angle_diff = abs((direction_deg - bearing_to_location + 180) % 360 - 180)
            
            # Calculate probability of rain reaching location (0-100%)
            threat_probability = self._calculate_threat_probability(
                distance_km, speed_kph, angle_diff, cell.intensity, len(cell.positions)
            )
            
            logging.info(f"    Distance: {distance_km:.1f}km")
            logging.info(f"    Speed: {speed_kph:.1f}km/h")
            logging.info(f"    Moving: {direction_deg:.1f}°")
            logging.info(f"    Bearing to location: {bearing_to_location:.1f}°")
            logging.info(f"    Angle difference: {angle_diff:.1f}°")
            logging.info(f"    Threat probability: {threat_probability:.1f}%")
            
            # Collect for overall analysis
            valid_cells.append({
                'cell_id': cell_id,
                'cell': cell,
                'lat': current_lat,  # Current position for distance/ETA calculations
                'lon': current_lon,  # Current position for distance/ETA calculations
                'initial_lat': initial_lat,  # Initial detection position for green marker
                'initial_lon': initial_lon,  # Initial detection position for green marker
                'speed': speed_kph,
                'direction': direction_deg,
                'distance': distance_km,
                'bearing_to_location': bearing_to_location,
                'bearing_from_user': bearing_from_user_to_cell,
                'angle_diff': angle_diff,
                'threat_probability': threat_probability,
                'intensity': cell.intensity
            })
            
            all_directions.append(direction_deg)
            all_speeds.append(speed_kph)
        
        # If no valid cells, return None (no tracking marker)
        if not valid_cells:
            logging.info("\n✅ NO VALID RAIN CELLS - No tracking marker needed")
            return None
        
        # Calculate overall rain system patterns
        if all_directions:
            # Calculate circular mean for directional data
            x = sum(math.cos(math.radians(d)) for d in all_directions)
            y = sum(math.sin(math.radians(d)) for d in all_directions)
            avg_direction = math.degrees(math.atan2(y, x))
            if avg_direction < 0:
                avg_direction += 360
        else:
            avg_direction = 0
            
        avg_speed = sum(all_speeds) / len(all_speeds) if all_speeds else 0
        
        logging.info(f"\n📊 RAIN SYSTEM ANALYSIS:")
        logging.info(f"    General movement direction: {avg_direction:.1f}° ({self.degrees_to_cardinal(avg_direction)})")
        logging.info(f"    Average speed: {avg_speed:.1f} km/h")
        logging.info(f"    Valid cells: {len(valid_cells)}")
        
        # Filter cells based on movement toward user location
        filtered_cells = []
        
        for cell_data in valid_cells:
            # Primary check: cell should be positioned such that its movement
            # could plausibly reach the user location
            user_relative_bearing = cell_data['bearing_from_user']
            movement_to_user_diff = abs((cell_data['direction'] - user_relative_bearing + 180) % 360 - 180)
            
            # Cell passes if its movement is generally toward the user location
            # This is the most important filter - cells moving away are not threats
            passes_direction_filter = movement_to_user_diff <= 90  # Within 90° of user direction
            
            if passes_direction_filter:
                cell_data['movement_to_user'] = movement_to_user_diff
                filtered_cells.append(cell_data)
                logging.info(f"    ✅ Cell #{cell_data['cell_id']}: PASSED filter")
                logging.info(f"       Movement to user: {movement_to_user_diff:.1f}° (≤90°)")
                logging.info(f"       Cell moving {self.degrees_to_cardinal(cell_data['direction'])} "
                           f"toward user location")
            else:
                logging.info(f"    ❌ Cell #{cell_data['cell_id']}: FILTERED OUT")
                logging.info(f"       Movement to user: {movement_to_user_diff:.1f}° (> 90°)")
                logging.info(f"       Cell moving {self.degrees_to_cardinal(cell_data['direction'])} "
                           f"away from user location")
        
        # Use filtered cells for threat analysis
        # Only consider cells that are actually moving toward user location
        analysis_cells = filtered_cells if filtered_cells else []
        
        if not analysis_cells:
            logging.info("\n✅ NO CELLS PASS DIRECTIONAL FILTER - No tracking marker needed")
            logging.info("   All detected rain cells are moving away from user location")
            return None
        
        logging.info(f"\n🎯 ANALYZING {len(analysis_cells)} FILTERED CELLS:")
        
        # Log all cells with their distances for debugging
        if len(analysis_cells) > 1:
            logging.info("    All cells being considered:")
            for cell_data in analysis_cells:
                logging.info(f"        Cell #{cell_data['cell_id']}: {cell_data['distance']:.1f}km, "
                           f"moving {self.degrees_to_cardinal(cell_data['direction'])}, "
                           f"score: {cell_data.get('threat_probability', 0):.1f}%")
        
        # Find most likely threat based on multiple factors
        best_cell = None
        best_score = 0
        
        for cell_data in analysis_cells:
            # Multi-factor scoring for most likely threat
            score = 0
            
            # Factor 1: Threat probability (40% weight)
            score += cell_data['threat_probability'] * 0.4
            
            # Factor 2: Proximity (25% weight) - closer is more threatening
            proximity_score = max(0, 100 - (cell_data['distance'] / 2))  # 100% at 0km, 0% at 200km
            score += proximity_score * 0.25
            
            # Factor 3: Speed (20% weight) - faster is more imminent
            speed_score = min(100, cell_data['speed'] * 2)  # 100% at 50 km/h
            score += speed_score * 0.2
            
            # Factor 4: Intensity (15% weight) - more intense is more threatening
            intensity_score = min(100, (cell_data['intensity'] / self.threshold) * 100)
            score += intensity_score * 0.15
            
            logging.info(f"    Cell #{cell_data['cell_id']}: Score={score:.1f} "
                        f"(prob={cell_data['threat_probability']:.1f}, "
                        f"prox={proximity_score:.1f}, "
                        f"speed={speed_score:.1f}, "
                        f"int={intensity_score:.1f})")
            
            if score > best_score:
                best_score = score
                best_cell = cell_data
        
        if best_cell:
            time_to_arrival_hours = best_cell['distance'] / best_cell['speed']
            time_to_arrival_minutes = time_to_arrival_hours * 60
            
            logging.info(f"\n⚠️ MOST LIKELY THREAT: Cell #{best_cell['cell_id']}")
            logging.info(f"    Overall score: {best_score:.1f}")
            logging.info(f"    ETA: {time_to_arrival_minutes:.0f} minutes")
            logging.info(f"    Distance: {best_cell['distance']:.1f} km")
            logging.info(f"    Speed: {best_cell['speed']:.1f} km/h")
            logging.info(f"    Direction: {best_cell['direction']:.1f}°")
            logging.info(f"    Position: {best_cell['lat']:.4f}, {best_cell['lon']:.4f}")
            logging.info(f"    Bearing to user: {best_cell['bearing_from_user']:.1f}°")
            logging.info(f"    Moving toward user: {best_cell.get('movement_to_user', 'N/A')}°")
            
            return {
                'time_to_rain': round(time_to_arrival_minutes),
                'distance_km': round(best_cell['distance'], 1),
                'speed_kph': round(best_cell['speed'], 1),
                'direction_deg': round(best_cell['direction'], 1),
                'bearing_to_cell_deg': round(best_cell['bearing_from_user'], 1),
                'rain_cell_latitude': round(best_cell['lat'], 4),  # Current position for green marker (matches distance calculation)
                'rain_cell_longitude': round(best_cell['lon'], 4),  # Current position for green marker (matches distance calculation)
                'threat_probability': round(best_cell['threat_probability'], 1),
                'system_avg_direction': round(avg_direction, 1),
                'system_avg_speed': round(avg_speed, 1)
            }
        
        logging.info("\n✅ NO THREATENING CELLS FOUND")
        return None
    
    def _calculate_threat_probability(self, distance_km, speed_kph, angle_diff, intensity, track_length):
        """Calculate probability (0-100%) of rain reaching location"""
        probability = 0
        
        # Distance factor (0-40%): closer is more threatening
        if distance_km <= 10:
            probability += 40
        elif distance_km <= 25:
            probability += 30
        elif distance_km <= 50:
            probability += 20
        elif distance_km <= 100:
            probability += 10
        
        # Speed factor (0-25%): faster is more threatening
        if speed_kph >= 30:
            probability += 25
        elif speed_kph >= 15:
            probability += 20
        elif speed_kph >= 5:
            probability += 15
        elif speed_kph >= 1:
            probability += 10
        
        # Direction factor (0-25%): must be moving toward location
        if angle_diff <= 30:
            probability += 25
        elif angle_diff <= 60:
            probability += 20
        elif angle_diff <= 90:
            probability += 15
        elif angle_diff <= 120:
            probability += 10
        elif angle_diff <= 150:
            probability += 5
        
        # Intensity factor (0-10%): more intense is more threatening
        intensity_ratio = intensity / self.threshold if self.threshold > 0 else 0
        probability += min(10, intensity_ratio * 10)
        
        return min(100, probability)
    
    def run_prediction(self):
        """Run a single prediction cycle"""
        logging.info("\n\n" + "=" * 60)
        logging.info(f"PREDICTION CYCLE STARTING - {datetime.now()}")
        logging.info("=" * 60)
        
        values = {
            'time': self.defaults['no_rain'],
            'distance': self.defaults['no_rain'],
            'speed': 0.0,
            'direction': self.defaults['no_direction'],
            'bearing': self.defaults['no_bearing'],
            'rain_cell_latitude': None,
            'rain_cell_longitude': None
        }
        
        try:
            logging.info(f"Fetching API data from: {self.api_url}")
            logging.info("Making request...")
            response = requests.get(self.api_url, timeout=10)
            logging.info(f"Request finished. Status code: {response.status_code}")
            response.raise_for_status()
            api_data = response.json()
            logging.info("Successfully fetched and parsed API data.")
            
            logging.info(f"API response received. Host: {api_data.get('host', 'unknown')}")
            
            if not self._validate_api_response(api_data):
                logging.error("❌ Invalid API response")
            else:
                past_frames = api_data['radar'].get('past', [])
                logging.info(f"Found {len(past_frames)} past frames")
                
                if past_frames:
                    prediction = self.analyze_radar_data(past_frames, api_data)
                    
                    if prediction.get('time_to_rain') is not None:
                        values['time'] = max(0, round(prediction['time_to_rain']))
                    if prediction.get('distance_km') is not None:
                        values['distance'] = max(0, round(prediction['distance_km'], 1))
                    if prediction.get('speed_kph') is not None:
                        values['speed'] = max(0, round(prediction['speed_kph'], 1))
                    if prediction.get('direction_deg') is not None:
                        values['direction'] = round(prediction['direction_deg'], 1)
                    if prediction.get('bearing_to_cell_deg') is not None:
                        values['bearing'] = round(prediction['bearing_to_cell_deg'], 1)
                    if prediction.get('rain_cell_latitude') is not None:
                        values['rain_cell_latitude'] = prediction['rain_cell_latitude']
                    if prediction.get('rain_cell_longitude') is not None:
                        values['rain_cell_longitude'] = prediction['rain_cell_longitude']
                else:
                    logging.warning("❌ No past radar frames available")
        
        except Exception as e:
            logging.error(f"❌ Error in prediction cycle: {e}", exc_info=True)
        
        self._update_entities(values)
        
        logging.info("\n" + "=" * 60)
        logging.info(f"FINAL VALUES TO BE SENT:")
        logging.info(f"  Time to rain: {values['time']} minutes")
        logging.info(f"  Distance: {values['distance']} km")
        logging.info(f"  Speed: {values['speed']} km/h")
        logging.info(f"  Direction: {values['direction']}°")
        logging.info(f"  Bearing: {values['bearing']}°")
        logging.info("=" * 60 + "\n")

    def run(self):
        """Main execution loop"""
        logging.info("Starting Rain Predictor main loop")
        self.running = True

        # Initial prediction
        self.run_prediction()

        try:
            while self.running:
                # Wait for next interval
                time.sleep(self.run_interval)

                # Run prediction cycle
                self.run_prediction()

        except KeyboardInterrupt:
            logging.info("Received interrupt signal, shutting down...")
        except Exception as e:
            logging.error(f"Unexpected error in main loop: {e}", exc_info=True)
        finally:
            self.running = False
            logging.info("Rain Predictor stopped")


def main():
    """Main entry point"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    try:
        # Load configuration
        config = AddonConfig()

        # Create Home Assistant API client
        ha_api = HomeAssistantAPI()

        # Create and start rain predictor
        predictor = RainPredictor(config, ha_api)
        predictor.run()

    except Exception as e:
        logging.error(f"Failed to start Rain Predictor: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()