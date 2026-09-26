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
from scipy import ndimage
import math
from math import radians, cos, sin, asin, sqrt, atan2, degrees
import signal

VERSION = "1.1.74"

# RainViewer only serves radar tiles up to this zoom level (higher zooms return a placeholder image)
MAX_RADAR_ZOOM = 7

# Fastest a rain cell is assumed to travel when matching it between radar frames
MAX_CELL_SPEED_KPH = 100

# How far outside a cell's radius its predicted path may pass the user and still count as reaching them
INTERCEPT_MARGIN_KM = 5.0

# A cell's heading is only known to a few degrees, which is a bigger sideways error the farther away it is
INTERCEPT_HEADING_TOLERANCE_DEG = 5.0

# Radar pattern motion: the area around the user used to measure how the whole pattern moves, the slowest
# motion treated as real, how far ahead to look for rain, and how far from its expected position an echo can
# be and still count as the same cell in an earlier frame
FLOW_WINDOW_KM = 220.0
FLOW_MIN_SPEED_KPH = 3.0
FLOW_MAX_HORIZON_MIN = 180
FLOW_TRACK_MATCH_KM = 15.0

# Rain counts as having arrived once the edge of an echo is this close to the location
FLOW_ARRIVAL_EDGE_KM = 3.0

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
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            logging.warning(f"Invalid coordinates: ({lat}, {lon}) - skipping")
            return

        if self.positions:
            last_timestamp = self.positions[-1][2]
            time_diff = (timestamp - last_timestamp).total_seconds()
            if time_diff < 0.001:
                return

        self.positions.append((lat, lon, timestamp))
        self.last_seen = timestamp
        self.intensity = max(self.intensity, intensity)
        
        if len(self.positions) > 10:
            self.positions = self.positions[-10:]
        
        logging.debug(f"Added position to cell {self.id}: ({lat:.4f},{lon:.4f})@{timestamp}, track_len={len(self.positions)}")
    
    def get_velocity(self, predictor=None):
        """Calculate velocity from last two positions with enhanced accuracy"""
        if len(self.positions) < 2:
            return None, None
        
        (lat1, lon1, t1), (lat2, lon2, t2) = self.positions[-2:]
        
        time_diff = (t2 - t1).total_seconds() / 3600.0
        if time_diff <= 0:
            logging.warning(f"Invalid time difference: {time_diff:.4f}h for cell track")
            return None, None
        
        # Use predictor methods if available, otherwise use local methods
        if predictor:
            distance_km = predictor.haversine(lat1, lon1, lat2, lon2)
            bearing = predictor.calculate_bearing(lat1, lon1, lat2, lon2)
        else:
            # Fallback to local calculation methods
            distance_km = self._haversine_fallback(lat1, lon1, lat2, lon2)
            bearing = self._calculate_bearing_fallback(lat1, lon1, lat2, lon2)
        
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
    
    def get_smoothed_velocity(self, max_points=6):
        """Velocity from a straight-line fit through the last few positions.

        Far less noisy than the last two positions: a rain cell's centroid wobbles by a few km between
        frames as it grows and shrinks, which is a large error in speed and direction over 10 minutes.
        """
        points = self.positions[-max_points:]
        if len(points) < 2:
            return None, None

        lat0, lon0, t0 = points[-1]
        km_per_deg_lat = 110.57
        km_per_deg_lon = 111.32 * math.cos(math.radians(lat0))

        times = np.array([(t - t0).total_seconds() / 3600.0 for _, _, t in points])
        if times.max() - times.min() <= 0:
            return None, None
        xs = np.array([(lon - lon0) * km_per_deg_lon for _, lon, _ in points])
        ys = np.array([(lat - lat0) * km_per_deg_lat for lat, _, _ in points])

        vx = np.polyfit(times, xs, 1)[0]
        vy = np.polyfit(times, ys, 1)[0]
        speed_kph = min(float(math.hypot(vx, vy)), 200.0)
        direction_deg = math.degrees(math.atan2(vx, vy)) % 360
        return speed_kph, direction_deg

    def _haversine_fallback(self, lat1, lon1, lat2, lon2):
        """Fallback haversine calculation"""
        R = 6371
        lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad
        a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
        c = 2 * asin(sqrt(a))
        return R * c
    
    def _calculate_bearing_fallback(self, lat1, lon1, lat2, lon2):
        """Fallback bearing calculation"""
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
        self.latest_analysis_path = "/data/latest_analysis.json"
        self.last_detected_cells = []
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
        self.max_track_dist = config.get('tracking_settings.max_tracking_distance_km', 1000)  # Extended for very long-range tracking (1000km)
        self.min_track_len = config.get('tracking_settings.min_track_length', 3)  # Increased for more reliable tracking
        
        # View bounds for focused analysis
        self.view_bounds = None
        self.view_center = None

        # Radar imagery per frame never changes once published, so cache it by frame path
        self._mosaic_cache = {}

        # Latest time-to-rain estimate ({'minutes', 'at', 'sent'}) so it can be counted down between cycles
        self._eta_snapshot = None

        # Wind validation settings
        self.openweather_api_key = config.get('openweather_api_key', None)
        self.enable_wind_validation = config.get('wind_validation.enabled', False)
        self.wind_tolerance_deg = config.get('wind_validation.direction_tolerance_deg', 45)
        self.wind_speed_tolerance = config.get('wind_validation.speed_tolerance_ratio', 0.5)

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
    
    def _read_view_bounds(self):
        """Read current view bounds from frontend shared file"""
        try:
            import json
            with open('/tmp/view_bounds.json', 'r') as f:
                view_data = json.load(f)
            
            # Check if data is recent (within last 30 seconds)
            import time
            if time.time() - view_data.get('timestamp', 0) < 30:
                self.view_center = view_data.get('center', {})
                self.view_size_km = view_data.get('view_size_km', {})
                self.view_bounds = view_data.get('bounds', {})
                bounds = self.view_bounds
                
                logging.info(f"🗺️ Dynamic view update: center=({self.view_center.get('lat', 0):.4f}, {self.view_center.get('lng', 0):.4f})")
                logging.info(f"   View size: {self.view_size_km.get('width', 0):.1f}km x {self.view_size_km.get('height', 0):.1f}km")
                logging.info(f"   Bounds: ({bounds.get('north', 0):.4f}, {bounds.get('west', 0):.4f}) to ({bounds.get('south', 0):.4f}, {bounds.get('east', 0):.4f})")
                
                return True
            else:
                logging.debug("View bounds data is stale, using defaults")
                return False
                
        except FileNotFoundError:
            logging.debug("No view bounds file found, using defaults")
            return False
        except Exception as e:
            logging.warning(f"Error reading view bounds: {e}")
            return False
    
    def analyze_radar_data(self, past_frames, api_data):
        """Analyze radar data and predict rain arrival"""
        logging.info("=" * 60)
        logging.info(f"ANALYZING {len(past_frames)} FRAMES")
        logging.info("=" * 60)
        
        # Read dynamic view bounds from frontend
        self._read_view_bounds()
        
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
            
            # The rain pattern moves as a whole, so its motion is measured from all of the echoes at once and
            # followed upwind from the location, instead of trusting the noisy speed and heading of single cells
            self.last_detected_cells = self._extract_cells_from_frame(latest_frame, api_data)
            threat = self._predict_from_radar_flow(sorted_frames, api_data)

            if threat:
                logging.info(f"\n⚠️  RAIN EXPECTED: { {k: v for k, v in threat.items() if k != 'track'} }")
                prediction.update(threat)
            else:
                logging.info("\n✅ No rain is expected to reach the location")

        except Exception as e:
            logging.error(f"❌ Error in radar analysis: {e}", exc_info=True)
        
        return prediction
    
    def _latlon_to_mosaic_px(self, lat, lon, geo):
        """Pixel (x, y) of a lat/lon inside a radar tile mosaic"""
        first_tile_x, first_tile_y, zoom, tile_px = geo
        n = 2 ** zoom
        tile_x = (lon + 180.0) / 360.0 * n
        tile_y = (1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n
        return (tile_x - first_tile_x) * tile_px, (tile_y - first_tile_y) * tile_px

    def _mosaic_px_to_latlon(self, px, py, geo):
        """Lat/lon of a pixel (x, y) inside a radar tile mosaic"""
        first_tile_x, first_tile_y, zoom, tile_px = geo
        return self._tile_to_latlon(first_tile_x + px / tile_px, first_tile_y + py / tile_px, zoom)

    @staticmethod
    def _phase_shift(earlier, later):
        """How far the pattern in `later` has shifted relative to `earlier`, as (dy, dx) in pixels (dy is
        positive southwards, dx positive eastwards), plus how strong the match is"""
        window = np.outer(np.hanning(earlier.shape[0]), np.hanning(earlier.shape[1]))
        first = np.fft.rfft2((earlier - earlier.mean()) * window)
        second = np.fft.rfft2((later - later.mean()) * window)
        cross = second * np.conj(first)
        cross /= np.maximum(1e-9, np.abs(cross))
        corr = np.fft.irfft2(cross, s=earlier.shape)
        peak_y, peak_x = np.unravel_index(np.argmax(corr), corr.shape)

        def refine(index, line):
            size = len(line)
            before, centre, after = line[(index - 1) % size], line[index], line[(index + 1) % size]
            denominator = before - 2 * centre + after
            return 0.0 if denominator == 0 else 0.5 * (before - after) / denominator

        dy = peak_y + refine(peak_y, corr[:, peak_x])
        dx = peak_x + refine(peak_x, corr[peak_y, :])
        if dy > earlier.shape[0] / 2:
            dy -= earlier.shape[0]
        if dx > earlier.shape[1] / 2:
            dx -= earlier.shape[1]
        return float(dy), float(dx), float(corr.max())

    def _bulk_motion(self, masks, user_px, km_per_px, minutes_per_frame):
        """Motion of the whole radar pattern around the user, from consecutive frames (oldest first).

        Every echo contributes, so it is far steadier than the speed and heading of single cells, whose
        centroids wobble as they grow, shrink, merge and split. Returns None if there is nothing reliable.
        """
        half = int(FLOW_WINDOW_KM / km_per_px)
        ux, uy = int(round(user_px[0])), int(round(user_px[1]))
        windows = [m[max(0, uy - half):uy + half, max(0, ux - half):ux + half].astype(np.float32) for m in masks]
        # Shifts over 1, 2 and 3 frames: real motion adds up with the time gap while the random changes in
        # the shapes of the cells do not, so the longer gaps make the measurement steadier
        shifts = []
        for gap in (1, 2, 3):
            for earlier, later in zip(windows[:-gap], windows[gap:]):
                if earlier.shape != later.shape or min(earlier.shape) < 32:
                    continue
                if earlier.sum() < 200 or later.sum() < 200:
                    continue
                dy, dx, strength = self._phase_shift(earlier, later)
                shifts.append((dy / gap, dx / gap, strength))
        if not shifts:
            return None

        weights = np.array([s[2] for s in shifts])
        dy = float(np.average([s[0] for s in shifts], weights=weights))
        dx = float(np.average([s[1] for s in shifts], weights=weights))
        east_kph = dx * km_per_px * 60.0 / minutes_per_frame
        north_kph = -dy * km_per_px * 60.0 / minutes_per_frame
        speed_kph = math.hypot(east_kph, north_kph)
        if speed_kph < FLOW_MIN_SPEED_KPH or speed_kph > 150:
            return None
        return {
            'speed_kph': speed_kph,
            'direction_deg': math.degrees(math.atan2(east_kph, north_kph)) % 360,
            'dx_per_min': dx / minutes_per_frame,
            'dy_per_min': dy / minutes_per_frame,
        }

    def _predict_from_radar_flow(self, sorted_frames, api_data):
        """Predict when the next rain reaches the user from the motion of the whole radar pattern.

        The pattern's motion is measured from all echoes at once. From the user, look upwind along that
        motion for the first rain: the echo found there is the one that arrives first, and the distance to
        it divided by the speed is the time to rain. The cell that arrives is then followed back through
        the earlier frames by where it is expected to have been, for the highlight on the map.
        """
        used, masks, geo = [], [], None
        for frame in sorted_frames[-13:]:
            image, frame_geo = self._fetch_radar_mosaic(frame, api_data)
            if image is None:
                continue
            geo = frame_geo
            echo = image > self.threshold
            # Ignore specks smaller than a real cell
            labels, count = ndimage.label(echo)
            if count:
                sizes = np.bincount(labels.ravel())
                keep = sizes >= 5
                keep[0] = False
                echo = keep[labels]
            used.append(frame)
            masks.append(echo)
        if len(masks) < 3:
            logging.warning("Not enough radar frames to measure the motion of the rain")
            return None

        latest = masks[-1]
        if not latest.any():
            logging.info("No rain echoes anywhere in the radar area")
            return None

        times = [f['time'] for f in used]
        minutes_per_frame = float(np.median(np.diff(times))) / 60.0
        km_per_px = self._km_per_pixel(self.latitude)
        ux, uy = self._latlon_to_mosaic_px(self.latitude, self.longitude, geo)
        iy0, ix0 = int(round(uy)), int(round(ux))
        if not (0 <= iy0 < latest.shape[0] and 0 <= ix0 < latest.shape[1]):
            logging.warning("The location is outside the radar area")
            return None

        motion = self._bulk_motion(masks[-7:], (ux, uy), km_per_px, minutes_per_frame)
        if motion:
            logging.info(f"Rain pattern is moving {motion['speed_kph']:.1f} km/h towards {motion['direction_deg']:.0f}°")
        else:
            logging.info("The motion of the rain pattern could not be measured reliably")

        # Distance from every point to the nearest echo, and which echo that is
        dist_px, (near_y, near_x) = ndimage.distance_transform_edt(~latest, return_indices=True)
        dist_km = dist_px * km_per_px

        arrival_min, hit = None, None
        if dist_km[iy0, ix0] <= FLOW_ARRIVAL_EDGE_KM:
            arrival_min, hit = 0.0, (ix0, iy0)
        elif motion:
            minutes = np.arange(1.0, FLOW_MAX_HORIZON_MIN + 1.0)
            ix = np.rint(ux - motion['dx_per_min'] * minutes).astype(int)
            iy = np.rint(uy - motion['dy_per_min'] * minutes).astype(int)
            inside = (ix >= 0) & (ix < latest.shape[1]) & (iy >= 0) & (iy < latest.shape[0])
            if not inside.all():
                stop = int(np.argmax(~inside))
                minutes, ix, iy = minutes[:stop], ix[:stop], iy[:stop]
            path_km = dist_km[iy, ix]          # distance from each point on the upwind path to the nearest echo
            travelled_km = motion['speed_kph'] * minutes / 60.0
            # The path only has to pass near rain, allowing for the few degrees the motion is uncertain by
            # (a bigger sideways error the farther away it is). That decides whether the rain reaches you
            reach_km = INTERCEPT_MARGIN_KM + travelled_km * math.sin(math.radians(INTERCEPT_HEADING_TOLERANCE_DEG))
            near = np.nonzero(path_km <= reach_km)[0]
            if near.size:
                # When it arrives comes from the echo edge actually getting to the location, or if the path
                # only skirts the rain, from the closest approach
                window = slice(int(near[0]), int(near[0]) + 240)
                edge = np.nonzero(path_km[window] <= FLOW_ARRIVAL_EDGE_KM)[0]
                index = int(near[0]) + (int(edge[0]) if edge.size else int(np.argmin(path_km[window])))
                arrival_min, hit = float(minutes[index]), (int(ix[index]), int(iy[index]))
        if arrival_min is None:
            logging.info("No rain upwind of the location")
            return None

        # The cell that arrives: the echo blob nearest to the point where the path meets rain
        edge_x, edge_y = int(near_x[hit[1], hit[0]]), int(near_y[hit[1], hit[0]])
        labels, _ = ndimage.label(latest)
        blob = labels == labels[edge_y, edge_x]
        size_px = int(blob.sum())
        cy, cx = ndimage.center_of_mass(blob)
        cell_lat, cell_lon = self._mosaic_px_to_latlon(cx, cy, geo)
        edge_lat, edge_lon = self._mosaic_px_to_latlon(edge_x, edge_y, geo)
        distance_km = self.haversine(self.latitude, self.longitude, edge_lat, edge_lon)
        bearing = self.calculate_bearing(self.latitude, self.longitude, edge_lat, edge_lon)

        # Follow the cell back through the earlier frames by where it is expected to have been
        track = []
        for index, (frame, mask) in enumerate(zip(used, masks)):
            if index == len(masks) - 1:
                point = (cx, cy, size_px)
            else:
                ago = (times[-1] - frame['time']) / 60.0
                expect_x = cx - (motion['dx_per_min'] * ago if motion else 0.0)
                expect_y = cy - (motion['dy_per_min'] * ago if motion else 0.0)
                frame_labels, count = ndimage.label(mask)
                if not count:
                    continue
                ids = np.arange(1, count + 1)
                centres = np.array(ndimage.center_of_mass(mask, frame_labels, ids))
                offsets = np.hypot(centres[:, 1] - expect_x, centres[:, 0] - expect_y) * km_per_px
                nearest = int(np.argmin(offsets))
                if offsets[nearest] > FLOW_TRACK_MATCH_KM:
                    continue
                # Only whether the cell existed then, and how big it was, comes from the matched echo. Its
                # position is where the measured motion says it was: the centroid of a big irregular echo
                # jumps around as it merges and splits, which would make the highlight jump
                point = (expect_x, expect_y, int(ndimage.sum(mask, frame_labels, ids[nearest])))
            lat, lon = self._mosaic_px_to_latlon(point[0], point[1], geo)
            track.append(self._track_point({'lat': lat, 'lon': lon, 'timestamp': frame['time'], 'size': point[2]}))

        logging.info(f"Rain arrives in {arrival_min:.0f} min: leading edge {distance_km:.1f}km away at bearing "
                     f"{bearing:.0f}°, cell of {size_px} px, followed in {len(track)} of {len(used)} frames")

        return {
            'time_to_rain': round(arrival_min),
            'time_to_rain_seconds': round(arrival_min * 60),
            'distance_km': round(distance_km, 1),
            'speed_kph': round(motion['speed_kph'], 1) if motion else 0.0,
            'direction_deg': round(motion['direction_deg'], 1) if motion else self.defaults['no_direction'],
            'bearing_to_cell_deg': round(bearing, 1),
            'rain_cell_latitude': round(cell_lat, 4),
            'rain_cell_longitude': round(cell_lon, 4),
            'track': track
        }

    def _check_current_rain(self, frame, api_data):
        """Check if rain is currently at location"""
        return False
    

    def _get_tile_coords(self, lat, lon, zoom):
        """Convert lat/lon to slippy-map tile (x, y) at the given zoom level (Web Mercator)"""
        n = 2 ** zoom
        x = int((lon + 180.0) / 360.0 * n)
        y = int((1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n)
        return max(0, min(x, n - 1)), max(0, min(y, n - 1))

    @staticmethod
    def _tile_to_latlon(tile_x, tile_y, zoom):
        """Convert (fractional) slippy-map tile coordinates to the lat/lon of that point"""
        n = 2 ** zoom
        lon = tile_x / n * 360.0 - 180.0
        lat = math.degrees(math.atan(math.sinh(math.pi * (1.0 - 2.0 * tile_y / n))))
        return lat, lon

    def _download_radar_tile(self, session, url):
        """Download one radar tile as a grayscale array, or None on failure"""
        for attempt in range(2):
            try:
                response = session.get(url, timeout=10)
            except requests.RequestException as e:
                logging.warning(f"Radar tile request failed: {e}")
                return None

            if response.status_code == 429 and attempt == 0:
                time.sleep(1.5)
                continue
            if response.status_code != 200:
                logging.warning(f"Radar tile HTTP {response.status_code}: {url}")
                return None

            try:
                return np.array(Image.open(io.BytesIO(response.content)).convert('L'))
            except Exception as e:
                logging.warning(f"Radar tile is not a valid image ({e}): {url}")
                return None
        return None

    def _fetch_radar_mosaic(self, frame, api_data, radius=1):
        """Fetch the block of radar tiles around the user's location for one frame.

        Returns (grayscale array, geo) where geo = (first_tile_x, first_tile_y, zoom, tile_px),
        or (None, None) if no tile could be downloaded.
        """
        host = api_data.get('host', 'https://tilecache.rainviewer.com')
        frame_path = frame.get('path') or f"/v2/radar/{frame['time']}"
        zoom = max(1, min(int(self.image_zoom), MAX_RADAR_ZOOM))
        tile_px = self.image_size if self.image_size in (256, 512) else 256

        n = 2 ** zoom
        center_x, center_y = self._get_tile_coords(self.latitude, self.longitude, zoom)
        x_start, x_end = max(0, center_x - radius), min(n - 1, center_x + radius)
        y_start, y_end = max(0, center_y - radius), min(n - 1, center_y + radius)

        cache_key = (frame_path, zoom, tile_px, x_start, y_start, x_end, y_end, self.image_color, self.image_opts)
        cached = self._mosaic_cache.get(cache_key)
        if cached is not None:
            return cached

        session = requests.Session()
        rows = []
        downloaded = 0
        total = (x_end - x_start + 1) * (y_end - y_start + 1)
        for tile_y in range(y_start, y_end + 1):
            row = []
            for tile_x in range(x_start, x_end + 1):
                url = (f"{host}{frame_path}/{tile_px}/{zoom}/{tile_x}/{tile_y}/"
                       f"{self.image_color}/{self.image_opts}.png")
                tile = self._download_radar_tile(session, url)
                if tile is None or tile.shape != (tile_px, tile_px):
                    tile = np.zeros((tile_px, tile_px), dtype=np.uint8)
                else:
                    downloaded += 1
                row.append(tile)
            rows.append(np.concatenate(row, axis=1))

        if downloaded == 0:
            logging.error(f"No radar tiles could be downloaded for frame {frame_path}")
            return None, None

        result = (np.concatenate(rows, axis=0), (x_start, y_start, zoom, tile_px))
        # Only cache complete mosaics so a transient failure is retried next cycle
        if downloaded == total:
            if len(self._mosaic_cache) > 40:
                self._mosaic_cache.pop(next(iter(self._mosaic_cache)))
            self._mosaic_cache[cache_key] = result
        else:
            logging.warning(f"Only {downloaded}/{total} radar tiles downloaded for frame {frame_path}")
        return result

    def _extract_cells_from_frame(self, frame, api_data):
        """Extract rain cells from a single radar frame"""
        try:
            img_array, geo = self._fetch_radar_mosaic(frame, api_data)
            if img_array is None:
                return []

            # Apply threshold to identify rain areas
            thresholded = (img_array > self.threshold).astype(np.uint8) * 255

            # Find connected components (rain cells)
            labeled_image, num_labels = label(thresholded)

            # Convert cells to lat/lon coordinates
            return self._convert_cells_to_coordinates(img_array, labeled_image, num_labels, geo)
        except Exception as e:
            logging.error(f"Error extracting cells from frame: {e}", exc_info=True)
            return []

    def _convert_cells_with_geo(self, img_array, labeled_image, num_labels, geo):
        """Convert pixel cells to lat/lon using the exact Web Mercator tile geometry"""
        first_tile_x, first_tile_y, zoom, tile_px = geo
        cells = []

        # Per-label sums in one pass (a np.where scan per label over the whole mosaic is far too
        # slow on Home Assistant hardware)
        flat_labels = labeled_image.ravel()
        rows, cols = np.indices(labeled_image.shape)
        counts = np.bincount(flat_labels, minlength=num_labels + 1)
        sum_x = np.bincount(flat_labels, weights=cols.ravel(), minlength=num_labels + 1)
        sum_y = np.bincount(flat_labels, weights=rows.ravel(), minlength=num_labels + 1)
        sum_intensity = np.bincount(flat_labels, weights=img_array.ravel().astype(np.float64),
                                    minlength=num_labels + 1)

        for i in range(1, num_labels + 1):
            cell_size = int(counts[i])

            if cell_size < 5:
                continue

            centroid_x = sum_x[i] / cell_size
            centroid_y = sum_y[i] / cell_size
            est_lat, est_lon = self._tile_to_latlon(
                first_tile_x + (centroid_x + 0.5) / tile_px,
                first_tile_y + (centroid_y + 0.5) / tile_px,
                zoom
            )

            cells.append({
                'lat': float(est_lat),
                'lon': float(est_lon),
                'intensity': float(sum_intensity[i] / cell_size),
                'size': cell_size
            })

        return cells

    def _extract_cells_from_all_frames(self, api_data):
        """Extract rain cells from ALL radar frames and analyze movement patterns"""
        try:
            past_frames = api_data['radar']['past']
            if len(past_frames) < 3:
                logging.warning(f"Need at least 3 frames for movement analysis, got {len(past_frames)}")
                return []
            
            logging.info(f"Analyzing ALL {len(past_frames)} frames for movement detection")
            
            # Read dynamic view bounds from frontend
            self._read_view_bounds()
            
            # Extract cells from each frame
            frame_cells = []
            host = api_data.get('host', 'https://tilecache.rainviewer.com').replace('https://', '')
            
            for frame_idx, frame in enumerate(past_frames):
                try:
                    cells = self._extract_cells_from_frame(frame, api_data)
                    
                    if frame_idx == len(past_frames) - 1:
                        self.last_detected_cells = cells
    
                    frame_cells.append({
                        'timestamp': frame['time'],
                        'cells': cells,
                        'frame_idx': frame_idx
                    })
                    
                    logging.info(f"Frame {frame_idx}: {frame['time']} - Found {len(cells)} cells")
                    
                except Exception as e:
                    logging.error(f"Error processing frame {frame_idx}: {e}")
                    continue
            # Analyze movement patterns across frames
            moving_cells = self._analyze_movement_patterns(frame_cells)
            logging.info(f"Movement analysis found {len(moving_cells)} cells with consistent movement")
            
            return moving_cells
            
        except Exception as e:
            logging.error(f"Error extracting cells from all frames: {e}", exc_info=True)
            return []
    
    def _convert_cells_to_coordinates(self, img_array, labeled_image, num_labels, geo=None):
        """Convert pixel cells to lat/lon coordinates"""
        if geo is not None:
            return self._convert_cells_with_geo(img_array, labeled_image, num_labels, geo)

        cells = []
        img_height, img_width = img_array.shape
        
        # Use dynamic analysis area based on user view bounds
        if hasattr(self, 'view_center') and self.view_center and hasattr(self, 'view_size_km') and self.view_size_km:
            # Calculate range from actual view bounds
            bounds = getattr(self, 'view_bounds', {})
            if bounds:
                north = bounds.get('north', self.latitude + 2.5)
                south = bounds.get('south', self.latitude - 2.5)
                east = bounds.get('east', self.longitude + 2.5)
                west = bounds.get('west', self.longitude - 2.5)
                
                lat_range = north - south
                lon_range = east - west
                center_lat = (north + south) / 2.0
                center_lon = (east + west) / 2.0
                
                logging.info(f"Using dynamic view bounds: {lat_range:.3f}° x {lon_range:.3f}°")
                logging.info(f"   Center: ({center_lat:.4f}, {center_lon:.4f})")
            else:
                # Fallback to view size calculation
                view_width_km = self.view_size_km.get('width', 500)
                view_height_km = self.view_size_km.get('height', 500)
                lat_range = view_height_km / 111.0
                lon_range = view_width_km / (111.0 * math.cos(math.radians(self.latitude)))
                center_lat = self.view_center.get('lat', self.latitude)
                center_lon = self.view_center.get('lng', self.longitude)
                
                logging.info(f"Using view-based analysis: {view_width_km:.1f}km x {view_height_km:.1f}km")
        else:
            lat_range = self.lat_range
            lon_range = self.lon_range
            center_lat = self.latitude
            center_lon = self.longitude
            if hasattr(self, 'view_center') and self.view_center and hasattr(self, 'view_size_km') and self.view_size_km:
                logging.info(f"Using view-based analysis: {view_width_km:.1f}km x {view_height_km:.1f}km")
            else:
                logging.info(f"Using configured analysis range: {lat_range:.1f}° x {lon_range:.1f}°")
        
        lat_inc = lat_range / img_height
        lon_inc = lon_range / img_width
        center_y = (img_height - 1) / 2.0
        center_x = (img_width - 1) / 2.0
        
        # Center is already calculated above based on view bounds
        
        for i in range(1, num_labels + 1):
            y_coords, x_coords = np.where(labeled_image == i)
            cell_size = len(y_coords)
            
            if cell_size < 5:
                continue
            
            centroid_x, centroid_y = np.mean(x_coords), np.mean(y_coords)
            # FIXED: Correct coordinate conversion
            lat_offset = (centroid_y - center_y) * lat_inc
            lon_offset = (centroid_x - center_x) * lon_inc
            
            est_lat = np.clip(center_lat + lat_offset, -90, 90)
            est_lon = np.clip(center_lon + lon_offset, -180, 180)
            
            intensity = np.mean(img_array[y_coords, x_coords])
            
            cells.append({
                'lat': est_lat,
                'lon': est_lon,
                'intensity': intensity,
                'size': cell_size
            })
        
        return cells
    
    def _analyze_movement_patterns(self, frame_cells):
        """Analyze ALL rain cell movements to determine general direction and threats"""
        if len(frame_cells) < 3:
            return []
        
        all_moving_cells = []
        cells_with_movement = 0
        
        # For each cell in the latest frame, track backwards regardless of trajectory
        latest_frame = frame_cells[-1]['cells']
        logging.info(f"Latest frame has {len(latest_frame)} cells to track")
        
        for cell_idx, latest_cell in enumerate(latest_frame):
            # Track this cell back through previous frames
            positions = self._track_cell_backwards(latest_cell, frame_cells, cell_idx)
            
            if len(positions) >= 2:  # Need at least 2 positions for movement detection
                cells_with_movement += 1
                # Calculate movement vector
                movement = self._calculate_movement_vector(positions)
                
                if movement:
                    # Store ALL moving cells with their data
                    all_moving_cells.append({
                        'cell_id': cell_idx,
                        'current_lat': latest_cell['lat'],
                        'current_lon': latest_cell['lon'],
                        'initial_lat': positions[0]['lat'],  # First frame position
                        'initial_lon': positions[0]['lon'],  # First frame position
                        'speed': movement['speed'],
                        'direction': movement['direction'],
                        'intensity': latest_cell['intensity'],
                        'size': latest_cell['size'],
                        'positions': positions,
                        'distance_to_user': self.haversine(
                            latest_cell['lat'], latest_cell['lon'],
                            self.latitude, self.longitude
                        )
                    })
        
        logging.info(f"Movement analysis: {cells_with_movement}/{len(latest_frame)} cells have movement")
        
        if not all_moving_cells:
            return []
        
        # Calculate general/average direction of ALL rain cells
        general_direction = self._calculate_general_direction(all_moving_cells)
        logging.info(f"General rain movement direction: {general_direction:.1f}°")
        
        # Filter cells that are moving in similar direction to general pattern
        threat_cells = self._filter_threat_cells(all_moving_cells, general_direction)
        
        # Sort by distance to user (closest first)
        threat_cells.sort(key=lambda x: x['distance_to_user'])
        
        return threat_cells
    
    def _calculate_general_direction(self, moving_cells):
        """Calculate the general/average direction of all rain cell movements"""
        if not moving_cells:
            return 0
        
        # Convert directions to vectors and average them
        x_sum = 0
        y_sum = 0
        
        for cell in moving_cells:
            direction_rad = math.radians(cell['direction'])
            # Weight by cell size/intensity for more accurate general direction
            weight = cell.get('size', 1) * cell.get('intensity', 1) / 100
            x_sum += math.cos(direction_rad) * weight
            y_sum += math.sin(direction_rad) * weight
        
        # Calculate average direction
        avg_direction_rad = math.atan2(y_sum, x_sum)
        avg_direction_deg = math.degrees(avg_direction_rad)
        
        # Normalize to 0-360
        return avg_direction_deg % 360
    
    def _filter_threat_cells(self, moving_cells, general_direction):
        """Filter cells that are on intercept course with user location"""
        threat_cells = []
        direction_tolerance = 45  # Degrees tolerance from general direction
        
        for cell in moving_cells:
            # Check if cell direction matches general pattern
            direction_diff = abs((cell['direction'] - general_direction + 180) % 360 - 180)
            
            if direction_diff <= direction_tolerance:
                # Check if this cell will intercept user location
                if self._will_intercept_user(cell):
                    # Calculate bearing from user to cell
                    bearing_from_user = self.calculate_bearing(
                        self.latitude, self.longitude,
                        cell['current_lat'], cell['current_lon']
                    )
                    cell['bearing_from_user'] = bearing_from_user
                    
                    threat_cells.append(cell)
                    logging.info(f"Threat cell {cell['cell_id']}: dir={cell['direction']:.1f}°, "
                               f"dist={cell['distance_to_user']:.1f}km, "
                               f"speed={cell['speed']:.1f}kph, "
                               f"bearing={bearing_from_user:.1f}°")
                else:
                    logging.debug(f"Cell {cell['cell_id']}: matches direction but no intercept")
            else:
                logging.debug(f"Cell {cell['cell_id']}: direction {direction_diff:.1f}° from general")
        
        logging.info(f"Found {len(threat_cells)} threat cells on intercept course")
        return threat_cells
    
    def _will_intercept_user(self, cell):
        """Check if rain cell's path actually passes over the user location"""
        radius_km = self._cell_radius_km(cell.get('size'), cell['current_lat'])
        return self._intercept(cell['current_lat'], cell['current_lon'],
                               cell['speed'], cell['direction'], radius_km) is not None
    
    def _track_cell_backwards(self, target_cell, frame_cells, cell_idx):
        """Track a single cell backwards through frames"""
        positions = []
        max_distance_km = 100  # Max distance to consider same cell between frames (more permissive)
        
        # Start with current position
        positions.append({
            'lat': target_cell['lat'],
            'lon': target_cell['lon'],
            'size': target_cell.get('size'),
            'timestamp': frame_cells[-1]['timestamp']
        })
        
        # Work backwards through frames
        current_lat = target_cell['lat']
        current_lon = target_cell['lon']
        last_timestamp = frame_cells[-1]['timestamp']
        
        logging.debug(f"Tracking cell {cell_idx} backwards from {current_lat:.4f}, {current_lon:.4f}")
        
        for frame_idx in range(len(frame_cells) - 2, -1, -1):
            frame = frame_cells[frame_idx]
            best_match = None
            best_distance = float('inf')

            # Farthest this cell can plausibly have moved since the previous frame; matching anything
            # further away just jumps to a neighbouring or merged cell
            gap_hours = abs(last_timestamp - frame['timestamp']) / 3600.0
            max_step_km = min(max_distance_km, MAX_CELL_SPEED_KPH * gap_hours + 5.0)
            
            # Find closest cell in this frame
            for cell in frame['cells']:
                distance = self.haversine(current_lat, current_lon, cell['lat'], cell['lon'])
                if distance < max_step_km and distance < best_distance:
                    best_distance = distance
                    best_match = cell
            
            if best_match:
                positions.append({
                    'lat': best_match['lat'],
                    'lon': best_match['lon'],
                    'size': best_match.get('size'),
                    'timestamp': frame['timestamp']
                })
                current_lat = best_match['lat']
                current_lon = best_match['lon']
                last_timestamp = frame['timestamp']
                logging.debug(f"  Frame {frame_idx}: matched at {best_distance:.1f}km")
            else:
                logging.debug(f"  Frame {frame_idx}: no match (lost track) - checked {len(frame['cells'])} cells")
                break  # Lost track
        
        logging.debug(f"Cell {cell_idx}: tracked {len(positions)} positions total")
        return positions
    
    def _calculate_movement_vector(self, positions):
        """Calculate speed and direction from cell positions"""
        if len(positions) < 2:
            return None
        
        # Sort positions by timestamp to ensure chronological order
        positions_sorted = sorted(positions, key=lambda p: p['timestamp'])
        first_pos = positions_sorted[0]
        last_pos = positions_sorted[-1]
        
        # Calculate time difference in hours
        time_diff = (last_pos['timestamp'] - first_pos['timestamp']) / 3600.0
        if time_diff <= 0:
            return None
        
        # Calculate distance
        distance_km = self.haversine(
            first_pos['lat'], first_pos['lon'],
            last_pos['lat'], last_pos['lon']
        )
        
        # Calculate speed
        speed_kph = distance_km / time_diff
        
        # Calculate direction (where cell is moving TO)
        direction = self.calculate_bearing(
            first_pos['lat'], first_pos['lon'],
            last_pos['lat'], last_pos['lon']
        )
        
        return {
            'speed': speed_kph,
            'direction': direction,
            'distance': distance_km,
            'time_hours': time_diff
        }
    
    def _is_moving_toward_user(self, movement, cell):
        """Check if cell movement is toward user location"""
        if not movement:
            return False
        
        # Calculate bearing from cell to user (direction rain needs to travel to reach user)
        bearing_to_user = self.calculate_bearing(
            cell['lat'], cell['lon'],
            self.latitude, self.longitude
        )
        
        # Calculate angle difference between movement direction and bearing to user
        angle_diff = abs((movement['direction'] - bearing_to_user + 180) % 360 - 180)
        
        # Cell is moving toward user if angle difference is within 90 degrees (stricter)
        # This means rain is generally moving in the direction of the user
        is_toward = angle_diff <= 90
        
        # Log at INFO level for debugging movement detection issues
        logging.info(f"Movement check: dir={movement['direction']:.1f}°, "
                     f"bearing_to_user={bearing_to_user:.1f}°, "
                     f"angle_diff={angle_diff:.1f}°, "
                     f"speed={movement['speed']:.1f}kph, "
                     f"toward_user={is_toward}")
        
        return is_toward
    
    def _fetch_wind_data(self):
        """Fetch current wind data from OpenWeatherMap API"""
        if not self.openweather_api_key or not self.enable_wind_validation:
            return None
            
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': self.latitude,
                'lon': self.longitude,
                'appid': self.openweather_api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            wind = data.get('wind', {})
            
            wind_data = {
                'speed_kph': wind.get('speed', 0) * 3.6,  # Convert m/s to kph
                'direction_deg': wind.get('deg', 0),
                'gust_kph': wind.get('gust', 0) * 3.6 if 'gust' in wind else None
            }
            
            logging.info(f"Wind data: {wind_data['speed_kph']:.1f}kph @ {wind_data['direction_deg']:.0f}°")
            return wind_data
            
        except Exception as e:
            logging.warning(f"Failed to fetch wind data: {e}")
            return None
    
    def _validate_movement_with_wind(self, movement, wind_data):
        """Validate rain cell movement against wind data"""
        if not movement or not wind_data:
            return True  # No validation if no wind data
            
        # Calculate direction difference
        wind_dir = wind_data['direction_deg']
        rain_dir = movement['direction']
        
        # Normalize angles to 0-360
        wind_dir = wind_dir % 360
        rain_dir = rain_dir % 360
        
        # Calculate minimum angle difference
        angle_diff = abs((rain_dir - wind_dir + 180) % 360 - 180)
        
        # Check speed consistency (rain cells typically move at 50-150% of wind speed)
        wind_speed = wind_data['speed_kph']
        rain_speed = movement['speed']
        
        speed_ratio = rain_speed / wind_speed if wind_speed > 0 else 0
        speed_consistent = 0.5 <= speed_ratio <= 2.0  # Rain speed within 50-200% of wind speed
        
        direction_consistent = angle_diff <= self.wind_tolerance_deg
        
        logging.debug(f"Wind validation: wind={wind_dir:.0f}°@{wind_speed:.1f}kph, "
                     f"rain={rain_dir:.0f}°@{rain_speed:.1f}kph, "
                     f"angle_diff={angle_diff:.0f}°, speed_ratio={speed_ratio:.2f}, "
                     f"dir_ok={direction_consistent}, speed_ok={speed_consistent}")
        
        return direction_consistent and speed_consistent
    
    def _km_per_pixel(self, lat):
        """Ground size of one radar pixel (km) at the given latitude for the tile zoom in use"""
        zoom = max(1, min(int(self.image_zoom), MAX_RADAR_ZOOM))
        tile_px = self.image_size if self.image_size in (256, 512) else 256
        return 156.54303392 * math.cos(math.radians(lat)) / (2 ** zoom) * (256.0 / tile_px)

    def _cell_radius_km(self, size_px, lat):
        """Radius (km) of a circle around a cell of size_px radar pixels, slightly larger than the cell
        and kept within a sensible range"""
        radius_km = math.sqrt((size_px or 0) / math.pi) * self._km_per_pixel(lat)
        return min(25.0, max(4.0, radius_km + 2.0))

    def _track_point(self, pos):
        """One tracked position of a cell, in the form the web UI needs to draw the green highlight"""
        return {
            'lat': round(float(pos['lat']), 4),
            'lng': round(float(pos['lon']), 4),
            'time': int(pos['timestamp']),
            'radius_km': round(self._cell_radius_km(pos.get('size'), pos['lat']), 1)
        }

    def _intercept(self, lat, lon, speed_kph, direction_deg, radius_km):
        """Whether a cell at (lat, lon) moving at speed_kph towards direction_deg will actually reach the user.

        Splits the distance to the user into the part along the cell's path and the sideways miss
        distance. The cell only reaches the user if it is heading their way and that miss distance is
        within its radius plus a small margin and an allowance for the few degrees its heading is uncertain
        by (which grows with distance). Returns None if it never does, otherwise the hours until its
        leading edge reaches the user and the miss distance.
        """
        distance_km = self.haversine(lat, lon, self.latitude, self.longitude)
        if distance_km <= radius_km:
            return {'eta_hours': 0.0, 'miss_km': 0.0}
        if not speed_kph or speed_kph < 1:
            return None

        bearing_to_user = self.calculate_bearing(lat, lon, self.latitude, self.longitude)
        angle = math.radians(direction_deg - bearing_to_user)
        along_km = distance_km * math.cos(angle)
        miss_km = abs(distance_km * math.sin(angle))

        reach_km = (radius_km + INTERCEPT_MARGIN_KM
                    + distance_km * math.sin(math.radians(INTERCEPT_HEADING_TOLERANCE_DEG)))
        if along_km <= 0 or miss_km > reach_km:
            return None

        # Distance until the leading edge of the cell reaches the user
        chord_km = math.sqrt(radius_km ** 2 - miss_km ** 2) if miss_km < radius_km else 0.0
        return {'eta_hours': max(0.0, along_km - chord_km) / speed_kph, 'miss_km': miss_km}

    def _create_tracked_cells_from_movement(self, moving_cells):
        """Rebuild tracked cells from the movement analysis of the latest set of frames"""
        # Cell ids are only indexes into the latest frame and each analysis re-derives the full
        # position history from all frames, so tracks are rebuilt every cycle rather than merged
        self.tracked_cells = {}
        current_timestamp = datetime.now()
        seen_cell_ids = set()

        for cell_data in moving_cells:
            cell_id = cell_data['cell_id']
            seen_cell_ids.add(cell_id)

            # Positions arrive newest-first from _track_cell_backwards, but a RainCell needs them
            # oldest-first (add_position rejects any position that is not newer than the last one)
            chronological = list(reversed(cell_data['positions']))
            first_pos = chronological[0]
            existing_cell = RainCell(
                cell_id=cell_id,
                lat=first_pos['lat'],
                lon=first_pos['lon'],
                timestamp=datetime.fromtimestamp(first_pos['timestamp']),
                intensity=cell_data['intensity']
            )
            self.tracked_cells[cell_id] = existing_cell

            for pos in chronological[1:]:
                existing_cell.add_position(
                    pos['lat'],
                    pos['lon'],
                    datetime.fromtimestamp(pos['timestamp']),
                    cell_data['intensity']
                )

            # Real position of the cell in every radar frame it was tracked through (oldest first)
            existing_cell.track = [self._track_point(p) for p in chronological]

            speed, direction = existing_cell.get_velocity(self)
            dist = self.haversine(existing_cell.positions[-1][0], existing_cell.positions[-1][1],
                                   self.latitude, self.longitude)
            if speed is None or direction is None:
                logging.info(f"   Track #{cell_id}: {len(existing_cell.positions)} positions, "
                            f"speed=N/A, dir=N/A, dist={dist:.1f}km")
            else:
                logging.info(f"   Track #{cell_id}: {len(existing_cell.positions)} positions, "
                            f"speed={speed:.1f}kph, dir={direction:.1f}°, dist={dist:.1f}km")

        stale_threshold = datetime.now() - timedelta(minutes=15)
        stale_count = 0
        for cell_id in list(self.tracked_cells.keys()):
            if cell_id not in seen_cell_ids:
                cell = self.tracked_cells[cell_id]
                if cell.positions:
                    last_pos_time = cell.positions[-1][2]
                    if last_pos_time < stale_threshold:
                        del self.tracked_cells[cell_id]
                        stale_count += 1

        if stale_count > 0:
            logging.info(f"🗑️ Removed {stale_count} stale tracks not seen in 15 minutes")
    
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
                speed_kph, direction_deg = tracked_cell.get_velocity(self)
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
        
        # Removed duplicate track creation - movement-based tracking handles all cells properly
        
        # Enhanced cleanup with performance-based retention
        current_time = timestamp
        removed_count = 0
        for cell_id in list(self.tracked_cells.keys()):
            track = self.tracked_cells[cell_id]
            age = (current_time - track.last_seen).total_seconds() / 60.0
            
            # Keep high-performing tracks longer
            base_retention = 30  # minutes
            if len(track.positions) >= 3:
                speed, direction = track.get_velocity(self)
                if speed and speed > 5:  # Keep fast-moving cells longer
                    base_retention = 45
                if track.intensity > self.threshold * 1.5:  # Keep intense cells longer
                    base_retention = 60
            
            if age > base_retention:
                del self.tracked_cells[cell_id]
                logging.debug(f"Removed track ID {cell_id} (age: {age:.1f}min > {base_retention}min)")
                removed_count += 1
        
        total_matches = matched_count
        logging.info(f"🎯 ENHANCED TRACKING: {matched_count} matched, {removed_count} removed")
    
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
            if self.entities.get('rain_cell_latitude') and values.get('rain_cell_latitude') is not None:
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['rain_cell_latitude'], values['rain_cell_latitude'])

            # Update rain cell longitude
            if self.entities.get('rain_cell_longitude') and values.get('rain_cell_longitude') is not None:
                self.ha_api.call_service("input_number/set_value",
                                       self.entities['rain_cell_longitude'], values['rain_cell_longitude'])

            logging.info("Successfully updated Home Assistant entities")

        except Exception as e:
            logging.error(f"Error updating entities: {e}")

    def _find_threatening_cell(self):
        """Find the next rain cell to reach the user's location.

        A cell only counts if its predicted path, from its recent movement, actually passes over the
        user, not merely if it is somewhere in the user's general direction. Of those, the cell whose
        leading edge arrives first is chosen.
        """
        logging.info(f"\n🌧️ FINDING NEXT CELL TO ARRIVE - {len(self.tracked_cells)} tracked cells")

        arriving_cells = []
        checked = 0

        for cell_id, cell in self.tracked_cells.items():
            if len(cell.positions) < 2:
                continue

            speed_kph, direction_deg = cell.get_smoothed_velocity()
            if speed_kph is None or direction_deg is None or speed_kph < 1:
                continue
            checked += 1

            current_lat, current_lon, _ = cell.positions[-1]
            track = getattr(cell, 'track', None) or []
            radius_km = track[-1]['radius_km'] if track else self._cell_radius_km(None, current_lat)

            intercept = self._intercept(current_lat, current_lon, speed_kph, direction_deg, radius_km)
            if intercept is None:
                continue

            distance_km = self.haversine(current_lat, current_lon, self.latitude, self.longitude)
            bearing_from_user = self.calculate_bearing(self.latitude, self.longitude, current_lat, current_lon)

            logging.info(f"  Cell #{cell_id}: {distance_km:.1f}km away, {speed_kph:.1f}kph, dir={direction_deg:.0f}°, "
                         f"passes {intercept['miss_km']:.1f}km from you (cell radius {radius_km:.1f}km), "
                         f"arrives in {intercept['eta_hours'] * 60:.0f} min")

            arriving_cells.append({
                'cell_id': cell_id,
                'cell': cell,
                'lat': current_lat,
                'lon': current_lon,
                'speed': speed_kph,
                'direction': direction_deg,
                'distance_to_user': distance_km,
                'bearing_from_user': bearing_from_user,
                'eta_hours': intercept['eta_hours']
            })

        logging.info(f"  {len(arriving_cells)} of {checked} moving cells are on a path that reaches the location")

        if not arriving_cells:
            logging.info("  No cells will reach the location")
            return None

        # The next rain to arrive is the one whose leading edge gets here first
        arriving_cells.sort(key=lambda x: x['eta_hours'])
        best_cell = arriving_cells[0]

        time_to_arrival_minutes = best_cell['eta_hours'] * 60

        logging.info(f"  Selected: Cell #{best_cell['cell_id']} at {best_cell['lat']:.4f}, {best_cell['lon']:.4f}")
        logging.info(f"  Distance: {best_cell['distance_to_user']:.1f}km, ETA: {time_to_arrival_minutes:.0f} min")

        return {
            'time_to_rain': round(time_to_arrival_minutes),
            'time_to_rain_seconds': round(time_to_arrival_minutes * 60),
            'distance_km': round(best_cell['distance_to_user'], 1),
            'speed_kph': round(best_cell['speed'], 1),
            'direction_deg': round(best_cell['direction'], 1),
            'bearing_to_cell_deg': round(best_cell['bearing_from_user'], 1),
            'rain_cell_latitude': round(best_cell['lat'], 4),
            'rain_cell_longitude': round(best_cell['lon'], 4),
            'track': getattr(best_cell['cell'], 'track', [])
        }

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
        # Much stricter - only cells actually moving toward user get points
        if angle_diff <= 45:
            probability += 25
        elif angle_diff <= 90:
            probability += 10
        # No points for cells moving away (angle_diff > 90)
        
        # Intensity factor (0-10%): more intense is more threatening
        intensity_ratio = intensity / self.threshold if self.threshold > 0 else 0
        probability += min(10, intensity_ratio * 10)
        
        return min(100, probability)
    

    def _save_analysis_to_cache(self, values, prediction):
        """Save analysis results to cache file for Web UI"""
        try:
            ui_cells = []
            if hasattr(self, 'last_detected_cells'):
                ui_cells = [{"lat": float(c['lat']), "lng": float(c['lon']), "intensity": float(c['intensity'])} for c in self.last_detected_cells[:10]]

            ui_data = {
                "time_to_rain": str(values.get('time', '--')),
                "distance": str(values.get('distance', '--')),
                "speed": str(values.get('speed', '--')),
                "direction": str(values.get('direction', 'N/A')),
                "bearing": str(values.get('bearing', 'N/A')),
                "rain_cell_latitude": prediction.get('rain_cell_latitude') if prediction else None,
                "rain_cell_longitude": prediction.get('rain_cell_longitude') if prediction else None,
                "track": prediction.get('track') if prediction else None,
                # When this estimate was made, so the UI can count the time to rain down from it
                "estimated_at": time.time(),
                "eta_seconds": prediction.get('time_to_rain_seconds') if prediction else None,
                "cells": ui_cells
            }

            cache_data = {
                "timestamp": time.time(),
                "values": values,
                "prediction": prediction,
                "ui_data": ui_data
            }

            temp_path = self.latest_analysis_path + ".tmp"
            with open(temp_path, 'w') as f:
                json.dump(cache_data, f)
            os.replace(temp_path, self.latest_analysis_path)
            logging.info(f"Analysis results saved to cache: {self.latest_analysis_path}")
        except Exception as e:
            logging.debug(f"Cache write skipped: {e}")

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

        prediction = None
        
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
        
        self._save_analysis_to_cache(values, prediction)
        self._update_entities(values)

        # Snapshot of this estimate so the time to rain can be counted down until the next cycle
        if values['time'] != self.defaults['no_rain']:
            self._eta_snapshot = {'minutes': values['time'], 'at': time.time(), 'sent': values['time']}
        else:
            self._eta_snapshot = None

        logging.info("\n" + "=" * 60)
        logging.info(f"FINAL VALUES TO BE SENT:")
        logging.info(f"  Time to rain: {values['time']} minutes")
        logging.info(f"  Distance: {values['distance']} km")
        logging.info(f"  Speed: {values['speed']} km/h")
        logging.info(f"  Direction: {values['direction']}°")
        logging.info(f"  Bearing: {values['bearing']}°")
        logging.info("=" * 60 + "\n")

    def _tick_countdown(self):
        """Count the time to rain down in Home Assistant using the time the estimate was made"""
        snapshot = self._eta_snapshot
        if not snapshot or not self.entities.get('time'):
            return

        remaining = snapshot['minutes'] - (time.time() - snapshot['at']) / 60.0
        value = 0 if remaining <= 0 else math.ceil(remaining)
        if value == snapshot['sent']:
            return

        snapshot['sent'] = value
        logging.info(f"Time to rain counted down to {value} minutes")
        try:
            self.ha_api.call_service("input_number/set_value", self.entities['time'], value)
        except Exception as e:
            logging.warning(f"Could not update the time to rain countdown: {e}")

    def _sleep_with_countdown(self, seconds):
        """Wait for the next analysis cycle, counting the time to rain down once a minute meanwhile"""
        end = time.time() + seconds
        while self.running:
            remaining = end - time.time()
            if remaining <= 0:
                break
            time.sleep(min(60.0, remaining))
            if end - time.time() > 1:
                self._tick_countdown()

    def run(self):
        """Main execution loop"""
        logging.info("Starting Rain Predictor main loop")
        self.running = True

        # Initial prediction
        self.run_prediction()

        try:
            while self.running:
                # Wait for next interval, counting the time to rain down in the meantime
                self._sleep_with_countdown(self.run_interval)

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