# Changelog

## 0.4.4 - 2025-11-06

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
