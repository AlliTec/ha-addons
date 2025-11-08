# Changelog

## 0.9.48 - 2025-11-08

### Added

- Implemented dynamic filter tabs that only show for animal types present in database.
- Added support for goats, sheep, pigs, horses, llamas, alpacas, and donkeys.
- Added comprehensive gender mappings for all supported animal types.
- Added new API endpoint `/api/animal-types` to get available filter options.
- Filter tabs now automatically hide/show based on actual livestock data.

### Fixed

- Fixed critical JavaScript syntax error preventing script.js from loading properly.
- Removed duplicate event listeners that were causing syntax errors.
- Fixed nested event handler structure in table click events.

## 0.9.46 - 2025-11-08

### Fixed

- Added comprehensive debugging to `populateAnimalList` function to identify table population issues.
- Enhanced `calculateAge` function to handle different date formats from Python backend.
- Added error handling and console logging for troubleshooting.

## 0.9.45 - 2025-11-08

### Fixed

- Added missing `calculateAge` function that was preventing table population.
- Added missing `animal-details-modal` HTML element referenced in JavaScript.
- Resolved issue where livestock records were not displaying in the table.

## 0.9.44 - 2025-11-08

### Fixed

- Corrected the `populateAnimalList` function to properly render the simplified table.
- Fixed the alignment of the "Add" button.



## 0.9.43 - 2025-11-08

### Fixed

- Rewrote the `populateAnimalList` function to correctly build the table and prevent rendering failures.

## 0.9.42 - 2025-11-08

### Changed

- Simplified the table display to show only "Name", "Gender", "Status", "Age", and "Actions".
- Implemented a popup modal to display the full details of an animal when a row is clicked.

## 0.9.41 - 2025-11-08

### Fixed

- Rewrote the event listener for the PIC column to ensure clicks are registered correctly.

## 0.9.40 - 2025-11-08

### Fixed

- Implemented cache-busting for `script.js` to ensure the latest version is always loaded.

## 0.9.39 - 2025-11-08

### Fixed

- Corrected the column header for the image column to "PIC".

## 0.9.38 - 2025-11-08

### Fixed

- Corrected the image icon display in the "Image" column.

## 0.9.37 - 2025-11-08

### Fixed

- Corrected the implementation of the image upload and display functionality.

## 0.9.36 - 2025-11-08

### Added

- Implemented image upload and display functionality.
- The "Image" column now displays a picture frame icon.
- Clicking the icon opens a file browser if no image is present, or displays the image in a popup if an image path exists.

## 0.9.35 - 2025-11-08

### Changed

- Moved the "Add" button to the "Actions" column.

## 0.9.34 - 2025-11-08

### Changed

- Removed the shadow effect from the active tab.

## 0.9.33 - 2025-11-08

### Changed

- Added a subtle shadow effect to the sides of the selected tab.

## 0.9.32 - 2025-11-08

### Changed

- Beveled the top-right corner of the filter tabs.

## 0.9.31 - 2025-11-08

### Changed

- Corrected the folder tab design to have a vertical left edge and a right edge that slopes from a narrower top to a wider bottom.

## 0.9.30 - 2025-11-08

### Changed

- Corrected the direction of the folder tab slope.

## 0.9.29 - 2025-11-08

### Changed

- Implemented an overlapping folder tab design with a 45-degree angle on the right side of each tab.

## 0.9.28 - 2025-11-08

### Changed

- Styled the filter tabs to be touching, with rounded top corners and a 45-degree angle on the left side of each tab.

## 0.9.27 - 2025-11-08

### Changed

- Reversed the color scheme for the filter tabs.

## 0.9.26 - 2025-11-08

### Changed

- Restructured the HTML and adjusted the CSS to make the filter tabs look attached to the table.

## 0.9.25 - 2025-11-08

### Changed

- Adjusted the CSS to make the filter tabs sit directly on top of the table.

## 0.9.24 - 2025-11-08

### Changed

- Replaced the filter images with Font Awesome icons.
- Added a "Cat" filter.
- Restyled the filter bar to appear as folder tabs.

## 0.9.23 - 2025-11-08

### Changed

- Moved the filter icons to the left side of the screen.
- Corrected the image paths for the filter icons.

## 0.9.22 - 2025-11-08

### Changed

- Removed the ID column from the web UI.
- The Dam and Sire columns now display the names of the animals instead of their IDs.
- The Status column now displays icons instead of text for "On Property", "Deceased", and "Sold".

## 0.9.21 - 2025-11-07

### Changed

- Removed the "Animal" column from the table.
- Repositioned the filter icons to be on the same line as the "Livestock List" heading.
- Replaced hardcoded buttons with Font Awesome icons.
- Themed the UI with a beige and brown color scheme.

## 0.9.20 - 2025-11-07

### Added

- Added an image-based filter bar to filter animals by type (Cattle, Dog, Fowl).
- Added a farmhouse image to show all animals.

### Changed

- Moved the "Add" button to the "Actions" column.

### Changed

- Condensed the table by reducing row padding.
- Null values are now displayed as empty strings.
- Updated button colors to a more neutral palette.
- Removed the "Photo Path" column from the table.

## 0.9.18 - 2025-11-07

### Fixed

- Restored the table styling that was accidentally removed, making the table visible again.

## 0.9.17 - 2025-11-07

### Changed

- Replaced Material Design Icons with Font Awesome icons.
- Updated button styling to be more aesthetically pleasing with transparent backgrounds and larger icons.

## 0.9.16 - 2025-11-07

### Changed

- Implemented a new, more mellow color scheme with earthy tones to better fit the farm theme.

## 0.9.15 - 2025-11-07

### Fixed

- Fixed an issue where buttons with icons were not responding to clicks due to incorrect event handling.

## 0.9.14 - 2025-11-07

### Fixed

- Replaced the static 'Add' button text with a plus icon to match the other buttons.

## 0.9.13 - 2025-11-07

### Fixed

- Added Material Design Icons stylesheet to `index.html` to ensure icons are displayed correctly.

## 0.9.12 - 2025-11-07

### Changed

- Replaced button text with Material Design Icons for 'Add', 'Edit', 'Save', 'Delete', and 'Cancel' actions to prevent table re-alignment issues and improve aesthetics. Added `aria-label` for accessibility.

## 0.9.11 - 2025-11-07

### Fixed

- Standardized button sizes across the application, resolving issues where 'Add' and edit-mode buttons appeared disproportionately large.

## 0.9.10 - 2025-11-07

### Fixed

- The "Add" functionality now correctly uses selection lists for relevant fields.
- The "Cancel" button now correctly resets the "add" row.

## 0.9.9 - 2025-11-07

### Fixed

- Fixed an issue where the "Add" button was not making the new row editable.

## 0.9.8 - 2025-11-07

### Fixed

- Fixed an issue where the update functionality was not working correctly.
- Removed the red border from the `dod` field after saving.

## 0.9.7 - 2025-11-07

### Fixed

- Corrected a typo in the default database name.

## 0.9.6 - 2025-11-07

### Changed

- Set default values for the addon configuration.

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
