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

## The Four Rules of Programming (MANDATORY)

**ALL CODE CHANGES MUST FOLLOW THESE FOUR RULES:**

1. **Check Python Syntax**: Always run `python3 -m py_compile main.py` to check for syntax errors before proceeding.

2. **Validate JSON Configuration**: Run `python3 -c "import json; json.load(open('data/options.json'))"` to ensure JSON files are valid.

3. **Follow Mandatory Process**: Always complete these three steps when making changes:
   - Update version in config.yaml
   - Update changelog with changes made
   - Commit and push using `./run_gitpush.sh`

4. **Path Correction**: 
   - If you get "No such file or directory" error, add `/farm-assistant-addon/` to the path and try again.
   - **Exception 4a**: `run_gitpush.sh` is located at `/home/sog/ai-projects/ha-addons/run_gitpush.sh`

**REMEMBER: Filter everything you do against these four rules!**
