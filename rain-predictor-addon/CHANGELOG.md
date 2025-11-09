# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

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
