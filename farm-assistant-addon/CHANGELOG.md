# Changelog

## 0.2.2 - 2025-11-06

### Fixed

- Resolved Docker build failure by explicitly installing `python3` and `py3-pip`.

### Fixed

- Resolved Docker build failure by adding `asyncpg` and `postgresql-dev` dependencies.

### Added

- Web interface for managing livestock records.
- CRUD (Create, Read, Update, Delete) functionality for animals.
- Dynamic forms for different animal types (Cattle, Dog, Cat, Chicken, Guinea Fowl).
- Direct database integration with TimescaleDB.
