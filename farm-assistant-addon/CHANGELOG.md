# Changelog

## 0.6.0 - 2025-11-06

### Changed

- Moved Livestock List table to the top of the page.
- Added logging to debug database queries.

## 0.5.9 - 2025-11-06

### Added

- Added import_data.py script to populate the database from data.csv.

## 0.5.8 - 2025-11-06

### Changed

- Updated database schema to match actual columns from data.csv: added tag_id, health_status, notes, created_at, dam_id, sire_id, photo_path, pic, dod; removed animal_type.
- Updated form, table, and API to include all columns.
- Simplified form to static Cattle breeds and genders.

## 0.5.7 - 2025-11-06

### Changed

- Renamed "Animal List" to "Livestock List" for better terminology.

## 0.5.6 - 2025-11-06

### Added

- Server-side rendering of animal list table for immediate display on page load.

## 0.5.5 - 2025-11-06

### Fixed

- Changed static file links to relative paths for proper loading with Home Assistant ingress.

## 0.5.4 - 2025-11-06

### Fixed

- Fixed static directory path to use absolute path, resolving startup failure and CSS not being applied.

## 0.5.3 - 2025-11-06

### Changed

- Implemented a "2001: A Space Odyssey" inspired high-contrast dark mode theme.

### Changed

- Improved CSS styling with proper dark mode support and modern design.

### Fixed

- Fixed static and templates directory paths to use absolute paths.

### Changed

- Restructured addon to follow the proven pattern from rain-predictor-addon.
- Moved application files to `/app/` instead of `/data/`.
- Moved `run.sh` to `/` (root) instead of `/data/`.
- Re-added `CMD [ "/run.sh" ]` to the Dockerfile.

### Fixed

- Added execute permissions to `run.sh` in the `Dockerfile`.

### Fixed

- Removed the `CMD` line from the `Dockerfile` that was preventing the `run.sh` script from executing.

### Fixed

- Implemented a robust debugging `run.sh` script to diagnose the persistent startup error.

### Fixed

- Added missing `jinja2` dependency to the `Dockerfile`.

### Fixed

- Used the `--app-dir` flag in `run.sh` to explicitly specify the application directory.

### Fixed

- Simplified `run.sh` to its bare essentials for debugging.

### Fixed

- Added a file listing command to `run.sh` to debug the `Could not import module "main"` error.

### Changed

- Consolidated all Python code into a single `main.py` file to resolve persistent import errors.

### Changed

- Added verbose logging to the startup process to aid in debugging configuration issues.
- Clarified in the README that the database host should be the slug of the TimescaleDB addon.

### Added

- Added a database connection check on startup to validate the addon's configuration.

### Fixed

- Added `chmod` to `run.sh` to ensure correct file permissions.
- Combined `cd` and `uvicorn` commands to guarantee correct working directory.

### Fixed

- Set `PYTHONPATH` in `run.sh` to resolve module import errors.

### Changed

- Refactored database connection to use configuration options instead of a hardcoded URL.

### Fixed

- Corrected the `run.sh` script to change to the correct working directory before starting the application.

### Fixed

- Refactored the FastAPI application to use `APIRouter` to resolve a startup error.

### Fixed

- Resolved Docker build failure by adding the `--break-system-packages` flag to the `pip3 install` command.

### Fixed

- Resolved Docker build failure by explicitly installing `python3` and `py3-pip`.

### Fixed

- Resolved Docker build failure by adding `asyncpg` and `postgresql-dev` dependencies.

### Added

- Web interface for managing livestock records.
- CRUD (Create, Read, Update, Delete) functionality for animals.
- Dynamic forms for different animal types (Cattle, Dog, Cat, Chicken, Guinea Fowl).
- Direct database integration with TimescaleDB.
