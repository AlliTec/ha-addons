# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

## Version 1.1.26 (2025-11-10)

### Rain Detection Sensitivity Improvements
- **Lowered Rain Threshold**: Reduced from 75 to 50 to detect lighter rain cells
- **Relaxed Angle Requirements**: Increased arrival angle threshold from 45° to 90° for less restrictive threat assessment
- **Enhanced Cell Detection Logging**: Added detailed logging of detected cells per frame
- **Improved Threat Evaluation**: Better debugging of why cells are/aren't considered threats
- **Analysis Settings Visibility**: Logs now show current threshold and angle settings

## Version 1.1.25 (2025-11-10)

### Enhanced API Debugging
- **Detailed API Response Logging**: Added comprehensive logging to inspect API data contents
- **Data Type Validation**: Enhanced logging to check speed/distance/direction data types and values
- **Metrics Investigation**: Better visibility into why API returns 0.0 KPH and -1.0° direction
- **Backend-Frontend Sync**: Improved debugging to trace data flow from backend to frontend

## Version 1.1.24 (2025-11-10)

### Revolutionary View Synchronization
- **Map View Synchronization**: Frontend now sends current map bounds to backend for focused analysis
- **Dynamic View Tracking**: Real-time sync on zoom/pan to track exactly what user sees
- **Focused Cell Analysis**: Backend uses user's view center and zoom for precise rain cell detection
- **View Size Calculation**: Calculates viewable area in km using map bounds and scale
- **Enhanced Accuracy**: Analysis now focuses on user's actual view instead of fixed location

## Version 1.1.23 (2025-11-10)

### Critical Tracking Improvements
- **Enhanced Cell Matching Algorithm**: Added directional prediction for better rain cell tracking between frames
- **Improved Scoring System**: Combined distance with directional consistency to avoid wrong cell matches
- **Reduced Tracking Distance**: Changed max tracking distance from 30km to 15km for better accuracy
- **Position Projection**: Added _project_position method to predict expected cell movement
- **Better Track Validation**: Increased minimum track length from 2 to 3 for more reliable velocity calculations

## Version 1.1.22 (2025-11-10)

### Debugging Enhancements
- **Velocity Calculation Debug**: Added detailed logging for rain cell speed and direction calculation
- **Position Tracking Debug**: Enhanced logging to track rain cell position changes over time
- **Performance Investigation**: Added debug data to investigate unrealistic 229.2 KPH speed issue

## Version 1.1.21 (2025-11-10)

### Critical Fixes
- **Backend API Coordinate Field Names**: Fixed web_ui.py sending rain cell coordinates as "latitude/longitude" instead of "rain_cell_latitude/rain_cell_longitude"
- **Tracker Starting Position**: Tracker now correctly starts from rain cell location instead of user location
- **API Data Consistency**: Frontend now receives properly named coordinate fields matching expected format

## Version 1.1.20 (2025-11-10)

### Critical Fixes
- **Fixed Simulated Data Missing Rain Cell Coordinates**: Resolved issue where fallback data didn't include rain_cell_latitude/rain_cell_longitude
- **Enhanced API Debugging**: Added response status logging to identify API failures
- **Corrected Tracker Data Source**: Fixed simulated data to provide proper rain cell coordinates
- **Maintained Rain Cell Start Position**: Tracker now starts from detected rain cell, not user location

### Technical Improvements
- **API Response Logging**: Added detailed logging for response status and data
- **Simulated Data Enhancement**: Demo data now includes realistic rain cell coordinates
- **Coordinate Consistency**: Both real and simulated data paths now provide rain cell coordinates
- **Debug Visibility**: Better visibility into API success/failure states

### Configuration Updates
- **Version Bump**: Incremented to v1.1.20 for simulated data fix
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Tracker Visibility**: Green tracker marker now appears in both real and demo modes
- **Correct Starting Position**: Tracker starts from rain cell location in all scenarios
- **Robust Fallback**: Demo mode provides realistic rain cell tracking
- **Debug Capability**: Enhanced logging for troubleshooting API issues

## Version 1.1.19 (2025-11-10)

### Critical Fixes
- **Fixed NaN Tracker Coordinates**: Resolved issue where rain cell tracker failed to appear due to NaN coordinates
- **Added Coordinate Validation**: Enhanced debugging for rain_cell_latitude and rain_cell_longitude values
- **Fixed Longitude Calculation**: Resolved NaN propagation in coordinate offset calculations
- **Added Fallback Logic**: Tracker now falls back to user location if rain cell coordinates are invalid

### Technical Improvements
- **Enhanced Debug Logging**: Added detailed logging for API response data and coordinate parsing
- **Safety Checks**: Added validation for invalid center coordinates before calculations
- **Error Prevention**: Comprehensive NaN checking throughout tracker creation and animation
- **Coordinate Robustness**: Better handling of missing or invalid rain cell coordinate data

### Configuration Updates
- **Version Bump**: Incremented to v1.1.19 for NaN coordinate fix
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Tracker Visibility**: Green tracker marker now appears when rain cell coordinates are available
- **Graceful Degradation**: Falls back to user location if rain cell data is invalid
- **Debug Capability**: Enhanced logging for troubleshooting coordinate issues
- **Stability**: Prevents NaN crashes in tracker animation calculations

## Version 1.1.18 (2025-11-10)

### Critical Fixes
- **Fixed Tracker Starting Position**: Resolved issue where tracker started from user location instead of rain cell location
- **Corrected Coordinate Usage**: Changed from user coordinates (latitude/longitude) to rain cell coordinates (rain_cell_latitude/rain_cell_longitude)
- **Maintained Correct Direction**: Kept direction as travel direction (not opposite), since Direction=travel TO, Bearing=coming FROM

### Technical Improvements
- **Data Source Correction**: Tracker now properly starts from actual rain cell position
- **Coordinate System**: Fixed confusion between user location and rain cell location data
- **Direction Logic**: Corrected understanding - Direction=travel direction, Bearing=source direction

### Configuration Updates
- **Version Bump**: Incremented to v1.1.18 for tracker position fix
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Correct Tracking Path**: Tracker now starts from rain cell and moves toward user location
- **Accurate Animation**: Green marker follows proper trajectory from cell to user
- **Proper Distance**: Shows realistic movement path instead of starting from user location

## Version 1.1.17 (2025-11-10)

### Critical Fixes
- **Fixed Tracker Direction Bug**: Resolved critical issue where auto-tracker moved opposite direction to rain cell movement
- **Direction Calculation Fix**: Added 180° to direction to convert from "coming FROM" to "going TO" bearing
- **Animation Alignment**: Tracker now moves in same direction as rain cell movement toward user location

### Technical Improvements
- **Coordinate System Correction**: Backend reports where rain is coming FROM, frontend needs where it's going TO
- **Vector Mathematics**: Applied proper directional vector addition (bearing + 180°) for correct animation
- **Movement Synchronization**: Tracker now follows actual rain cell path instead of opposite trajectory

### Configuration Updates
- **Version Bump**: Incremented to v1.1.17 for critical direction fix
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Correct Tracking**: Auto-tracker now moves ESE when rain cells move ESE (previously moved NNW)
- **Predictive Accuracy**: Animation shows proper interception trajectory toward user location
- **User Experience**: Green tracker marker now correctly follows threatening rain cell path

## Version 1.1.16 (2025-11-09)

### Debug Enhancements
- **Enhanced Distance Debug Logging**: Added detailed logging for speed, time, and distance calculations
- **Frame Timing Debug**: Added logging for frame timestamps and time differences
- **Zero Distance Diagnosis**: Enhanced debugging to identify why tracker distance is 0.00km

### Technical Improvements
- **Root Cause Analysis**: Better debugging for tracker movement issues
- **Time Calculation Debug**: Detailed logging for frame timing and time differences
- **Speed Analysis**: Enhanced logging for rain cell speed values

### Configuration Updates
- **Version Bump**: Incremented to v1.1.16 for enhanced debugging
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Issue Diagnosis**: Enhanced ability to identify why tracker shows 0.00km distance
- **Debug Precision**: More detailed logging for troubleshooting tracker movement
- **Problem Resolution**: Better tools for identifying distance calculation issues

## Version 1.1.15 (2025-11-09)

### Debug Features
- **Added Tracker Debug Logging**: Enhanced console logging for auto-tracker position calculations
- **Direction Calculation Debug**: Added detailed logging for direction, distance, and coordinate offsets
- **Position Tracking Debug**: Added logging for new tracker positions during animation

### Technical Improvements
- **Troubleshooting Support**: Enhanced debugging capabilities for tracker movement issues
- **Console Output**: Detailed logging for direction calculation and coordinate updates
- **Animation Debug**: Real-time tracking of tracker position calculations

### Configuration Updates
- **Version Bump**: Incremented to v1.1.15 for debug enhancement
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Debug Visibility**: Enhanced ability to diagnose tracker movement issues
- **Development Support**: Better tools for troubleshooting auto-tracker functionality
- **Issue Resolution**: Improved debugging for incorrect tracker direction problems

## Version 1.1.14 (2025-11-09)

### Critical Fixes
- **Fixed AttributeError**: Resolved `'RainPredictor' object has no attribute 'save_images'` error
- **Fixed Variable Name**: Corrected `self.save_images` to `self.save_debug_images` in rain_predictor.py
- **Fixed Version Consistency**: Updated all files to use consistent v1.1.14 versioning

### Technical Improvements
- **Runtime Stability**: Addon now starts without Python attribute errors
- **Variable Consistency**: Aligned variable usage with actual attribute definitions
- **Error Prevention**: Fixed startup crashes due to missing attributes

### Configuration Updates
- **Version Bump**: Incremented to v1.1.14 for critical runtime fix
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Startup Success**: Addon now initializes and runs without crashing
- **Service Stability**: Rain prediction service starts correctly
- **User Experience**: Eliminates addon startup failures

## Version 1.1.13 (2025-11-09)

### Critical Fixes
- **Fixed Docker Build Error**: Resolved `externally-managed-environment` error in Docker build
- **Added --break-system-packages Flag**: Fixed pip install command to work with newer Python environments
- **Fixed Version Consistency**: Updated all files to use consistent v1.1.13 versioning

### Technical Improvements
- **Docker Compatibility**: Addon now builds successfully with updated Python package management
- **Build Process**: Resolved exit code 1 during Docker image creation
- **Environment Handling**: Properly handles externally managed Python environments

### Configuration Updates
- **Version Bump**: Incremented to v1.1.13 for critical Docker build fix
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Build Success**: Addon now builds and deploys without Docker errors
- **Deployment Ready**: Fixed blocking issue preventing addon installation
- **Stability**: Resolved build pipeline failures

## Version 1.1.12 (2025-11-09)

### Critical Fixes
- **Fixed JavaScript Error**: Resolved `Uncaught ReferenceError: updateTracker is not defined` error in index.html:785
- **Added Missing updateTracker Function**: Implemented complete tracker position updating functionality for auto-tracking animation
- **Fixed Version Consistency**: Updated all files to use consistent v1.1.12 versioning

### Technical Improvements
- **Enhanced Auto-Tracker**: Rain cell tracking animation now works properly with position updates
- **Tracker Functionality**: updateTracker() now properly updates circle, pulse, arrow, and prediction line positions
- **Code Quality**: Improved JavaScript function organization and error handling

### Configuration Updates
- **Version Bump**: Incremented to v1.1.12 for critical JavaScript bug fix
- **File Alignment**: Synchronized versions across config.yaml, Dockerfile, and rain_predictor.py

### Impact
- **Core Functionality Restored**: Auto-tracker feature now functions without JavaScript errors
- **Stability**: Eliminated console spam and improved user experience
- **Animation Support**: Rain cell tracking animation now works correctly during movement
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.11] - 2025-11-09
### Fixed
- Version consistency across all files (config.yaml, Dockerfile, rain_predictor.py)
- Missing rain_cell_latitude and rain_cell_longitude entities in test_data/options.json
- Schema validation missing entity definitions in config.yaml
- Duplicate debug settings assignment in rain_predictor.py
- Dockerfile using problematic --break-system-packages flag
- Unused dependencies (flask-cors, paho-mqtt) in requirements.txt
### Changed
- Updated version from 1.1.10-debug to 1.1.11 for stable release
- Cleaned up dependency management for better compatibility

## [1.1.10-debug] - 2025-11-01
### Added
- Extensive logging to the `createTracker` function in the web UI to help diagnose the missing auto-track marker.

## [1.1.9-debug] - 2025-11-01
### Changed
- Auto track marker color and style updated for better visibility.

## [1.1.8-debug] - 2025-11-01
### Fixed
- Reverted threat detection logic to use bearing from cell to location, while displaying bearing from location to cell in the UI.

## [1.1.7-debug] - 2025-11-01
### Changed
- Auto track marker is now a circle around the tracked cell for better visibility.

## [1.1.6-debug] - 2025-11-01
### Fixed
- Auto track marker not appearing due to a JavaScript error.
- Rain cell tracking accuracy improved by ensuring cell coordinates are always sent to the UI.
### Added
- Additional logging to help diagnose tracking issues.

## [1.1.4-debug] - 2025-11-01
### Fixed
- Location marker appearing in incorrect location (Antarctica) by ensuring user's configured latitude/longitude are passed to the UI.

## [1.1.3-debug] - 2025-11-01
### Fixed
- Addon crashing due to `IndentationError` in `web_ui.py`.
- Auto track marker not moving and sitting over location marker.
- Auto track marker size unchanged (now reduced to half).
- Auto track prediction logic refined to start from the current rain cell location.

## [1.1.2-debug] - 2025-11-01
### Fixed
- Auto track marker not tracking the target cell by exposing rain cell coordinates (`rain_cell_latitude`, `rain_cell_longitude`) to Home Assistant entities from `rain_predictor.py`.
### Added
- `input_number.rain_cell_latitude` and `input_number.rain_cell_longitude` entities to `config.yaml` for tracking rain cell location.

## [1.1.1-debug] - 2025-11-01
### Fixed
- Web UI not displaying metrics (Time to Rain, Distance, Speed, Direction, Bearing) by correctly passing `all_data` to `index.html` and updating `updateDataDisplay` to use direct values.
### Changed
- Updated version number in `config.yaml`, `Dockerfile`, and `rain_predictor.py`.
