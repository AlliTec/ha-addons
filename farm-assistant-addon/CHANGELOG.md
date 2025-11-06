# Changelog

## 0.2.6 - 2025-11-06

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
