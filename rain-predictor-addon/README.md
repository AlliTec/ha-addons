# Rain Predictor

Predicts when the next rain will reach your location, using live radar from [RainViewer](https://www.rainviewer.com/).
It measures how the whole rain pattern is moving, looks upwind of your location for the first rain that is heading
your way, and keeps a countdown to its arrival in Home Assistant and on a live map.

- **Time to rain**, counting down in real time (to the second on the map, once a minute in Home Assistant)
- **How far away** the rain is, how fast it is moving, and in which direction
- **A live map** with the radar animation and a green highlight that follows the cell that will reach you
- **Sensors for automations**: warnings at 30, 15, 10 and 5 minutes, voice answers, dashboard cards
- Works anywhere RainViewer has radar coverage

## Contents

1. [Installation](#installation)
2. [Home Assistant entities (sensors)](#home-assistant-entities-sensors)
3. [Using the entities](#using-the-entities)
4. [Web UI](#web-ui)
5. [How it works](#how-it-works)
6. [Accuracy and limits](#accuracy-and-limits)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Code map and files](#code-map-and-files)

---

## Installation

1. In Home Assistant go to **Settings → Apps → App store → ⋮ → Repositories** and add
   `https://github.com/AlliTec/ha-addons`.
2. Install **Rain Predictor**.
3. Create the helpers it writes to (see [the helpers below](#create-the-helpers)).
4. Open the app's **Configuration** tab and set your **latitude** and **longitude** (you can also drag the location
   marker on the map and press *Save Location*).
5. Start the app and turn on **Show in sidebar**. The map opens from the sidebar, or directly at
   `http://<your-home-assistant>:8099/`.

The app needs Home Assistant's API (`homeassistant_api: true`) to write the helpers. It does not need an account or
an API key with RainViewer.

### Create the helpers

The app writes its results to `input_number` helpers. Add them to your `input_number:` YAML (or create them in
**Settings → Devices & services → Helpers**). The entity IDs are configurable, these are the defaults:

```yaml
input_number:
  rain_arrival_minutes:
    name: Rain Arrival Minutes
    initial: 999          # 999 = no rain; see "After a restart" below
    min: 0
    max: 1440
    step: 1
    mode: box
  rain_prediction_distance:
    name: Rain Prediction Distance
    initial: 0
    min: 0
    max: 1000
    step: 0.1
    unit_of_measurement: km
    mode: box
  rain_prediction_speed:
    name: Rain Prediction Speed
    initial: 0
    min: 0
    max: 200
    step: 0.1
    unit_of_measurement: km/h
    mode: box
  rain_cell_direction:
    name: Rain Cell Direction
    initial: 0
    min: -1
    max: 360
    step: 1
    unit_of_measurement: degrees
    mode: box
  bearing_to_rain_cell:
    name: Bearing to Rain Cell
    initial: 0
    min: -1
    max: 360
    step: 1
    unit_of_measurement: degrees
    mode: box
  rain_cell_latitude:
    name: Rain Cell Latitude
    initial: 0
    min: -90
    max: 90
    step: 0.0001
    mode: box
  rain_cell_longitude:
    name: Rain Cell Longitude
    initial: 0
    min: -180
    max: 180
    step: 0.0001
    mode: box
```

The ranges matter. When there is no rain the app writes its "no rain" values (999, -1, -1), and Home Assistant rejects
a value outside a helper's range with `400 Bad Request`, so the maximum of the distance helper must be at least 1000
and the minimum of the two direction helpers must be -1.

Helpers defined in YAML cannot be edited from the helper settings dialog. Change `min` / `max` in the YAML, then
reload them from **Developer tools → YAML → Input numbers**.

**After a restart.** Home Assistant resets a helper that has an `initial:` value every time it restarts. For
`rain_arrival_minutes` use `initial: 999`. With `initial: 0` the helper reads "raining now" until the app's first
analysis finishes, which can trigger automations that fire below a number of minutes.

---

## Home Assistant entities (sensors)

The app does not create entities of its own. It writes to the `input_number` helpers configured under `entities`
in the app's options, so they appear in Home Assistant as ordinary helpers you can use in dashboards, automations
and templates.

| Entity (default) | Unit | Meaning | When there is no rain |
|---|---|---|---|
| `input_number.rain_arrival_minutes` | minutes | Minutes until the next rain reaches you. **0** means there is rain over your location now | 999 |
| `input_number.rain_prediction_distance` | km | Distance from you to the leading edge of that rain | 999 |
| `input_number.rain_prediction_speed` | km/h | How fast the rain pattern is moving | 0 |
| `input_number.rain_cell_direction` | degrees | Direction the rain is moving *towards* (270 = moving west, so it comes from the east) | -1 |
| `input_number.bearing_to_rain_cell` | degrees | Compass bearing from you to the rain (90 = it is to your east) | -1 |
| `input_number.rain_cell_latitude` | degrees | Latitude of the centre of the cell that will reach you | left at its last value |
| `input_number.rain_cell_longitude` | degrees | Longitude of the centre of the cell that will reach you | left at its last value |

Only `entities.time` is required. Leave any of the others empty to skip it.

**How often they update**

- **Every analysis cycle** (every 3 minutes by default, `run_interval_minutes`): all values are recalculated
  from the newest radar and written.
- **Once a minute in between:** `rain_arrival_minutes` counts down from the time the estimate was made. It is written
  in whole minutes (rounded up) and reads 0 once the estimated arrival has passed, until the next analysis replaces
  the estimate. Nothing is written while there is no rain estimate.

**Reading the values**

- `time` **999** = no rain will reach you within the next 3 hours. `0` = there is echo over your location now.
- Direction is where the rain is going, bearing is where it is now. Rain coming from the east has a bearing of about
  90° and a direction of about 270°.
- The distance is to the *edge* of the rain that arrives first, which is consistent with the time. The
  latitude/longitude are the *centre* of that cell, and are only written while there is a cell to report.

**Also available: the web page's data**

The web UI serves the same data as JSON at `/api/data`, plus the fields the map uses: `estimated_at` (when the
estimate was made), `eta_seconds` (the time to rain in seconds at that moment), `server_time`, and `track` (the
tracked cell's position and size in each radar frame). It can be read with a REST sensor if you want it in Home
Assistant.

---

## Using the entities

These are examples to copy. They are not installed by the app.

### A sensor holding the arrival time

A `timestamp` sensor shows the clock time the rain arrives ("in 3 hours", "at 9:47 pm"). The helper counts down each
minute and its `last_updated` moves with it, so `last_updated + minutes` stays at the estimated arrival time.

```yaml
template:
  - sensor:
      - name: Rain Arrival (Minutes)
        unique_id: rain_arrival_minutes_sensor
        unit_of_measurement: minutes
        state: "{{ states('input_number.rain_arrival_minutes') | int(999) }}"

      - name: Rain ETA
        unique_id: rain_eta
        device_class: timestamp
        availability: "{{ states('input_number.rain_arrival_minutes') | int(999) < 999 }}"
        state: >
          {% set minutes = states('input_number.rain_arrival_minutes') | int(999) %}
          {{ (states.input_number.rain_arrival_minutes.last_updated + timedelta(minutes=minutes)).isoformat() }}
```

### Rain warnings

An automation that fires as the time to rain drops below a limit, with a phone notification and a spoken message:

```yaml
automation:
  - alias: Rain warning - 15 minutes
    triggers:
      - trigger: numeric_state
        entity_id: input_number.rain_arrival_minutes
        below: 15
    conditions:
      - condition: template
        value_template: >
          {{ this.attributes.last_triggered is none or
             (now() - this.attributes.last_triggered).total_seconds() > 5 * 60 }}
    actions:
      - action: notify.mobile_app_your_phone
        data:
          title: Weather Warning
          message: Rain in 15 minutes.
      - action: tts.speak
        target:
          entity_id: tts.piper
        data:
          media_player_entity_id: media_player.your_speaker
          message: I have detected an approaching rain cell. E.T.A. is fifteen minutes.
```

A `numeric_state` trigger only fires when the value *crosses* the limit, so it does not fire again while the value
stays below it. Use the `initial: 999` helper setting above so a restart does not count as a crossing.

### A voice question

Save as `custom_sentences/en/rain.yaml`:

```yaml
language: "en"
intents:
  RainArrivalIntent:
    data:
      - sentences:
          - "when will it rain [next]"
          - "when is the next rain"
          - "how long (until|till) it rains"
          - "is it going to rain [soon]"
```

and add to your `intent_script:` file:

```yaml
RainArrivalIntent:
  speech:
    text: >-
      {% set m = states('input_number.rain_arrival_minutes') | int(999) %}
      {% if m >= 999 %} No rain is expected soon.
      {% elif m <= 0 %} Rain is at your location now.
      {% else %}
        {% set eta = (states.input_number.rain_arrival_minutes.last_updated + timedelta(minutes=m)) | as_local %}
        Rain is expected in {{ m }} minute{{ 's' if m != 1 }}, at around {{ eta.strftime('%-I:%M %p') }}.
      {% endif %}
```

Reload with **Developer tools → YAML → Intent script** and **Conversation**.

### The map on a dashboard

Add an iframe card that shows the app's page:

```yaml
type: iframe
url: http://192.168.1.10:8099/      # your Home Assistant's address and the app's port
aspect_ratio: 110%
```

This loads the page straight from the app's port, so it works when you open Home Assistant over plain `http://` on
your home network. It will not work through an `https://` address (a browser will not show an `http` page inside an
`https` one), so give Home Assistant a fixed address if you use it this way. In a card under 700 px wide the page uses
a compact layout, described below.

---

## Web UI

The map is at `http://<home-assistant>:8099/` and in the sidebar (it uses Home Assistant ingress).

- **Map and radar:** the radar animation for the last 2 hours (13 frames), with your location as a draggable marker.
  Base map styles: Light, Standard, Satellite, Terrain. Several radar colour schemes.
- **Green highlight:** a soft green ring around the cell that will reach you first. It moves with the cell as the
  animation plays, is sized to the cell, and is hidden in frames from before the cell existed.
- **Readings bar:** time to rain, distance, speed, direction and bearing. The time counts down every second from the
  time the estimate was made (`33m 12s`, `1h 08m 34s`, then `NOW`).
- **Controls:** play or pause, animation speed, colour scheme, map style, *Save Location*, and *Manual Select* (click a
  point to follow it along the storm's direction).
- **Compact layout:** in windows under 700 px wide (a dashboard card, a phone) the readings bar becomes a single line
  and the map opens at zoom 9 instead of 10, showing about twice the area. The compact layout keeps its own saved
  settings, separate from the full size page.

**Endpoints**

| Endpoint | Purpose |
|---|---|
| `GET /` | The map page |
| `GET /api/data` | The latest prediction as JSON (see above) |
| `POST /api/set_location` | Save a new latitude and longitude to the app's options (and, if the helpers `input_number.rain_prediction_latitude` / `rain_prediction_longitude` exist, to them too) |
| `POST /api/update_config` | Save a new latitude and longitude to the app's options |
| `POST /api/manual_selection` | Estimate the motion of the radar pattern in the current map view (Manual Select) |
| `POST /api/update_view_bounds` | Store the current map view (kept for compatibility; it no longer affects the prediction) |
| `GET /health` | Health check (used by Docker) |

---

## How it works

```
RainViewer radar (13 frames, 10 minutes apart = the last 2 hours)
        ↓  every 3 minutes
Download the radar tiles around you (only frames not already downloaded)
        ↓
Turn each frame into a map of where there is rain
        ↓
Measure how the WHOLE rain pattern is moving
        ↓
Look UPWIND from your location for the first rain heading your way
        ↓
Time to rain, distance, speed, direction, and the cell that arrives
        ↓
Home Assistant helpers  +  cache for the map  (+ a countdown once a minute)
```

**1. Read the radar.** For each frame the app downloads the 3×3 block of radar tiles around your location (RainViewer
serves tiles up to zoom 7, which is about 1 km per pixel; at latitude 25° the block covers roughly 850 km across, so
at least 280 km in every direction. The block is smaller at higher latitudes). A pixel counts
as rain when it is brighter than `rain_threshold`, and specks smaller than 5 pixels are ignored. A frame never changes
once published, so each is downloaded only once.

**2. Measure the motion of the whole pattern.** Tracking single cells does not work well: a cell's centre wobbles by
several km between frames as it grows, shrinks, merges and splits, so neighbouring cells can appear to move in
completely different directions. Instead the motion of the whole pattern within about 220 km of you is measured from
all the rain at once. The radar intensity is blurred (about 7 km) and compared between the newest few frames and the
frames 4 and 6 steps earlier (40 and 60 minutes at the usual 10 minute spacing), and the median of those comparisons
is taken. Long baselines are used because over 10 or 20 minutes the pattern can barely change, or the picture can
jump after a slow radar update, while over 40 to 60 minutes the net movement is clear. The median means a few bad
comparisons cannot decide the answer. This gives one speed and one direction for the weather around you, and it
follows the pattern as it speeds up or slows down. If the rain barely moves (under 3 km/h) or the frames do not
match, the motion is treated as unmeasurable and no rain is predicted.

**3. Look upwind for the first rain.** Walk backwards from your location along that motion, one minute at a time, for
up to 3 hours. The rain you find there is the rain that will reach you, and how far you walked is the time to rain. Two
allowances apply:

- The path only has to pass near rain to count: within 5 km, plus 5 degrees of heading uncertainty, which is a
  bigger sideways error the farther away the rain is.
- The time to rain is when the edge of the echo gets within 3 km of you, or the time of closest approach if the path
  only skirts the rain.

If there is already echo over your location the time is 0. If nothing upwind will reach you within 3 hours, no rain is
predicted. Rain that passes to the side of you is not reported.

**4. Follow the cell that arrives.** The cell is the rain within 12 km of the point where the path meets it, that is the
part that is about to reach you, not a whole widespread rain shield, which can be hundreds of km across. It is followed
back through the earlier frames by where the measured motion says it was, and only in frames where there really was rain
around that spot. That track, with the cell's size in each frame, is what the map's green highlight follows. The
`rain_cell_latitude` / `rain_cell_longitude` helpers hold the centre of this cell.

**5. Report.** The values are written to the helpers and a JSON cache the map reads. Between analyses the countdown
keeps the time to rain up to date.

### Timeline

```
Every run_interval_minutes (default 3):
├── Fetch the radar frame list from RainViewer
├── Download radar tiles for frames not seen before (the first run after a start downloads all 13)
├── Measure motion, search upwind, follow the cell (about half a second on a PC)
├── Write the helpers and the cache for the map
└── Every 60 seconds until the next run: count rain_arrival_minutes down

Web page:
├── Polls /api/data every 5 seconds
├── Counts the time to rain down every second
└── Moves the green highlight with the animation
```

---

## Accuracy and limits

The method was tested against simulated weather where the true answer is known (200 random scenes with clutter, and cells
that each move a little differently), and by replaying the last two hours of real radar for one location:

- Rain that really arrived within 3 hours was predicted in about **90%** of scenes, and **100%** for rain within the hour.
- The median timing error was about **3 minutes** (80% of predictions were within 10 minutes).
- Warnings less than an hour ahead had no clear-cut false alarms. Every false alarm was a cell that really did come
  within 15 km. Over all the dry scenes, 20% produced a warning, but only 5% when no cell came within 15 km.
- A cell passing 60 km to one side of you is correctly not reported.
- On a real evening where the rain slowed from 25 km/h to about 9 km/h, the measured motion followed the slowdown
  and gave a prediction at every step, where measuring over short 10 to 30 minute gaps had lost the motion altogether.

These are results on simulated weather and one real replay, not a guarantee. Limits to know about:

1. **Rain that forms or grows over you cannot be predicted from motion.** A patch of drizzle that suddenly develops near
   your location will appear without warning.
2. **The pattern is assumed to keep moving at its current speed and direction.** Storms that speed up, slow down or
   change direction are not anticipated. The motion is measured over the last 40 to 60 minutes, so a recent slowdown
   or change of direction shows up with some delay, and when the rain is moving slowly its direction is less certain.
3. **Three hour lookahead.** Beyond about 3 hours the heading uncertainty grows so large that predictions are
   unreliable (`FLOW_MAX_HORIZON_MIN` in `rain_predictor.py`). Further rain shows as no rain until it comes within 3 hours.
4. **Faint echoes count as rain.** Any echo brighter than `rain_threshold` counts, including the lightest drizzle, so
   a time to rain of 0 can mean very light rain. There is no rain intensity or severity yet.
5. **Only past frames are used**, not RainViewer's forecast frames.
6. **Coverage and quality depend on RainViewer's radar** for your region.

---

## Configuration

Options are in the app's **Configuration** tab (stored in `/data/options.json`).

| Option | Default | Description |
|---|---|---|
| `latitude`, `longitude` | | Your location (also set by dragging the marker on the map) |
| `run_interval_minutes` | 3 | Minutes between analyses (1 to 60) |
| `api_url` | RainViewer's public URL | Where the radar frame list comes from |
| `entities.time` | `input_number.rain_arrival_minutes` | Required. Helper for the time to rain |
| `entities.distance`, `speed`, `direction`, `bearing` | see the table above | Optional helpers |
| `entities.rain_cell_latitude`, `rain_cell_longitude` | see the table above | Optional helpers |
| `defaults.no_rain_value` | 999 | Written to the time and distance helpers when there is no rain |
| `defaults.no_direction_value`, `no_bearing_value` | -1 | Written to the direction and bearing helpers when there is no rain |
| `image_settings.size` | 256 | Radar tile size in pixels (256 or 512; 128 falls back to 256) |
| `image_settings.zoom` | 7 | Radar tile zoom. Capped at 7 because RainViewer does not serve tiles above that |
| `image_settings.color_scheme` | 3 | RainViewer colour scheme for the tiles the analysis reads |
| `image_settings.options` | `0_0` | RainViewer tile options (smooth and snow flags) |
| `analysis_settings.rain_threshold` | 50 | How bright a radar pixel must be (1 to 255) to count as rain. Raise it to ignore the faintest echoes |
| `debug.log_level` | DEBUG | `DEBUG`, `INFO`, `WARNING` or `ERROR` |

These options are kept so existing configurations stay valid, but **no longer affect the prediction**:
`analysis_settings.lat_range_deg`, `lon_range_deg`, `arrival_angle_threshold_deg`, `tracking_settings.max_tracking_distance_km`,
`min_track_length` and `debug.save_images`. They were used by the earlier per-cell tracking, which the prediction no longer
uses.

---

## Troubleshooting

Open the app's **Log** tab. Useful lines:

```
Rain pattern is moving 21.0 km/h towards 275°     - the measured motion of the whole pattern
Rain arrives in 26 min: leading edge 24.4km away ... - a prediction, with the cell that was followed
No rain upwind of the location                    - nothing in the path within 3 hours
The motion of the rain pattern could not be measured reliably - too little rain around to measure
Time to rain counted down to 25 minutes           - the once a minute countdown
```

**The helpers show errors or `400 Bad Request` in the log.** A helper's range is too small for the values the app writes
(999, -1). See [Create the helpers](#create-the-helpers). If the helpers are defined in YAML, change them there and
reload them; editing them in the helper dialog does nothing.

**The map says "The app is starting" and the app keeps restarting about every minute.** Update to 1.1.70 or later. Older
versions used a Docker health check that failed on Home Assistant's network, and the Supervisor kept restarting the app.

**The map shows "API KEY REQUIRED" tiles or "Zoom Level Not Supported" radar.** Update to 1.1.65 or later. The old base
map provider began requiring an API key and RainViewer stopped serving radar tiles above zoom 7.

**The time to rain reads 0 but it is not really raining.** A faint echo is over your location. Raise
`analysis_settings.rain_threshold` to ignore the lightest echoes.

**Rain is visible on the map but nothing is predicted.** It may be more than 3 hours away, it may be passing to one side
of you, or there may be too little rain around to measure the pattern's motion reliably.

**The time to rain is 0 after every Home Assistant restart.** Give the helper `initial: 999` (see above).

**Automations fire when they should not.** Automations with a `numeric_state` trigger fire when the value crosses the
limit, including from 999 straight to a small number. Use a condition to limit how often they can run.

**The app will not start.** Check that the helper named in `entities.time` exists, and look at the log for the error.

---

## Code map and files

| Where | What it does |
|---|---|
| `rain_predictor.py` `run()` | Main loop: run an analysis, then wait `run_interval_minutes`, counting the time to rain down each minute |
| `run_prediction()` | One cycle: fetch the frame list, analyse, save the cache, write the helpers |
| `analyze_radar_data()` | Runs the prediction for one set of frames |
| `_fetch_radar_mosaic()` | Downloads and stitches the 3×3 tile block for a frame (cached per frame) |
| `_bulk_motion()`, `_ncc_shift()` | Measure the motion of the whole pattern |
| `_predict_from_radar_flow()` | The upwind search, the arrival time and the tracked cell |
| `_save_analysis_to_cache()` | Writes `/data/latest_analysis.json` for the map |
| `_update_entities()`, `_tick_countdown()` | Write the helpers, and count the time down between cycles |
| `web_ui.py` | Flask server for the map (port 8099) |
| `templates/index.html` | The map page (Leaflet) |

```
rain-predictor-addon/
├── config.yaml              # Home Assistant app configuration and options
├── Dockerfile               # Container build (with its health check)
├── requirements.txt         # Python dependencies
├── run.sh                   # Starts the web server and the prediction service
├── rain_predictor.py        # Prediction engine
├── web_ui.py                # Flask web server
├── templates/index.html     # Web UI
├── icon.png, logo.png       # App icon and logo
├── CHANGELOG.md             # Version history
├── README.md                # This file
├── run_local.sh             # Run both services locally for development
├── test_*.py                # Older test scripts
└── dashboard/               # A demo React component with mock data (not used by the app)
```

Some older functions from the earlier per-cell tracking (`RainCell`, `_extract_cells_from_all_frames`,
`_find_threatening_cell` and related) remain in `rain_predictor.py` but are not called by the current prediction.

**Dependencies:** `requests`, `numpy`, `scipy`, `Pillow` and `flask`, installed by the Dockerfile.

**Running locally:** with the Python dependencies installed, `./run_local.sh` starts both services using the options in
`test_data/options.json` and writes its log to `addon.log`. No Home Assistant is connected, so writing the helpers fails
(and is logged), but the map and the analysis work. `docker build -t rain-predictor .` builds the same image Home
Assistant uses.

See `CHANGELOG.md` for the history of changes.

## Possible future improvements

- Rain intensity and severity (using the radar colours as an estimate of rainfall rate)
- Ignore very faint echoes by intensity instead of a single brightness threshold
- Use RainViewer's forecast frames for short-term prediction
- Support other radar sources

## License

MIT. See `LICENSE`.
