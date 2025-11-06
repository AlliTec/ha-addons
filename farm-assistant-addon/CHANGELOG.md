# Changelog

## 0.9.5 - 2025-11-07

### Changed

- The `dod` field is now automatically cleared if the animal's status is not 'Deceased'.
- The `status` field is now included in the update functionality.

## 0.9.4 - 2025-11-07

### Changed

- The `dod` field is now automatically cleared if the animal's status is not 'Deceased'.

## 0.9.3 - 2025-11-07

### Fixed

- Fixed an issue where the edit button was not working correctly due to an incorrect API endpoint.

## 0.9.2 - 2025-11-07

### Fixed

- Fixed an issue where the table was not being populated with data on initial load due to an incorrect API endpoint.

## 0.9.1 - 2025-11-07

### Fixed

- Fixed an issue where the table was not being populated with data on initial load.

## 0.9.0 - 2025-11-07

### Added

- Implemented a complete overhaul of the edit functionality.
- Clicking the "Edit" button now makes the entire row editable, with appropriate input types for each field.
- Implemented date pickers for `birth_date` and `dod` fields.
- Implemented dropdown menus for `gender`, `status`, `dam_id`, and `sire_id` fields.
- The `dam_id` and `sire_id` dropdowns are now populated with relevant animals from the database.
- Implemented a textarea for the `notes` field for easier multi-line input.
- The `pic` field is now a clickable link that opens the image in a new tab.
- Removed the `created_at` field from the table view.

### Fixed

- Fixed a bug where clicking the "Edit" button would immediately save the row without allowing for edits.

## 0.8.0 - 2025-11-07

### Fixed

- Fixed a `toordinal` error by converting `birth_date` and `dod` strings to date objects before database insertion or update.

## 0.7.9 - 2025-11-07

### Fixed

- Resolved `422 Unprocessable Content` error by making Pydantic `Animal` model fields optional to correctly handle null or omitted values from the frontend.

## 0.7.8 - 2025-11-06

### Fixed

- Corrected the data format for add/update operations to prevent `422 Unprocessable Content` errors.

## 0.7.7 - 2025-11-06

### Fixed

- Overwrote script.js with a clean, correct version to eliminate persistent syntax errors.

## 0.7.6 - 2025-11-06

### Fixed

- Corrected the URL path for API requests to be compatible with Home Assistant ingress.
- Made inline-edit input fields more prominent to ensure visibility.

## 0.7.5 - 2025-11-06

### Fixed

- Unified button styles to prevent size changes during edit mode.
- Added enhanced diagnostics for non-editable row issue.

## 0.7.4 - 2025-11-06

### Fixed

- Removed duplicated code that caused a critical JavaScript syntax error.

## 0.7.3 - 2025-11-06

### Fixed

- Implemented a more robust method for inline editing to fix non-editable cells.

## 0.7.2 - 2025-11-06

### Fixed

- Implemented a more robust method for inline editing to fix non-editable cells.

## 0.7.1 - 2025-11-06

### Fixed

- Corrected a major JavaScript syntax error that was preventing all button functionality.

## 0.7.0 - 2025-11-06

### Fixed

- Added detailed diagnostic logging to JavaScript to debug unresponsive buttons.

## 0.6.9 - 2025-11-06

### Fixed

- Moved click event listener from tbody to table for better event delegation.

## 0.6.8 - 2025-11-06

### Fixed

- Reverted fetch URLs to absolute paths (/add_animal) for ingress compatibility.

## 0.6.7 - 2025-11-06

### Fixed

- Changed fetch URLs to relative paths for compatibility with Home Assistant ingress.

## 0.6.6 - 2025-11-06

### Changed

- Removed separate add form; added empty row at bottom of table for inline adding livestock.

## 0.6.5 - 2025-11-06

### Changed

- Implemented inline editing for table rows: click Edit to make fields editable, Save to update, Cancel to revert.

## 0.6.4 - 2025-11-06

### Added

- Added logging to add_animal endpoint and JS form detection.

## 0.6.3 - 2025-11-06

### Added

- Added hover highlight for table rows.

## 0.6.2 - 2025-11-06

### Added

- Added console logs to debug JS loading and form submission.

## 0.6.1 - 2025-11-06

### Fixed

- Removed initial JS populate call to prevent overwriting server-side rendered table.

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
