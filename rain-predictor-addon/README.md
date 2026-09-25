# Rain Predictor Home Assistant Addon

Advanced rain prediction using radar image analysis. Tracks rain cells across consecutive radar frames to predict arrival time at your location.

## Architecture Overview

The addon consists of three main components:

1. **rain_predictor.py** - Core prediction engine (background service)
2. **web_ui.py** - Flask web server (port 8099)
3. **templates/index.html** - Interactive Leaflet.js map frontend

### Data Flow

```
RainViewer API (https://api.rainviewer.com/public/weather-maps.json)
         ↓
    rain_predictor.py (runs every 3 minutes)
         ↓
    Extracts rain cells from 13 radar frames
         ↓
    Tracks movement across frames
         ↓
    Filters cells approaching user location
         ↓
    Home Assistant API (input_number entities)
         ↓
    web_ui.py serves cache to frontend
         ↓
    index.html displays on interactive map
```

## Core Components

### 1. RainCell Class (`rain_predictor.py:99-170`)

Represents a single rain cell being tracked across multiple radar frames.

**Key Attributes:**
- `id` - Unique cell identifier
- `positions` - List of (lat, lon, timestamp) tuples
- `intensity` - Maximum radar return intensity observed
- `last_seen` - Most recent timestamp

**Key Methods:**
```python
add_position(lat, lon, timestamp, intensity)
    # Adds validated position, stores last 10 positions max

get_velocity(predictor=None)
    # Returns (speed_kph, direction_deg) from last 2 positions
    # Requires 2+ positions to calculate
```

### 2. RainPredictor Class (`rain_predictor.py:172-1600+`)

Main prediction engine that orchestrates radar analysis.

**Initialization Flow:**
```
AddonConfig (loads /data/options.json)
    ↓
RainPredictor.__init__()
    ↓
Read configuration (latitude, longitude, entities, thresholds)
    ↓
Create HomeAssistantAPI client
    ↓
Initialize tracked_cells dictionary
```

**Main Loop (`run()`):**
```python
while running:
    run_prediction()  # Analyze radar, update entities
    sleep(run_interval)  # Default: 3 minutes
```

### 3. Radar Analysis Pipeline (`analyze_radar_data()`)

**Step 1: Fetch Radar Data**
```python
response = requests.get("https://api.rainviewer.com/public/weather-maps.json")
api_data = response.json()
# Returns: {host, radar: {past: [{time, path}, ...], nowcast: [...]}}
```

**Step 2: Extract Cells from Each Frame**

For each of the 13 past frames (10-minute intervals, 2 hours total):
```python
# Download the 3x3 block of 256x256 radar tiles around your location
# (zoom is capped at 7 - RainViewer does not serve higher zoom levels)
img_url = f"{host}{frame['path']}/256/{zoom}/{tile_x}/{tile_y}/{color}/{options}.png"

# Convert to grayscale and threshold
img_array = np.array(img.convert('L'))
rain_mask = (img_array > threshold).astype(np.uint8) * 255

# Label connected rain regions
labeled_array, num_features = label(rain_mask)

# For each region, calculate centroid
for region in regions:
    cell = {
        'current_lat': centroid_y,
        'current_lon': centroid_x,
        'intensity': max_intensity,
        'size': region_pixels
    }
```

**Step 3: Track Movement Across Frames**

Cells from consecutive frames are matched using:
```python
# Simple centroid distance matching
min_distance = float('inf')
best_match = None
for existing_cell in tracked_cells:
    distance = haversine(
        new_cell.centroid,
        existing_cell.positions[-1][:2]
    )
    if distance < threshold and distance < min_distance:
        best_match = existing_cell
```

**Step 4: Calculate Cell Velocity**

For cells with 2+ positions:
```python
(lat1, lon1, t1), (lat2, lon2, t2) = positions[-2:]

time_diff_hours = (t2 - t1).total_seconds() / 3600
distance_km = haversine(lat1, lon1, lat2, lon2)
speed_kph = distance_km / time_diff_hours
bearing = calculate_bearing(lat1, lon1, lat2, lon2)
```

**Step 5: Find the Next Cell to Reach You**

A cell only counts if its predicted path actually passes over your location. Being "somewhere
towards you" is not enough: a cell south-east of you moving west-south-west gets closer at first but
passes far to the south. Each tracked cell's speed and direction come from a straight-line fit through its
last few positions (far steadier than the last two frames), then:
```python
# Split the distance to the user into the part along the cell's path and the sideways miss distance
angle = cell_direction - bearing(cell -> user)
along_km = distance_km * cos(angle)
miss_km = abs(distance_km * sin(angle))

# It must be heading your way, and its path must pass within the cell's radius, plus a 5 km margin
# and 5 degrees of heading uncertainty (which is a bigger sideways error the farther away it is)
reaches_you = along_km > 0 and miss_km <= radius_km + 5 + distance_km * sin(5°)

# Arrival: when the leading edge of the cell gets here
eta_hours = (along_km - sqrt(radius_km**2 - miss_km**2)) / speed_kph
```
Of the cells that pass this test, the one that arrives first is reported. If none does, no rain is predicted.

**Step 6: Return Threat Assessment**

```python
return {
    'time_to_rain': minutes,      # ETA in minutes
    'distance_km': km,             # Distance to cell
    'speed_kph': kph,              # Cell speed
    'direction_deg': degrees,      # Movement direction
    'bearing_to_cell_deg': deg,    # Bearing from user to cell
    'rain_cell_latitude': lat,     # Current cell position
    'rain_cell_longitude': lon     # Current cell position
}
```

### 4. Home Assistant Integration (`_update_entities()`)

Updates input_number entities with prediction values:
```python
entities = {
    'time': input_number.rain_arrival_minutes,
    'distance': input_number.rain_prediction_distance,
    'speed': input_number.rain_prediction_speed,
    'direction': input_number.rain_cell_direction,
    'bearing': input_number.bearing_to_rain_cell,
    'rain_cell_latitude': input_number.rain_cell_latitude,
    'rain_cell_longitude': input_number.rain_cell_longitude
}

for entity_id, value in values.items():
    ha_api.call_service("input_number/set_value", entity_id, value)
```

**Required helper ranges.** When no rain is predicted the add-on writes its "no rain" defaults (`no_rain_value` 999, `no_direction_value` -1, `no_bearing_value` -1). Home Assistant rejects values outside a helper's range with `400 Bad Request`, so create the `input_number` helpers with at least these ranges. Helpers defined in YAML (`configuration.yaml`) can't be edited from the helper settings dialog: change `min` / `max` in the YAML, then reload them from Developer tools > YAML > Input numbers.

| Helper | Min | Max | Step |
|--------|-----|-----|------|
| `rain_arrival_minutes` | 0 | 1440 | 1 |
| `rain_prediction_distance` | 0 | 1000 | 1 |
| `rain_prediction_speed` | 0 | 200 | 0.1 |
| `rain_cell_direction` | -1 | 360 | 1 |
| `bearing_to_rain_cell` | -1 | 360 | 1 |
| `rain_cell_latitude` | -90 | 90 | 0.0001 |
| `rain_cell_longitude` | -180 | 180 | 0.0001 |

### 5. Web UI (`web_ui.py` + `templates/index.html`)

**Flask Endpoints:**
- `GET /` - Main configuration page
- `GET /api/data` - Returns cached prediction data, including `estimated_at` (when the estimate was made), `eta_seconds` (the precise time to rain at that moment), `server_time` (used to count the time to rain down from that estimate) and `track` (the tracked cell's position and highlight radius in each radar frame it was followed through)
- `POST /api/set_location` - Save lat/lng to options.json
- `POST /api/update_view_bounds` - Store current map view for focused analysis

**Frontend Features:**
- Leaflet.js map with radar overlay tiles
- User location marker (draggable)
- Rain cell markers (green circle for position, red for movement)
- Radar animation playback (13 frames)
- Color scheme selection
- Manual cell selection mode

## File Structure

```
rain-predictor-addon/
├── config.yaml              # HA addon configuration
├── Dockerfile               # Container build
├── requirements.txt         # Python dependencies
├── run.sh                   # Container startup script
├── rain_predictor.py        # Core prediction engine
├── web_ui.py                # Flask web server
├── CHANGELOG.md             # Version history
├── README.md                # This file
└── templates/
    └── index.html           # Web UI frontend
```

## Configuration

### Addon Options (`options.json`)

```json
{
  "latitude": -24.981262,
  "longitude": 151.865455,
  "entities": {
    "time": "input_number.rain_arrival_minutes",
    "distance": "input_number.rain_prediction_distance",
    "speed": "input_number.rain_prediction_speed",
    "direction": "input_number.rain_cell_direction",
    "bearing": "input_number.bearing_to_rain_cell",
    "rain_cell_latitude": "input_number.rain_cell_latitude",
    "rain_cell_longitude": "input_number.rain_cell_longitude"
  },
  "thresholds": {
    "rain_threshold": 75,
    "arrival_angle_threshold": 90,
    "lat_range_deg": 5.0,
    "lon_range_deg": 5.0
  },
  "image": {
    "size": 256,
    "zoom": 7
  }
}
```

### Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `rain_threshold` | 75 | Pixel intensity (0-255) to consider as rain |
| `arrival_angle_threshold` | 90 | Not used to decide whether a cell reaches you (see Step 5) |
| `lat_range_deg` | 5.0 | Latitude degrees covered by analysis |
| `lon_range_deg` | 5.0 | Longitude degrees covered by analysis |
| `run_interval` | 3.0 | Minutes between prediction cycles |

## Entity Values

| Entity | Value | Meaning |
|--------|-------|---------|
| `time` | 0 | Rain currently at location |
| `time` | 1-999 | Minutes until rain arrives |
| `time` | 999 | No rain detected |
| `direction` | 0-360° | Direction rain cell is moving |
| `direction` | -1 | No valid direction |
| `bearing` | 0-360° | Direction from user to cell |
| `bearing` | -1 | No valid bearing |

## Processing Timeline

```
Every 3 minutes:
├── Fetch radar metadata (13 frames, 10 min intervals)
├── Download 13 radar tiles (256x256 each)
├── Extract ~20 cells per frame (~260 total)
├── Match cells across frames to track movement
├── Calculate velocity for tracked cells
├── Filter for cells approaching user
└── Update HA entities with closest threat

Web UI:
├── Reads cached prediction from /data/latest_analysis.json
├── Displays user location on map
├── Overlays radar tiles with animation
└── Shows tracked rain cells with markers
```

## Dependencies

```
requests>=2.25.0      # HTTP API calls
numpy>=1.20.0         # Image processing
scipy>=1.6.0          # Connected component labeling
Pillow>=8.0.0         # Image handling
```

## Debug Mode

Enable debug logging:
1. Set log level to "Debug" in addon configuration
2. Check logs: `Settings → Add-ons → Rain Predictor → Log`

Key debug messages:
```
"Found X cells in frame Y"     - Cell extraction
"Movement analysis: X/Y cells" - Tracked movement
"Found Z threat cells"         - Approaching cells
"Track #N: X positions"        - Position history
```

## Troubleshooting

### No approaching cells detected
- Check location coordinates are accurate
- Verify radar data available for your region
- Lower `rain_threshold` if cells are being missed

### Inaccurate predictions
- Adjust `lat_range_deg`/`lon_range_deg` for zoom level
- Tune `arrival_angle_threshold` (lower = more strict)
- Check cell velocity calculation logs

### Addon won't start
- Verify input_number entities exist in HA
- Check SUPERVISOR_TOKEN is available
- Review logs for configuration errors

## Algorithm Limitations

1. **Single frame analysis** - Uses only past frames, not nowcast
2. **Centroid tracking** - May miss complex cell mergers/splits
3. **Linear extrapolation** - Assumes constant velocity
4. **2D assumption** - Doesn't account for vertical development
5. **No interpolation** - Velocity from discrete time steps

## Future Improvements

- [ ] Add nowcast integration for <30 min predictions
- [ ] Implement Kalman filtering for velocity smoothing
- [ ] Add cell intensity tracking (dBZ values)
- [ ] Support multiple radar sources
- [ ] Machine learning for cell lifetime prediction
