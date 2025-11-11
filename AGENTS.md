# Agent Guidelines for ha-addons

This repository contains multiple Home Assistant addons. Each addon has its own directory and specific guidelines.

## Build/Lint/Test Commands

### rain-predictor-addon
- **Install**: `pip3 install -r rain-predictor-addon/requirements.txt`
- **Syntax Check**: `python3 -m py_compile rain_predictor.py web_ui.py`
- **Local Dev**: `cd rain-predictor-addon && ./run_local.sh`
- **Test**: No test framework configured - use `pytest` for new tests

### farm-assistant-addon  
- **Install**: Dependencies in Dockerfile - `fastapi uvicorn asyncpg jinja2`
- **Syntax Check**: `python3 -m py_compile main.py`
- **Local Dev**: `cd farm-assistant-addon && uvicorn main:app --host 0.0.0.0 --port 8000`
- **Test**: No test framework configured - use `pytest` for new tests

## Code Style Guidelines

### Python (Both Addons)
- **Style**: PEP 8 compliance
- **Naming**: snake_case for variables/functions, PascalCase for classes, UPPER_CASE for constants
- **Type Hints**: Required for all function signatures and class attributes
- **Docstrings**: Use triple quotes for all classes and public functions
- **Imports**: Group standard library, third-party, and local imports separately
- **Error Handling**: Use try/except with specific exceptions, log errors appropriately

### JavaScript (rain-predictor-addon)
- **Style**: ES6+, camelCase for variables/functions, PascalCase for classes
- **Functions**: Use arrow functions for callbacks, regular functions for methods
- **Async**: Use async/await over Promise chains
- **DOM**: Use event delegation for dynamic content

### Database (farm-assistant-addon)
- **Queries**: Use parameterized queries with asyncpg
- **Connections**: Always close connections in try/finally blocks
- **Models**: Use Pydantic for request/response validation

## The Five Rules of Programming (MANDATORY)

**ALL CODE CHANGES MUST FOLLOW THE FIVE CODING COMMANDMENTS AT ALL TIMES:**

**The Coding Commandments shall be followed without exception. These are located in `/home/sog/ai-projects/ha-addons/TheCodingCommandments.txt` and must be adhered to strictly.**

### Summary of The Five Coding Commandments:

1. **Code Purity**: Ensure thy code is syntactically pure - `python3 -m py_compile main.py` shall complete with no errors.

2. **Configuration Validation**: Validate thy configuration - `python3 -c "import json; json.load(open('data/options.json'))"` shall complete successfully.

3. **Diligent Testing**: Test thy work with diligence:
   - Thine addon shall load and not crash
   - Thine existing features shall remain functional, with no regressions
   - Thine new or modified features shall address the user's needs
   - Thine feature in progress shall have no console or API errors
   - All of the above shall be tested and remedied before proceeding

4. **Sacred Process**: Follow the sacred process:
   - The version in config.yaml shall be updated
   - The changelog shall be updated with the changes made
   - Thy changes shall be committed with git add and git commit
   - Thy changes shall be pushed using ./run_gitpush.sh

5. **Correct Paths**: Use the correct paths:
   - Correct paths, such as /farm-assistant-addon/, shall be used when needed
   - There shall be no "No such file or directory" errors

**REMEMBER: Filter everything you do against The Five Coding Commandments!**
