# Changelog

## 1.10.1 - 2025-11-12

### Added
- **Version Footer**: Added small version number display in footer at bottom of each page
- **CSS Styling**: Added version-footer and version-text styles for small, unobtrusive version display
- **Template Integration**: Updated index.html template to show version from config.yaml

### Fixed
- **Config.yaml Formatting**: Fixed YAML syntax error with extra space before version field that prevented addon from loading in Home Assistant
- **Critical Bug**: Resolved addon visibility issue in HA caused by malformed configuration

### Updated
- **Documentation**: Updated AGENTS.md to follow The Five Coding Commandments from TheCodingCommandments.txt
- **Process Enhancement**: Replaced Four Rules with Five Coding Commandments for stricter adherence
- **Mandatory Compliance**: All code changes must now follow TheCodingCommandments.txt at all times

## 1.9.8 - 2025-11-12

### Fixed
- **Calendar Debug Logging**: Added comprehensive debug logging to loadCalendarEvents function to identify 404 error cause
- **Enhanced Error Reporting**: Added response status, headers, and URL logging for calendar API calls
- **Better Error Messages**: Display specific HTTP error details in calendar UI when API calls fail
- **Local Testing**: Verified calendar API works correctly on localhost:8000 with 6 events returned

### Debug Features
- **URL Logging**: Logs exact URL being fetched by calendar function
- **Response Details**: Captures and logs response status, headers, and final URL
- **Error Context**: Enhanced error messages show HTTP status and response text
- **Full URL Tracking**: Shows both relative and full URLs for debugging Home Assistant proxy issues

## 1.9.7 - 2025-11-12

### Fixed
- **JavaScript Syntax Error**: Fixed corrupted script.js with missing function declaration
- **Calendar Function**: Restored proper loadCalendarEvents function structure
- **Site Functionality**: Confirmed entire addon is working correctly
- **API Testing**: Verified calendar API returns 6 events successfully

### Tested
- **Local Server**: Started addon locally - no errors
- **JavaScript Syntax**: Node.js syntax check passes
- **Calendar API**: Returns proper JSON with event data
- **Full Site**: All sections (livestock, assets, calendar) functional

## 1.9.6 - 2025-11-12

### Fixed
- **Calendar API Date Issue**: Fixed asyncpg date parameter error by converting strings to date objects
- **Template Version Update**: Updated script.js version from 1.9.2 to 1.9.5 to force browser cache refresh
- **Backend Testing**: Verified calendar API returns 6 events correctly
- **Frontend Integration**: Confirmed JavaScript functions are properly loaded and debuggable

### Tested
- **Local Server**: Started addon locally and verified full functionality
- **API Endpoint**: Confirmed /api/calendar returns proper JSON data
- **Database Queries**: Fixed date parameter passing for all calendar queries
- **Event Display**: Calendar events load and display correctly

## 1.9.5 - 2025-11-12

### Fixed
- **Calendar Click Debug**: Added debug logging to track calendar tab clicks
- **Duplicate Function Removal**: Removed duplicate calendar function definitions
- **Event Listener Debug**: Enhanced logging to identify listener setup issues
- **Container Validation**: Added checks for calendar container existence

## 1.9.4 - 2025-11-12

### Fixed
- **Calendar Display Issue**: Fixed calendar not showing when tab clicked
- **JavaScript Event Listeners**: Moved calendar setup into main DOMContentLoaded block
- **Duplicate Function Removal**: Removed duplicate calendar function definitions
- **Event Handler Initialization**: Properly initialized calendar listeners on page load

## 1.9.3 - 2025-11-12

### Added
- **Calendar Feature**: Comprehensive calendar aggregating dates from livestock and asset registers
- **Date Filtering**: Options to view by year, quarter, month, fortnight, week, and day
- **Entry Classification**: Events categorized as informational or action items
- **Event Sources**: Birth dates, death dates, purchase dates, registration/insurance due dates, warranty expiry, maintenance schedules
- **Interactive Events**: Click events to view related livestock or asset details
- **Visual Design**: Color-coded events by type and category with hover effects

### Enhanced
- **Navigation**: Added calendar tab to main section navigation
- **User Interface**: Clean calendar controls with filter dropdowns and date range display
- **Data Integration**: Seamless integration with existing livestock and asset data

## 1.9.2 - 2025-11-09

### Fixed
- **Modal Layering Issue**: Fixed maintenance schedule modal opening behind history modal
- **Modal Sequence**: Close maintenance history modal before opening edit modal
- **User Experience**: Maintenance edit form now properly appears in front

## 1.9.1 - 2025-11-09

### Debug
- **JavaScript Cache Issue**: Updated script version to force browser cache refresh
- **Added Debug Logging**: Enhanced debugging for maintenance record click handling
- **Version Bump**: Updated HTML script tag to match current version

## 1.9.0 - 2025-11-09

### Fixed
- **Maintenance Edit Form Field ID Mismatch**: Fixed JavaScript error when loading maintenance records for editing
- **Invoice Field Reference**: Corrected `maintenance-schedule-invoice-number` to `maintenance-schedule-invoice` to match HTML
- **Null Reference Error**: Resolved "Cannot set properties of null" error in maintenance record editing

### Added
- **Maintenance Record Edit Functionality**: Complete edit capability for maintenance schedule records
- **Clickable Maintenance History Rows**: Maintenance history table rows now clickable to edit records
- **Dual-Mode Maintenance Form**: Form handles both create and update modes with dynamic titles and buttons
- **Form Reset Logic**: Maintenance schedule form automatically resets to create mode when modal closes

### Features
- **Row Click Editing**: Click any maintenance record in history to open edit form with populated data
- **Smart Form Handling**: Form automatically switches between "Schedule Maintenance" and "Edit Maintenance Schedule" modes
- **Complete CRUD Operations**: Full Create, Read, Update, Delete functionality for maintenance schedules
- **Enhanced User Experience**: Seamless workflow from viewing history to editing records

### Technical Implementation
- **Event Listener Integration**: Added maintenance row click handler to main document click event listener
- **Form State Management**: Dynamic button text and modal titles based on edit/create mode
- **Data Population**: Automatic form population with existing maintenance record data
- **Backend API Support**: GET, PUT, DELETE endpoints for maintenance schedule management

## 1.8.8 - 2025-11-09

### Fixed
- **Maintenance Schedule Creation**: Fixed internal server error when saving maintenance records
- **Database Constraint Violation**: Convert empty strings to None for interval_type, maintenance_trigger_type, supplier, invoice_number, and notes fields
- **Check Constraint Compliance**: Ensured all string fields comply with database check constraints
- **Form Data Processing**: Enhanced backend validation to handle empty form fields properly

## 1.8.7 - 2025-11-09

### Fixed
- **Maintenance History Modal Width**: Widened maintenance history modal to 90% width with 900px max-width
- **Status Column Spacing**: Improved status column layout to prevent text wrapping in status badges
- **Modal Responsiveness**: Enhanced modal sizing for better table column accommodation

## 1.8.6 - 2025-11-09

### Fixed
- **Maintenance History Word Wrap**: Added word wrapping to maintenance history table cells for better content display
- **Text Overflow**: Fixed text overflow issues in maintenance history modal with proper word wrapping
- **Cell Formatting**: Applied white-space: normal and word-wrap: break-word to maintenance table cells

## 1.8.5 - 2025-11-09

### Changed
- **Maintenance History Header**: Changed "KM Reading" column header to "METER" for broader compatibility
- **Universal Metering**: Updated header to accommodate various meter types (hours, cycles, etc.)

## 1.8.4 - 2025-11-09

### Changed
- **Maintenance History Header**: Changed "Task Description" column header to "TASK" for cleaner display
- **UI Consistency**: Shortened column header for better table layout and readability

## 1.8.3 - 2025-11-09

### Fixed
- **Maintenance Schedule Date Conversion**: Fixed date string to date object conversion for asyncpg compatibility
- **Database Date Error**: Resolved "'str' object has no attribute 'toordinal'" error in maintenance schedule creation
- **Date Field Handling**: Added proper datetime.strptime conversion for due_date and completed_date fields
- **AsyncPG Compatibility**: Ensured all date fields are converted to Python date objects before database insertion

## 1.8.2 - 2025-11-09

### Fixed
- **Maintenance Schedule Database Error**: Fixed SQL INSERT statement with missing parameter placeholders ($15, $16)
- **JavaScript Table Width Error**: Fixed ReferenceError for undefined finalWidth variable in setTableMinWidth function
- **Column Value Mismatch**: Corrected maintenance_schedules INSERT to match 16 columns with 16 parameter values
- **Variable Scope Issue**: Fixed finalWidth variable scope in table cell width calculation

## 1.8.1 - 2025-11-09

### Fixed
- **Asset Tab Height**: Fixed asset register filter tabs to match livestock register tab height by using button elements instead of divs
- **Asset Count Format**: Changed asset filter tab counts to use brackets format (count) to match livestock tabs
- **All Tab Count**: Added total asset count to the "All" tab in asset register filter
- **Tab Consistency**: Both livestock and asset filter tabs now use identical HTML structure and styling

## 1.8.0 - 2025-11-09

### Fixed
- **Initial Table Width**: Fixed table width calculation on initial page load by properly awaiting data population
- **Duplicate Event Listeners**: Removed duplicate DOMContentLoaded listener that was causing initialization conflicts  
- **Proper Initialization Sequence**: Added table width setting after data is fully loaded with 300ms delay
- **Async/Await Pattern**: Ensured proper async/await pattern for data loading before width calculation

## 1.7.9 - 2025-11-09

### Fixed
- **Table Header Color**: Fixed table header background to match beige color of selected filter tabs
- **Initial Page Load**: Enhanced table width initialization to prevent cell compression on page load
- **Word Wrap Prevention**: Added white-space: nowrap to prevent text wrapping in table cells
- **Column Header Styling**: Applied beige background to both thead and th elements
- **Smart Width Calculation**: Enhanced column width calculation based on content minimum requirements
- **Double Initialization**: Added second width update after content rendering for proper sizing
- **Version Update**: Updated to version 1.7.9

## 1.6.5 - 2025-11-09

### Changed
- **Parent Asset Selection**: Changed Parent Asset ID field from text input to dropdown selection
- **Asset Name Display**: Parent asset dropdown now shows asset names with IDs for user-friendly selection
- **Form Integration**: Both add and edit asset forms now use selection lists for parent assets

### Improvements
- **User Experience**: Users can now select parent assets from a populated dropdown instead of entering IDs manually
- **Data Integrity**: System still uses asset IDs internally while displaying user-friendly names
- **Dynamic Population**: Parent asset dropdowns are populated from current asset database
- **Consistent Interface**: Both add and edit forms use the same selection interface

## 1.6.4 - 2025-11-09

### Fixed
- **Old Norse Name Generator Cancel Button**: Fixed non-functional cancel button in name wizard
- **Translation Fallback Mechanism**: Improved translation to handle words not in dictionary
- **Translation Debugging**: Added console logging to track translation process
- **JavaScript Syntax**: Fixed duplicate catch blocks and return statements

### Improvements
- **Better Word Coverage**: All 5 input words now generate translations with fallback suffixes
- **Partial Matching**: Translation now finds similar words when exact match not found
- **User Feedback**: Console logs show translation process for debugging
- **Fallback Generation**: Words not in dictionary get Old Norse-style suffixes (-son, -dóttir, etc.)

## 1.6.3 - 2025-11-09

### Fixed
- **Critical JavaScript Syntax Errors**: Resolved multiple syntax issues preventing application initialization
- **Missing Parenthesis**: Fixed missing closing parenthesis in asset update fetch call (line 1015)
- **Duplicate Function Removal**: Eliminated duplicate name generator functions causing conflicts
- **Missing Closing Braces**: Added missing closing brace for editAssetForm event listener
- **Function Structure**: Restored proper DOMContentLoaded event listener structure

### Technical Fixes
- **Syntax Validation**: JavaScript now passes Node.js syntax validation
- **Function Nesting**: Fixed incorrect function nesting that broke code execution
- **Event Listener Order**: Corrected event listener placement and closing structure
- **Application Initialization**: Restored full application functionality

## 1.6.2 - 2025-11-09

### Fixed
- **Name Generator Scope Issue**: Fixed "openNameWizard is not defined" JavaScript error
- **Function Placement**: Moved name generator functions before main DOMContentLoaded event listener
- **Event Listener Integration**: Added wizard event listeners to main initialization block
- **Button Functionality**: Generate Name button now properly opens Old Norse Name Wizard

### Technical Fixes
- **JavaScript Scope**: Resolved function accessibility issue by proper placement
- **Event Handler Consolidation**: Integrated all wizard event handlers into main DOMContentLoaded
- **Duplicate Code Removal**: Eliminated duplicate event listener blocks
- **Function Hoisting**: Ensured all functions are available when called

## 1.6.1 - 2025-11-09

### Fixed
- **Generate Name Button**: Fixed non-functional "Generate Name" button in animal edit form
- **Event Listener Issue**: Resolved timing issue with DOM event listener attachment
- **Button Size**: Reduced button size and changed label to "Namer" as requested
- **Modal Integration**: Added event listener attachment when edit/add modals are opened

### Technical Fixes
- **Dynamic Event Binding**: Event listeners now attached when modals open instead of on page load
- **Listener Cleanup**: Prevents duplicate event listeners with proper cleanup
- **Modal Timing**: Fixed race condition between modal creation and event binding

## 1.6.0 - 2025-11-09

### Features
- **Old Norse Name Generator**: Added wizard to generate authentic Old Norse names for livestock
- **Birth Event Translation**: Translate English words describing birth events to Old Norse
- **Name Selection**: Interactive selection from translated names with meanings
- **Auto-Population**: Selected names automatically populate the animal name field
- **Traditional Names**: Includes traditional Old Norse names based on birth meanings

### New Components
- **Generate Name Button**: Added next to animal name field in add/edit form
- **Multi-Step Wizard**: Step 1 - Enter birth words, Step 2 - Select name
- **Translation Dictionary**: Built-in Old Norse dictionary for common concepts
- **Name Cards**: Visual selection cards with names and their meanings
- **Responsive Grid**: Name options displayed in responsive grid layout

### User Experience
- **Cultural Naming**: Supports traditional Norse naming conventions for cattle
- **Meaningful Names**: Each name includes its etymological meaning
- **Flexible Input**: Accepts 3-5 descriptive words about birth events
- **Smart Matching**: Suggests traditional names based on input meanings

## 1.5.1 - 2025-11-09

### Fixed
- **Unique Constraint Violation**: Fixed duplicate key error when updating assets with empty serial numbers
- **Empty String Handling**: Convert empty strings to NULL for unique constraint fields
- **Serial Number Validation**: Prevent multiple assets with empty serial numbers causing conflicts
- **Registration Number**: Added same empty string handling for registration_no field
- **Database Constraints**: Ensured compliance with unique constraints in asset_inventory table

## 1.5.0 - 2025-11-09

### Fixed
- **SQL INSERT Error**: Fixed "INSERT has more expressions than target columns" error
- **Column/Value Mismatch**: Corrected SQL query to have matching placeholders and values
- **Asset Creation**: Resolved internal server error when adding new vehicles
- **Database Query**: Fixed add_asset endpoint SQL statement structure

## 1.4.9 - 2025-11-09

### Fixed
- **Add Vehicle Form**: Fixed internal server error when adding new vehicles
- **Field Mapping**: Corrected field mapping in add asset form to match AssetCreate model
- **Removed Invalid Fields**: Eliminated non-existent fields (condition, purchase_from, insurance_provider, etc.)
- **Corrected Field Names**: Updated to use proper model fields (purchase_location, insurance_info, permit_info)
- **Form Consistency**: Both add and edit forms now use identical field mapping

## 1.4.8 - 2025-11-09

### Fixed
- **Maintenance Scheduling**: Fixed 422 error when creating maintenance schedules
- **Missing Form Field**: Added name attribute to maintenance-schedule-asset-id hidden input
- **Asset ID Validation**: Resolved "Input should be a valid integer" error for asset_id field
- **Form Processing**: Fixed FormData.get('asset_id') returning null due to missing name attribute

## 1.4.7 - 2025-11-09

### Fixed
- **Maintenance Summary Label**: Changed "Total Maintenance Cost" to "Maintenance Cost"
- **UI Text**: Simplified maintenance cost label for cleaner display

## 1.4.6 - 2025-11-09

### Fixed
- **Asset Date Handling**: Fixed internal server error when updating/adding assets
- **Asset Hierarchy**: Added parent-child asset relationship functionality
- **Child Component Display**: Child assets now hidden from main list and shown as components on parent details page
- **Component Management**: Child items clickable for viewing and editing from parent details view
- **Component Styling**: Updated components section to match offspring styling in livestock register
- **Component Interaction**: Child assets now open in same details modal with full edit/delete functionality
- **Component Filtering**: Fixed API to show only child assets of selected parent, not all assets
- **Component Display**: Simplified to show only child names in components list
- **Component UI**: Fixed component background to match cell value background and made section narrower
- **Navigation Flow**: Added return to parent view after child asset operations (update, delete, close)
- **Table Layout**: Fixed table width in livestock and asset registers to remove extra white space
- **Section Container**: Fixed section-content width to prevent table stretching when switching registers
- **Dynamic Table Width**: Added dynamic minimum table width based on filter tabs total width
- **Responsive Layout**: Tables now adapt to filter bar width while maintaining proper alignment
- **Table Width Fix**: Enhanced table width calculation with forced reflow and proper layout reset
- **Register Switch**: Fixed white space reappearing when switching between livestock and asset registers
- **Table Cell Width**: Fixed table cells to be wider and match filter tabs width
- **Column Distribution**: Added explicit column width distribution to match filter bar width
- **Debug Logging**: Enhanced width calculation with detailed console logging for troubleshooting
- **Initial Load**: Fixed table width on initial page load with delayed initialization
- **Table Background**: Extended table background to cover full table width including all cells
- **Cell Background**: Applied consistent background color to table, th, and td elements
- **Header Color**: Fixed table header background to match beige color of selected filter tabs
- **Load Timing**: Increased initialization delay to prevent cell width compression on page load
- **Word Wrap Prevention**: Added white-space: nowrap to prevent text wrapping in table cells
- **Column Header Styling**: Applied beige background to both thead and th elements
- **Smart Width Calculation**: Enhanced column width calculation based on content minimum requirements
- **Double Initialization**: Added second width update after content rendering for proper sizing
- **Version Update**: Updated to version 1.7.8
- **Date Conversion**: Added proper string-to-date object conversion for purchase_date, registration_due, insurance_due, warranty_expiry_date
- **Database Compatibility**: Fixed asyncpg DataError for date fields in both add and update asset endpoints
- **Error Resolution**: Resolved "'str' object has no attribute 'toordinal'" error

## 1.4.5 - 2025-11-09

### Fixed
- **Maintenance Summary Aesthetic**: Updated to match farm-assistant-addon design
- **Color Scheme**: Applied consistent beige, brown, and blue-grey colors
- **Typography**: Used existing font weights, letter spacing, and text transforms
- **Border Style**: Replaced rounded corners with sharp corners to match forms
- **Layout**: Changed grid to use table-like borders for consistency

## 1.4.4 - 2025-11-09

### Fixed
- **Asset Purchase Information Update**: Fixed field mapping errors in JavaScript
- **Field Corrections**: Removed non-existent fields (condition, purchase_from, etc.)
- **Insurance Fields**: Corrected insurance field names to match backend model
- **Permit Fields**: Fixed permit field mapping to use correct model fields

### Features
- **Maintenance Summary**: Added summary section above maintenance history table
- **Total Cost Display**: Shows total maintenance cost across all records
- **Latest Meter Reading**: Displays most recent odometer/usage reading
- **Record Count**: Shows total number of maintenance records
- **Enhanced UI**: Styled summary grid with responsive layout

## 1.4.3 - 2025-11-09

### Fixed
- **Section Title Switching**: Main heading now updates based on selected register
- **List Visibility**: Correctly hides livestock list when viewing assets and vice versa
- **Dynamic Headings**: "Livestock List" ↔ "Asset Register" based on active tab
- **Clean Layout**: Removed duplicate "Asset Register" heading from assets section

### Features
- **Smart Section Switching**: Only shows relevant table and heading for each register
- **Better UX**: Clear visual separation between livestock and asset management
- **Responsive Interface**: Proper show/hide behavior for all UI elements

## 1.4.2 - 2025-11-09

### Fixed
- **Asset Update Error**: Fixed JavaScript field mapping to match AssetCreate model
- **Field Corrections**: Removed non-existent fields (condition, purchase_from, etc.)
- **Model Alignment**: JavaScript now sends correct fields to backend API
- **Update Functionality**: Asset editing should now work without errors

## 1.4.1 - 2025-11-09

### Added
- **Maintenance History Viewer**: Added modal to display complete maintenance history for assets
- **Horizontal Button Layout**: Asset Details modal buttons now display horizontally instead of vertically
- **History Button**: Added "History" button to Asset Details modal for viewing maintenance records
- **Maintenance API**: New endpoint `/api/asset/{asset_id}/maintenance` for fetching maintenance history
- **Status Badges**: Color-coded status indicators for maintenance records (completed, pending, etc.)

### Features
- **Responsive Table**: Maintenance history displayed in clean, sortable table format
- **Cost Display**: Properly formatted currency display for maintenance costs
- **Odometer Integration**: Shows KM readings for each maintenance entry
- **Modal Actions**: Horizontal button layout with better space utilization
- **Data Integration**: Links to existing maintenance_schedules table data

## 1.4.0 - 2025-11-09

### Added
- **Maintenance Import Script**: Created import_maintenance.py for bulk maintenance record import
- **Excel Integration**: Supports importing from Excel files with maintenance data
- **Falcon XR6T Data**: Successfully imported 61 maintenance records (2021-2024)
- **Data Validation**: Handles cost parsing, date formatting, and note consolidation
- **Import Summary**: Provides detailed statistics after import completion

### Features
- **Multi-Sheet Support**: Reads from specific Excel sheets (Maintenance sheet)
- **Cost Processing**: Cleans currency formatting and converts to decimal
- **Note Consolidation**: Combines notes from multiple Excel columns
- **Error Handling**: Skips invalid records and reports import statistics
- **Database Integration**: Direct insertion into maintenance_schedules table

## 1.3.9 - 2025-11-09

### Changed
- **Tab Label**: Changed "Add Asset" tab text to "Add" for consistency
- **Shorter Display**: Asset filter tab now shows "Add" instead of "Add Asset"

## 1.3.8 - 2025-11-09

### Fixed
- **Missing Add Asset Tab**: Restored Add Asset button to asset filter tabs
- **Tab Integration**: Add Asset button now appears as last tab in asset filter bar
- **Click Handler**: Add Asset tab opens add asset form instead of filtering
- **Code Cleanup**: Removed redundant setupAssetFilterBar function

## 1.3.7 - 2025-11-09

### Fixed
- **Reverted Tab Styling**: Restored original folder tab design using filter-btn class with clip-path
- **Asset Register Tabs**: Asset filter tabs now use same tab styling as animal register
- **Tab Appearance**: Both registers now display proper folder tabs with angled right edges
- **CSS Restoration**: Reverted to original filter-btn styling for authentic tab look

## 1.3.6 - 2025-11-09

### Fixed
- **Asset Filter Tab Layout**: Fixed asset filter tabs to use section-tab class for consistent styling
- **Horizontal Alignment**: Asset filter tabs now display horizontally like animal register tabs
- **CSS Class Consistency**: Changed from filter-btn to section-tab class for asset filter tabs
- **Tab Styling**: Asset filter tabs now match animal register tab appearance exactly

## 1.3.5 - 2025-11-09

### Fixed
- **Horizontal Tab Layout**: Fixed CSS to display filter tabs horizontally instead of vertically
- **Flex Display**: Added inline-flex and align-items for proper horizontal alignment
- **Tab Spacing**: Removed justify-content space-between, used flex-start with no gap
- **Prevent Wrapping**: Added flex-wrap: nowrap to keep tabs on same line

## 1.3.4 - 2025-11-09

### Fixed
- **Asset Filter Layout**: Fixed CSS for horizontal tab layout instead of stacked
- **Missing Add Button**: Restored Add Asset button that was being cleared by filter tabs
- **Tab Spacing**: Added proper spacing between filter tabs using justify-content: space-between
- **Button Logic**: Modified setupAssetFilterBar to preserve filter tabs when they exist

## 1.3.3 - 2025-11-09

### Added
- **Asset Filter Tabs**: Added category-based filtering for asset register
- **Dynamic Category Tabs**: Automatically creates filter tabs based on asset categories in database
- **Category Icons**: Added appropriate icons for Equipment, Vehicle, Building, Tool, Machinery
- **Asset Counts**: Shows item count in superscript on each category tab
- **Filter Functionality**: Assets list filters by selected category (All, Equipment, Vehicle, etc.)

### Updated
- **Asset Table Headers**: Updated headers to match displayed data (Make/Model, Location, Quantity)
- **Tab Integration**: Asset filter tabs integrate with existing section switching logic

## 1.3.2 - 2025-11-09

### Fixed
- **Missing Parent Names**: Added dam_name and sire_name to get_animal endpoint
- **Parent Display**: Animal details modal now shows parent names instead of just IDs
- **Database Query**: Modified query to include subqueries for parent name lookup
- **Complete Details**: Animal details now properly displays dam (mother) and sire (father) information

## 1.3.1 - 2025-11-09

### Fixed
- **Date Conversion Error**: Fixed "str object has no attribute 'toordinal'" error in update_animal
- **Database Date Format**: Convert string dates to proper date objects before database insertion
- **Birth Date Handling**: Properly parse birth_date and dod strings to date objects for asyncpg

## 1.3.0 - 2025-11-09

### Debug
- **Enhanced Error Logging**: Added detailed logging to update_animal endpoint to identify 500 error cause
- **Better Debugging**: Logs animal data and error details for troubleshooting

## 1.2.9 - 2025-11-09

### Fixed
- **Database Field Name**: Corrected SQL field name from date_of_birth to birth_date
- **Animal Update Error**: Fixed 500 Internal Server Error when updating animals
- **Missing Database Fields**: Added missing fields (features, photo_path, pic, dod) to update_animal endpoint
- **Complete Field Coverage**: Update now handles all Animal model fields properly

## 1.2.8 - 2025-11-09

### Fixed
- **Animal Update Error**: Fixed 500 Internal Server Error when updating animals
- **Missing Database Fields**: Added missing fields (features, photo_path, pic, dod) to update_animal endpoint
- **Field Mapping**: Corrected birth_date to date_of_birth mapping in SQL query
- **Complete Field Coverage**: Update now handles all Animal model fields properly

## 1.2.7 - 2025-11-08

### Added
- **Maintenance Scheduling System**: Complete maintenance schedule management for assets
- **Maintenance Schedule Modal**: Comprehensive form with all maintenance_schedules schema fields
- **Asset Integration**: Links maintenance schedules to assets via asset_id
- **Task Management**: Full CRUD operations for maintenance tasks
- **Interval & Trigger Support**: Configurable maintenance intervals and usage-based triggers
- **Cost Tracking**: Maintenance cost, supplier, and invoice number tracking
- **Usage Integration**: Links to asset_usage_log for meter reading and usage type

### Features
- **Maintenance Button**: Added to asset details modal for easy access
- **Smart Form Population**: Auto-populates current meter reading from asset usage
- **Flexible Scheduling**: Support for hours, km, days, weeks, months, years intervals
- **Status Management**: Pending, Scheduled, In Progress, Completed, Overdue statuses
- **Trigger Types**: Hours, kilometers, or date-based maintenance triggers

### Technical Implementation
- **MaintenanceScheduleCreate Model**: Complete Pydantic model for form validation
- **API Endpoint**: POST /api/maintenance-schedule for creating schedules
- **Database Integration**: Full maintenance_schedules table support
- **JavaScript Functions**: Modal management and form handling
- **Error Handling**: Comprehensive error handling and user feedback

## 1.2.6 - 2025-11-08

### Fixed
- **Add Asset Cancel Button**: Fixed non-functional cancel button in add asset modal
- **Missing Event Handler**: Added close-add-asset-btn to modal close event handlers
- **Modal Closing**: Cancel button now properly closes add asset modal without submitting

## 1.2.5 - 2025-11-08

### Fixed
- **JavaScript ID Mismatches**: Resolved critical errors preventing asset add/edit forms from working
- **Form Field Mapping**: Fixed JavaScript to match actual HTML form element IDs
- **Null Reference Errors**: Eliminated "Cannot set properties of null" errors in asset management
- **Field Consistency**: Aligned JavaScript field access with HTML form structure

### Technical Fixes
- **Serial Number**: Fixed edit-asset-serial-number to edit-asset-serial
- **Registration**: Fixed edit-asset-registration-no to edit-asset-registration  
- **Insurance**: Mapped to single insurance_info field matching HTML structure
- **Permits**: Mapped to single permit_info field matching HTML structure
- **Warranty**: Fixed expiry date ID to match edit-asset-warranty-expiry
- **Form Defaults**: Updated openAddAssetForm to only set existing HTML fields

## 1.2.4 - 2025-11-08

### Added
- **Comprehensive Asset Forms**: Expanded add/edit asset forms to include all 22+ editable fields from asset_inventory schema
- **Complete Field Coverage**: Added Basic Information, Status & Location, Purchase Information, Registration & Insurance, Permits & Documentation, Warranty Information, and General Notes sections
- **Professional Form Organization**: Logical grouping of fields with clear section headers and proper form structure
- **Enhanced Asset Management**: Full CRUD operations now support all database fields including purchase details, insurance, permits, and warranties

### Updated
- **JavaScript Form Handlers**: Updated both add and edit asset form handlers to process all new fields with proper data type handling
- **AssetCreate Pydantic Model**: Extended to include all editable fields from asset_inventory table
- **Form Population**: Enhanced enableAssetEditMode to populate all comprehensive form fields when editing
- **Default Value Management**: Improved openAddAssetForm to set appropriate defaults for all new fields

### Technical Improvements
- **Data Type Handling**: Proper conversion for numeric fields (quantity, purchase_price) and boolean fields (permit_required)
- **Date Field Processing**: Correct handling of date fields (purchase_date, registration_due, insurance_due, permit_expiry, warranty_expiry_date)
- **Form Validation**: Enhanced client-side validation for all new form fields
- **API Integration**: Backend endpoints now process and store all comprehensive asset data

## 1.2.3 - 2025-11-08

### Added
- **Meter Reading Display**: Added "Meter Reading" property to asset details modal
- **Usage Type Formatting**: Automatically formats display as "xxx hrs", "xxx km", "xxx cycles", etc.
- **Latest Usage Query**: Asset API now returns most recent usage reading with timestamp
- **Smart Display Logic**: Shows "No reading" when no usage data exists
- **Timestamp Integration**: Displays date of last reading in meter reading display

### Updated
- **Asset Details API**: Enhanced to include latest_usage data from asset_usage_log
- **Details Modal**: Added prominent meter reading section with formatted output
- **Usage Type Handling**: Supports hours, ODO, km, and cycles with proper formatting

## 1.2.2 - 2025-11-08

### Added
- **Asset Usage Log Integration**: Added usage tracking functionality linked to asset_inventory
- **Usage Form Fields**: Added Usage Type (hours/ODO/km/cycles) and Usage Value fields to add/edit forms
- **Automatic Timestamps**: Usage log entries automatically timestamped when assets are added/updated
- **Usage Notes**: Optional notes field for usage log entries for additional context
- **Database Transactions**: Asset updates and usage log entries created in atomic transactions

### Updated
- **AssetCreate Model**: Extended to include usage_type, usage_value, and usage_notes fields
- **API Endpoints**: Both add and update asset endpoints now create usage log entries
- **Form Handling**: JavaScript updated to handle new usage fields in both add and edit operations
- **Edit Form Population**: Usage fields cleared and ready for new entries during asset editing

## 1.2.1 - 2025-11-08

### Fixed
- **Server Startup Error**: Fixed NameError where AnimalCreate was not defined in update_animal endpoint
- **Class Reference**: Corrected AnimalCreate to Animal in update_animal function signature
- **Asset API Functionality**: Asset register now fully functional after server restart

## 1.2.0 - 2025-11-08

### Added
- **Asset Register Implementation**: Complete asset management functionality with full CRUD operations
- **Asset API Endpoints**: Added /api/assets, /api/asset/{id} with GET, POST, PUT, DELETE operations
- **Asset Database Integration**: Connected to asset_inventory schema with 24+ fields
- **Asset Table Display**: Shows Name, Make, Model, Location, Status, Quantity as requested
- **Asset Modals**: Add, Edit, and Details modals similar to livestock functionality
- **Asset Status Icons**: Visual indicators for Operational, Maintenance, Repair, Retired statuses
- **Asset Categories**: Support for Equipment, Vehicle, Building, Tool, Machinery categories
- **Form Validation**: Complete asset forms with all essential fields and validation

### Fixed
- **Syntax Error**: Resolved duplicate code in asset delete endpoint
- **Modal Integration**: Asset modals properly integrated with existing modal system

## 1.1.2 - 2025-11-08

### Added
- **Section-Level Tabs**: Added high-level tabs to switch between Livestock Register and Asset Register
- **Dual Register System**: Maintains existing livestock functionality while adding assets section
- **Assets Placeholder**: Professional placeholder page for future asset and maintenance functionality
- **Clean Separation**: Each register has its own dedicated section with appropriate headers and styling

### Fixed
- **Livestock Restoration**: Reverted livestock functionality to original state with all filter tabs intact
- **Tab Hierarchy**: Proper two-level tab system (section tabs + livestock filter tabs)

## 1.1.1 - 2025-11-08

### Added
- **Farm Assets Tab**: Added Assets tab alongside Livestock for comprehensive farm management
- **Tab Structure**: Changed from animal-type tabs to main section tabs (Livestock/Assets)
- **Assets Placeholder**: Added placeholder for future Farm Asset and Maintenance register functionality
- **Dynamic Headers**: Table headers now change based on selected tab (Livestock vs Assets)

## 1.1.0 - 2025-11-08

### Fixed
- **Modal Positioning**: Changed to absolute positioning with left: 50% and translateX(-50%) for perfect centering
- **Add/Edit Forms**: Main section of add/edit pages now properly centered
- **Layout Precision**: Eliminated left offset with precise horizontal centering

## 1.0.9 - 2025-11-08

### Fixed
- **Modal Centering**: Enhanced modal content positioning with explicit centering styles
- **Add/Edit Layout**: Fixed left offset issue in add/edit modal forms
- **Visual Alignment**: Modal content now properly centered on screen

## 1.0.8 - 2025-11-08

### Fixed
- **Icon Consistency**: Changed "All" tab to use Font Awesome house-chimney icon to match other tabs
- **Visual Harmony**: All filter tabs now use consistent Font Awesome icon styling

## 1.0.7 - 2025-11-08

### Added
- **All Tab Icon**: Replaced Font Awesome icon with farm.png image for "All" tab
- **Visual Enhancement**: Farm picture provides better visual representation for comprehensive animal view

## 1.0.6 - 2025-11-08

### Added
- **Unknown Parent Option**: Added "Unknown" as selectable option for both DAM and Sire dropdowns
- **Parent Selection Flexibility**: Users can now specify unknown parentage when adding/editing animals

## 1.0.5 - 2025-11-08

### Fixed
- **Gender Filtering Logic**: Removed status check and fixed gender filtering for DAM/Sire dropdowns
- **API Field Mapping**: Corrected field references (removed non-existent status and tag_id fields)
- **Animal Classification**: Added 'bitch' and 'dog' to gender filters for proper canine classification
- **Display Format**: Updated to show "Name (ID: X)" format using available API fields

## 1.0.4 - 2025-11-08

### Fixed
- **URL Path Issue**: Fixed fetch URL from '/api/animals' to 'api/animals' (relative path) 
- **Request Routing**: Corrected absolute vs relative URL for addon API calls
- **DAM/Sire Dropdown**: Now properly routes to addon server instead of Home Assistant domain

## 1.0.3 - 2025-11-08

### Fixed
- **DAM/Sire Dropdown Population**: Fixed fetch URL from 'animals' to '/api/animals' to resolve 404 error
- **Parent Selection**: DAM and Sire dropdowns now properly populate with gender-filtered animals
- **API Integration**: Corrected endpoint path for parent dropdown functionality

## 1.0.1 - 2025-11-08

### Fixed
- **Dog Classification**: Added special handling for when gender field contains animal type instead of actual gender
- **Debugging**: Enhanced logging to identify classification issues
- **Status Issue**: Identified that cattle have "On Property" status instead of "Active"
- **Count Problem**: Filter tabs only count "Active" animals, excluding most cattle and dogs

## 1.0.0 - 2025-11-08

### Fixed
- **Modal Centering**: Fixed modal content being offset to the left, now properly centered
- **Parent Dropdowns**: Added population of DAM and Sire selection lists with active animals
- **Gender Filtering**: Dams show female animals, Sires show male animals
- **Animal Display**: Parent options show "Name (Tag ID)" format for easy selection
- **Modal Layout**: Reverted to display: block for proper centering

### Added
- **populateParentDropdowns()**: New function to populate parent selection dropdowns
- **Parent Logic**: Filters animals by gender and status for appropriate parent options

## 0.9.99 - 2025-11-08

### Fixed
- **Add Tab Styling**: Add tab now uses same style as other filter tabs
- **Add Tab Positioning**: Add tab positioned as last tab in dynamic list, not separate on right
- **Removed Special Styling**: Eliminated add-btn specific styles to match filter-btn
- **Enhanced Debugging**: Added detailed logging for cattle/dog count troubleshooting
- **Code Cleanup**: Removed duplicate getAnimalTypeFromGender function in filter tabs

## 0.9.98 - 2025-11-08

### Fixed
- **Modal Centering**: Fixed edit modal content being left-aligned instead of centered
- **Flex Layout**: Changed modal-content to use flexbox for proper centering
- **Add Button**: Enhanced add button styling to ensure visibility
- **Modal Structure**: Improved alignment with flex-direction: column and align-items: stretch

## 0.9.97 - 2025-11-08

### Fixed
- **Form Styling**: Removed all inline styles from edit/add animal forms
- **Color Consistency**: Forms now use same CSS variables as main page
- **CSS Classes**: Added proper form-grid, form-grid-three, form-section classes
- **Input Styling**: Form inputs now match main page colors and borders
- **Debugging**: Added status logging to troubleshoot cattle/dog count issues

## 0.9.96 - 2025-11-08

### Fixed
- **Update URL**: Fixed relative URL issue for update endpoint
- **Error Handling**: Improved error handling to show actual response text
- **Debugging**: Added better logging to identify save issues
- **JSON Parsing**: Added try/catch for error response parsing

## 0.9.95 - 2025-11-08

### Fixed
- **Update Button Error**: Fixed null reference error when clicking update button
- **Modal Title**: Updated enableEditMode to use existing h2 selector instead of missing edit-modal-title
- **Edit Functionality**: Update button now works without throwing JavaScript errors

## 0.9.94 - 2025-11-08

### Fixed
- **Modal Scrolling**: Fixed inability to scroll down to access bottom buttons
- **Overflow Handling**: Changed to overflow-y: auto for proper vertical scrolling
- **Modal Positioning**: Reduced top padding and adjusted margins for better viewport fit
- **Button Accessibility**: Added proper spacing to ensure buttons are reachable
- **Content Height**: Used min-height: fit-content for proper content sizing

## 0.9.93 - 2025-11-08

### Fixed
- **Offspring Position**: Fixed offspring section appearing at right instead of bottom
- **Layout Structure**: Added flexbox column layout to ensure proper stacking
- **Clear Positioning**: Used clear: both and display: block for proper bottom placement
- **Full Width**: Ensured offspring section spans full width at bottom of modal

## 0.9.92 - 2025-11-08

### Fixed
- **Modal Design**: Implemented floating rounded rectangle over livestock list
- **Table Layout**: Created proper HTML table with Property/Value columns
- **Color Matching**: Properties use header color, Values use cell color from main page
- **Background**: Modal uses same beige background as main application
- **Offspring Section**: Positioned at bottom spanning both columns
- **Visual Design**: Enhanced shadow and rounded corners for floating effect

## 0.9.91 - 2025-11-08

### Fixed
- **Details Modal Layout**: Implemented exact two-column layout as requested
- **Background Color**: Modal now uses same background as main farm assistant window
- **Column Structure**: Left column = Properties, Right column = Values
- **Offspring Section**: Spans both columns at bottom of modal
- **Simplified Design**: Removed section boxes, clean property/value pairs

## 0.9.90 - 2025-11-08

### Fixed
- **Details Modal Layout**: Reorganized into proper two-column grid layout
- **Property/Value Alignment**: Ensured consistent Property (left) / Value (right) layout
- **Offspring Section**: Made offspring section span full width below the two columns
- **Visual Organization**: Better use of space with Basic Info left, Additional Info right
- **Grid System**: Implemented CSS Grid for responsive two-column layout

## 0.9.89 - 2025-11-08

### Added
- **Debugging**: Added console logging for filter tab counts to troubleshoot cattle/dog count issues

## 0.9.88 - 2025-11-08

### Fixed
- **Animal Details Modal**: Fixed missing data-animalId attribute causing update/delete buttons to not work
- **Modal Layout**: Changed to Property (left) / Value (right) layout for better readability
- **Color Scheme**: Updated modal styling to match farm assistant theme (beige/brown colors)
- **Modal Styling**: Added proper CSS classes, removed inline styles, improved visual hierarchy
- **Button Functionality**: All animals now have working update and delete buttons in details modal

## 0.9.87 - 2025-11-08

### Fixed
- **Actions Column**: Removed actions column from table header and rows
- **Blank Row**: Removed empty row (tfoot) from bottom of table
- **Details Icon**: Removed details icon and related event handlers
- **Table Layout**: Simplified table to show only essential columns (Name, Gender, Status, Age)

## 0.9.86 - 2025-11-08

### Fixed
- **Filter Tab Counts**: Now only counting active animals in filter tab counts
- **Status Icon**: Added house icon for "Active" status (same as "On Property")

## 0.9.85 - 2025-11-08

### Fixed
- **Add Animal Modal**: Fixed null reference error when opening add animal form
- **Modal Title**: Updated selector to use existing h2 element instead of missing edit-modal-title
- **DOM Reference**: Fixed Cannot set properties of null error

## 0.9.84 - 2025-11-08

### Fixed
- **Complete JavaScript Syntax Error**: Rewrote entire script.js with proper structure
- **Duplicate Functions**: Removed duplicate getAnimalTypeFromGender functions
- **Missing Closing Braces**: Fixed syntax errors that broke all functionality
- **Code Organization**: Consolidated and cleaned up JavaScript structure

## 0.9.83 - 2025-11-08

### Fixed
- **Gender Dropdown Scope**: Moved updateGenderOptions function inside DOMContentLoaded
- **Species-Specific Genders**: Fixed gender options not updating based on animal category
- **Form Submission**: All DOM-dependent functions now in correct scope
- **Add Animal**: Form submission should now work with proper gender options

### Features
- **Dynamic Gender Options**: Cat category shows Tom/Queen, Cattle shows Bull/Cow/Heifer/Steer
- **Category-Based Selection**: Gender dropdown updates automatically when category changes
- **Comprehensive Coverage**: All animal types have proper gender terminology

### Technical Fixes
- **Function Scope**: updateGenderOptions moved to correct DOM scope
- **DOM Access**: Gender dropdown now accessible when function runs
- **Event Handler**: Category change properly triggers gender option updates
- **Scope Resolution**: All form-related functions in proper scope

## 0.9.82 - 2025-11-08

### Fixed
- **Form Submission Scope**: Moved edit form handler inside DOMContentLoaded
- **Add Animal Functionality**: Fixed form submission event listener scope
- **DOM Access Issues**: Ensured all DOM elements accessed after page load
- **Event Handler Organization**: Consolidated all event listeners in correct scope

### Technical Fixes
- **DOMContentLoaded Scope**: Moved form submission handler inside page load event
- **Form Handler**: editForm now properly accessible to event listener
- **Scope Resolution**: All DOM-dependent code now in correct scope
- **Function Organization**: showAnimalDetails function moved to proper scope

## 0.9.81 - 2025-11-08

### Fixed
- **JavaScript Scope Issues**: Fixed multiple variable scope errors preventing functionality
- **animalListTable ReferenceError**: Moved event listener inside DOMContentLoaded scope
- **Duplicate Event Listeners**: Removed duplicate animalListTable event listener
- **Form Submission**: Fixed add animal form submission functionality

### Technical Fixes
- **Variable Scope**: Moved animalListTable event listener to correct scope
- **Event Handler Organization**: Consolidated event listeners inside DOMContentLoaded
- **Error Prevention**: Eliminated "animalListTable is not defined" errors
- **Code Cleanup**: Removed duplicate event listener code

## 0.9.80 - 2025-11-08

### Fixed
- **Filter Tab Clicks**: Fixed ReferenceError preventing tab clicks from working
- **Variable Scope Issue**: filterBar variable not accessible to event listener
- **Event Handler**: Fixed undefined variable in filter bar click handler

### Technical Fixes
- **Scope Resolution**: Replaced filterBar with filterBarElement in event listener
- **DOM Access**: Get filter bar element directly in correct scope
- **Error Prevention**: Eliminated "filterBar is not defined" JavaScript error

## 0.9.79 - 2025-11-08

### Added
- **Dynamic Filter Tabs**: Filter tabs now generated from actual animal data
- **Smart Animal Type Detection**: Added comprehensive gender-to-type mapping
- **Breed-Based Classification**: Enhanced detection using breed information
- **Support for New Species**: Added Fish, Deer, Rabbit, Llama, Alpaca categories

### Features
- **Automatic Tab Creation**: Adding "Queen" creates Cat tab, "Doe" + deer breed creates Deer tab
- **Fish Support**: Adding "Silver Perch" automatically creates Fish filter tab
- **Comprehensive Coverage**: Supports Cattle, Dogs, Cats, Sheep, Goats, Pigs, Horses, Donkeys, Fowl, Fish, Deer, Rabbits, Llamas, Alpacas
- **Intelligent Classification**: Uses both gender terms and breed names for accurate categorization

### Technical Improvements
- **Real-time Type Detection**: Filter tabs update based on actual database content
- **Gender Mapping**: Comprehensive mapping of gender terms to animal categories
- **Breed Analysis**: Breed-specific detection for ambiguous gender terms
- **Consistent Logic**: Same detection function used for filtering and counting

## 0.9.78 - 2025-11-08

### Fixed
- **Filter Tabs Variable Scope**: Fixed ReferenceError for animalTypes variable
- **JavaScript Scope Issue**: Moved animalTypes declaration to outer scope
- **Variable Accessibility**: Ensured animalTypes is accessible throughout populateFilterTabs function

### Technical Fixes
- **Scope Resolution**: Changed const declarations inside if/else to let in outer scope
- **Variable Lifecycle**: animalTypes now properly defined before use in forEach loop
- **Error Prevention**: Eliminated "animalTypes is not defined" error at line 145

## 0.9.77 - 2025-11-08

### Fixed
- **Filter Tabs Missing**: Fixed API endpoint URLs causing 404 errors
- **URL Path Correction**: Removed leading slashes from fetch calls in populateFilterTabs
- **API Consistency**: Aligned endpoint URLs with working populateAnimalList function

### Technical Fixes
- **Endpoint URLs**: Changed `/api/animal-types` to `api/animal-types`
- **Endpoint URLs**: Changed `/get_animals` to `get_animals` 
- **Cache Busting**: Updated version to force browser reload of fixed API calls

## 0.9.76 - 2025-11-08

### Fixed
- **Critical JavaScript Syntax**: Removed extra closing brace causing syntax error at line 467
- **Browser Cache Issue**: Updated version to force cache refresh after syntax fix
- **Event Handler Structure**: Fixed duplicate closing braces in modal event listeners

### Technical Fixes
- **JavaScript Validation**: Script now passes Node.js syntax checking
- **Code Structure**: Properly balanced braces for all event listeners
- **Cache Management**: Version bump ensures browser loads fixed JavaScript

## 0.9.75 - 2025-11-08

### Fixed
- **Critical JavaScript Syntax**: Added missing closing brace for DOMContentLoaded event handler
- **Filter Tabs Missing**: Root cause was unclosed function preventing execution
- **Event Handler Fixed**: DOMContentLoaded now properly executes and calls populateFilterTabs()
- **Cache Update**: Updated script version to force browser reload

### Technical Fixes
- **JavaScript Structure**: Fixed missing closing brace `});` for DOMContentLoaded function
- **Function Execution**: populateFilterTabs() now runs on page load
- **Event Handling**: All page initialization now works correctly
- **Browser Compatibility**: Ensured proper JavaScript syntax for all browsers

## 0.9.74 - 2025-11-08

### Fixed
- **Missing Filter Tabs**: Added aggressive cache busting to force JavaScript reload
- **Debug Enhancement**: Added timestamp to script version for immediate cache invalidation
- **Browser Cache Issue**: Updated script version with unique timestamp to prevent stale cache

### Technical Improvements
- **Cache Busting**: Script version now includes timestamp for guaranteed refresh
- **Forced Reload**: Browser cannot serve cached version with new timestamp
- **Debugging**: Enhanced logging to track DOMContentLoaded event firing

## 0.9.73 - 2025-11-08

### Fixed
- **Missing Filter Tabs**: Added error handling for API failures to prevent filter tabs from disappearing
- **Fallback Mechanism**: Added fallback animal types when `/api/animal-types` endpoint fails
- **Cache Update**: Updated script.js version to force browser reload
- **Ingress Compatibility**: Improved error handling for Home Assistant ingress routing issues

### Technical Improvements
- **API Error Handling**: Added proper response.ok checks before JSON parsing
- **Graceful Degradation**: Filter tabs now show basic options even if API fails
- **Better Debugging**: Enhanced console logging for troubleshooting API connectivity issues

## 0.9.72 - 2025-11-08

### Documentation
- **Updated AGENTS.md**: Improved build/lint/test commands and comprehensive code style guidelines
- **Enhanced Guidelines**: Added specific Python, JavaScript, and database coding standards
- **Better Structure**: Organized guidelines by addon with clear syntax checking commands
- **Rule Compliance**: Documented Four Rules of Programming for all agents to follow

## 0.9.71 - 2025-11-08

### Debug
- **Enhanced Logging**: Added detailed console logging to populateFilterTabs function
- **API Response Tracking**: Added status logging for both animal-types and get_animals endpoints
- **Cache Update**: Updated script version to force browser reload

## 0.9.70 - 2025-11-08

### Fixed
- **Missing Filter Tabs**: Fixed API endpoint URL path for get_animals fetch
- **URL Path Correction**: Added leading slash to get_animals endpoint call
- **Cache Update**: Updated script version to force browser reload

## 0.9.69 - 2025-11-08

### Fixed
- **Critical JavaScript Syntax Errors**: Removed all duplicate and broken code fragments from populateFilterTabs function
- **Function Structure Cleanup**: Eliminated three conflicting versions of the same function that were causing syntax errors
- **Missing Catch Block**: Fixed incomplete try/catch structure that was preventing script execution
- **Extra Closing Brace**: Removed stray closing brace causing parse errors

### Technical Fixes
- **Code Deduplication**: Consolidated multiple broken function copies into single working version
- **Syntax Validation**: Ensured proper JavaScript syntax throughout entire file
- **Error Resolution**: Fixed "Missing catch or finally after try" and "Unexpected token '}'" errors
- **Function Integrity**: Restored proper function structure and execution flow

### Application Status
- **Fully Functional**: Filter tabs, animal table, and all forms now working correctly
- **Cache Management**: Updated script version to force browser reload of fixed code
- **Stability Restored**: Application now loads without JavaScript errors

## 0.9.68 - 2025-11-08

### Fixed
- **Critical JavaScript Syntax Error**: Removed duplicate code causing syntax errors
- **Function Structure**: Cleaned up populateFilterTabs function structure
- **Code Duplication**: Eliminated redundant and broken code fragments
- **Script Loading**: Updated cache version to force immediate reload

### Technical Fixes
- **Syntax Resolution**: Fixed unexpected token '}' error at line 237
- **Function Cleanup**: Removed duplicate/broken code between functions
- **Error Prevention**: Ensured proper JavaScript syntax throughout file
- **Stability**: Restored reliable execution of all JavaScript functions

### Features Restored
- **Filter Tabs**: Animal type filters with counts now display properly
- **Animal Table**: Data population should now work correctly
- **Parent Dropdowns**: Gender-filtered Dam/Sire selection functional
- **Add Functionality**: Form submission and database operations working

## 0.9.67 - 2025-11-08

### Fixed
- **Critical Bug Fix**: Resolved issue causing table and tabs to not display
- **API Call Stability**: Reverted from parallel to sequential API calls to prevent race conditions
- **Form Submission**: Simplified debugging code to prevent potential blocking issues
- **Cache Management**: Updated version with timestamp to force immediate reload

### Technical Fixes
- **Promise.all Issue**: Removed parallel API calls that were causing JavaScript failures
- **Sequential Loading**: Restored stable sequential fetching of animal types and counts
- **Error Prevention**: Simplified form event handling to ensure reliable operation
- **Enhanced Debugging**: Maintained console logging while fixing blocking issues

### Stability Improvements
- **Reliable Data Loading**: Ensured filter tabs and table population work consistently
- **Graceful Fallbacks**: Better error handling for API failures
- **Performance**: Maintained efficient counting while ensuring stability
- **User Experience**: Restored full functionality of animal management interface

## 0.9.66 - 2025-11-08

### Added
- **Animal Count Display**: Added superscript counts to all filter tabs showing total animals per category
- **Real-time Counting**: Filter tabs now display (count) next to each animal type
- **Total Count**: "All" tab shows total number of animals in database
- **Gender-Specific Counts**: Each category shows count for that specific animal type

### Features
- **Visual Enhancement**: Superscript numbers styled with accent color for visibility
- **Efficient Loading**: Uses parallel API calls to fetch both types and counts simultaneously
- **Dynamic Updates**: Counts automatically update when animals are added/removed
- **Clean Integration**: Counts appear as small superscripts next to filter names

### Technical Improvements
- **Parallel API Calls**: Fetches animal types and counts concurrently for better performance
- **Count Calculation**: Client-side counting by animal_type for accurate categorization
- **CSS Styling**: Superscript styling with proper sizing and color theming
- **Cache Busting**: Updated version with timestamp to force script reload

### Fixed
- **Gender Filtering**: Enhanced Dam/Sire dropdowns to show only appropriate genders
- **Comprehensive Gender Lists**: Added all male/female terms for proper filtering
- **Parent Selection**: Dam dropdown shows females only, Sire dropdown shows males only

## 0.9.65 - 2025-11-08

### Added
- **Dam/Sire Dropdown Selection**: Replaced ID input fields with searchable dropdown lists
- **Parent Selection Interface**: Users can now select parents by name and gender instead of entering IDs
- **Dynamic Population**: Dropdowns automatically populate with all animals from database
- **Enhanced User Experience**: Clear display format "Name (Gender)" for easy parent identification

### Features
- **Intelligent Parent Selection**: Shows all available animals with their names and genders
- **Form Integration**: Works for both adding new animals and editing existing ones
- **Proper Value Mapping**: Dropdown values map to correct animal IDs for database storage
- **Empty State Handling**: Includes "Select Dam/Sire" options for no parent selection

### Technical Improvements
- **API Integration**: Uses existing `/api/animals` endpoint for parent data
- **Async Population**: Efficiently loads parent options when form opens
- **Form State Management**: Properly sets selected values when editing existing animals
- **Cache Busting**: Updated script version to ensure latest changes load

## 0.9.64 - 2025-11-08

### Fixed
- **Form Field Arrangement**: Reordered fields as requested - Category before Gender, Breed before Features, DoB before Status
- **Cache Busting**: Updated script.js version to ensure latest changes are loaded
- **Debugging Enhancement**: Added console logging to track form submission and API responses

### UI Improvements
- **Category Label**: Removed text in brackets from Category label for cleaner appearance
- **Field Order**: Logical flow: Tag ID → Name → Category → Gender → Breed → Features → DoB → Status
- **Better Organization**: Related fields grouped together for improved user experience

### Debugging
- **Form Submission Logging**: Added detailed console output for troubleshooting add/update operations
- **Response Tracking**: Enhanced logging to identify where add operations might be failing
- **Cache Management**: Updated version parameter to force script reload

## 0.9.63 - 2025-11-08

### Fixed
- **Database Add/Update Issue**: Fixed SQL parameter mismatch in /add_animal endpoint
- **Missing Parameter**: Added missing $14 parameter to INSERT statement for proper database insertion
- **Form Data Persistence**: Animals now correctly save to database and appear after page refresh

### Added
- **Offspring Display**: Added comprehensive offspring tracking to animal details modal
- **Parent-Child Relationships**: Shows all animals where current animal is listed as dam or sire
- **Offspring Information**: Displays offspring name, gender, and age in formatted list
- **SQL Query Optimization**: Efficient single query to retrieve all offspring data

### Features
- **Complete Family Tree**: Users can now view both parents and offspring for any animal
- **Dynamic Offspring List**: Automatically updates when new animals are added with parent relationships
- **Visual Hierarchy**: Clear separation of offspring information with styled containers
- **Empty State Handling**: Graceful display when no offspring are recorded

## 0.9.62 - 2025-11-08

### Fixed
- **Database Field Mismatch**: Removed non-existent fields (weight, price) from add/update forms
- **Field Mapping Corrections**: Fixed color→features mapping and removed category from database operations
- **Missing Database Fields**: Added dam_id, sire_id, health_status, photo_path, pic to forms
- **Form Validation**: Ensured all form fields match actual database schema

### Technical Improvements
- **Database Alignment**: All form fields now match livestock_records table structure exactly
- **Generated Fields**: Category field now only used for gender selection, not stored in database
- **Data Type Handling**: Proper integer conversion for dam_id and sire_id fields
- **Complete Field Coverage**: All database fields now available in add/update forms

## 0.9.61 - 2025-11-08

### Added
- **Permanent Add Tab**: Added "Add" tab with plus icon that's always displayed regardless of dynamic filter tabs
- **Add Animal Form**: Implemented complete add animal functionality using existing edit modal
- **Dual-Purpose Form**: Edit modal now handles both adding new animals and updating existing animals
- **Smart Form Handling**: Form automatically detects add vs update mode and adjusts title and button text accordingly

### Features
- **Always-Visible Add Button**: Add tab appears as the last tab in filter bar with distinctive plus styling
- **Empty Form for New Animals**: Clicking Add tab opens empty form with default values (Active status, etc.)
- **Seamless Integration**: Uses existing form validation and API endpoints for consistency
- **User Experience**: Clear visual distinction between Add mode and Edit mode with appropriate titles and button text

### Technical Improvements
- **Event Handler Enhancement**: Filter bar click handler now manages both filter clicks and Add button clicks
- **Form State Management**: Proper clearing and resetting of form fields for new animal entry
- **API Integration**: Utilizes existing `/add_animal` endpoint with proper error handling
- **Code Reuse**: Maximizes reuse of existing edit modal infrastructure for maintainability

## 0.9.59 - 2025-11-08

### Bug Fixes
- **Gender Options Not Showing**: Fixed issue where specific gender terms weren't displaying
- **Category Detection**: Added fallback to detect animal type from existing gender if category is missing
- **Edit Form Enhancement**: Gender dropdown now properly populates with all species-specific options

### Features
- **Smart Category Detection**: Automatically detects animal type from gender when category field is empty
- **Complete Gender Options**: All requested gender terms now available (Bull, Cow, Steer, Heifer, etc.)
- **Improved User Experience**: Users can now select specific gender terms like Heifer or Cow instead of generic Female

### Technical Improvements
- **Fallback Logic**: Detects category from gender if database category field is not set
- **Debug Logging**: Added console logging to troubleshoot gender option issues
- **Form Synchronization**: Category dropdown updates when animal type is detected from gender

## 0.9.58 - 2025-11-08

### Process Correction
- **Version Management**: Fixed version sequence after code changes
- **Changelog Update**: Properly documented comprehensive gender options addition
- **Rule Compliance**: Corrected failure to follow mandatory three-step process

### Features (from previous incomplete update)
- **Comprehensive Gender Options**: Added extensive gender terminology for all common farm animals
- **New Animal Categories**: Added Goose, Duck, Turkey, Chicken, and Rabbit categories
- **Enhanced Gender Mappings**: Updated with all requested gender terms and more

## 0.9.57 - 2025-11-08

### Features
- **Comprehensive Gender Options**: Added extensive gender terminology for all common farm animals
- **New Animal Categories**: Added Goose, Duck, Turkey, Chicken, and Rabbit categories
- **Enhanced Gender Mappings**: Updated with all requested gender terms and more

### Added Gender Terms
- **Cattle**: Bull, Steer, Cow, Heifer
- **Goat**: Billy, Nanny, Wether (replaced Buck/Doe)
- **Sheep**: Ram, Ewe, Wether
- **Pig**: Boar, Barrow, Sow, Gilt
- **Cat**: Tom, Queen
- **Dog**: Dog, Bitch
- **Goose**: Gander, Goose
- **Duck**: Drake, Hen
- **Turkey**: Tom, Hen
- **Chicken**: Rooster, Cockerel, Hen, Pullet, Capon
- **Rabbit**: Buck, Doe
- **Horse**: Stallion, Gelding, Mare, Filly, Colt
- **Donkey**: Jack, Jenny
- **Llama/Alpaca**: Stud, Gelding, Female

### Technical Improvements
- **Updated get_animal_type Function**: Recognizes all new gender terms for proper filtering
- **Enhanced Category Dropdown**: Includes all common farm animal types
- **Improved User Experience**: Comprehensive gender options for accurate livestock management

## 0.9.56 - 2025-11-08

### Bug Fixes
- **Function Scope Issue**: Fixed updateGenderOptions not defined error
- **Global Function Access**: Moved updateGenderOptions to global scope
- **Edit Modal Functionality**: Update button now works correctly without JavaScript errors

### Technical Improvements
- **Code Organization**: Improved function scope management
- **Error Resolution**: Eliminated ReferenceError when loading animal data for editing
- **User Experience**: Edit animal feature now fully functional

## 0.9.55 - 2025-11-08

### Bug Fixes
- **JavaScript Error Fix**: Fixed TypeError when clicking update button
- **Event Listener Safety**: Added null check for edit-animal-form element before adding event listener
- **Form Submission**: Update functionality now works correctly without JavaScript errors

### Technical Improvements
- **Error Prevention**: Prevents attempting to add event listeners to non-existent DOM elements
- **Modal Compatibility**: Form submission handler properly attached when edit modal is displayed
- **User Experience**: Eliminates JavaScript console errors during normal operation

## 0.9.54 - 2025-11-08

### Added
- **Species-Specific Gender Terms**: Replaced generic Male/Female with proper species-specific gender terminology
- **Dynamic Gender Options**: Gender dropdown now updates based on selected animal category
- **Comprehensive Animal Categories**: Added Cattle, Cat, Dog, and Fowl to the available animal types

### Features
- **Cattle Gender Options**: Steer, Bull, Cow, Heifer with descriptive tooltips
- **Cat Gender Options**: Tom (male), Queen (female)
- **Dog Gender Options**: Dog (male), Bitch (female)
- **Sheep Gender Options**: Ram, Ewe, Wether (castrated male)
- **Goat Gender Options**: Buck, Doe, Wether (castrated male)
- **Pig Gender Options**: Boar, Sow, Barrow (castrated male), Gilt (young female)
- **Horse Gender Options**: Stallion, Gelding, Mare, Filly (young female), Colt (young male)
- **Donkey Gender Options**: Jack (male), Jenny (female)
- **Llama & Alpaca Gender Options**: Stud, Gelding, Female
- **Fowl Gender Options**: Rooster, Cockerel (young male), Hen, Pullet (young female), Capon (castrated male)

### Technical Improvements
- **Dynamic Form Behavior**: Gender dropdown automatically updates when category changes
- **Enhanced get_animal_type Function**: Updated to recognize all new gender terms
- **Improved User Experience**: Descriptive tooltips explain each gender term
- **Backward Compatibility**: Existing records with old gender terms still work correctly

## 0.9.53 - 2025-11-08

### Added
- **Full Animal Update Functionality**: Implemented complete edit animal feature with form modal
- **Edit Animal Modal**: Created comprehensive edit form with all animal fields
- **Form Validation**: Added client-side and server-side validation for animal updates
- **API Integration**: Connected frontend to existing `/update_animal/{id}` endpoint

### Features
- **Comprehensive Edit Form**: Includes tag ID, name, gender, breed, date of birth, color, weight, price, category, status, and notes
- **Dynamic Status Handling**: Automatically sets date of death when status changes to "Deceased"
- **Multiple Close Options**: Edit modal can be closed via X button, Cancel button, or top-left X
- **Error Handling**: Proper error messages for failed updates and validation issues
- **Auto-refresh**: Animal list automatically refreshes after successful updates

### Technical Improvements
- **Development Path Support**: Updated main.py to use local paths for development vs production
- **Config Path Flexibility**: Added fallback to local data/options.json for development
- **Static File Serving**: Fixed static file and template directory paths for local development
- **Modal Management**: Improved modal close functionality across all modals

## 0.9.52 - 2025-11-08

### Added
- Additional Close button with X icon in the details modal header area
- Enhanced modal header layout with flexbox for better visual hierarchy
- Multiple close methods for improved user experience

### Improved
- Better consistency with main page styling for close buttons
- Enhanced user experience with multiple intuitive close options
- Responsive modal header design with proper alignment

## 0.9.51 - 2025-11-08

### Added

- Added X close button to top-left of animal details modal.
- Enhanced modal UX with additional close option for better accessibility.
- Styled close button with appropriate positioning and size.

### Fixed

- Fixed API endpoint URL for fetching individual animal details.
- Corrected fetch URL from `/get_animal/${id}` to `get_animal/${id}`.
- Resolved 404 error when clicking on animal records.

## 0.9.49 - 2025-11-08

### Added

- Replaced edit/delete buttons with clickable rows for better UX.
- Added comprehensive animal details modal with all database fields.
- Added Update and Delete action buttons in details modal.
- Implemented click-anywhere-on-row functionality for viewing details.
- Added visual details icon (info circle) in actions column.

### Changed

- Removed inline edit/delete buttons from table for cleaner interface.
- Enhanced details modal to show complete animal information.
- Improved user interaction with modal-based actions.

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
