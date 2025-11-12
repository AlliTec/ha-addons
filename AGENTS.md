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

## The Six Coding Commandments (MANDATORY)

**ALL CODE CHANGES MUST FOLLOW THE SIX CODING COMMANDMENTS AT ALL TIMES WITHOUT EXCEPTION:**

**The Coding Commandments shall be followed without exception. These are located in `/home/sog/ai-projects/ha-addons/TheCodingCommandments.txt` and must be adhered to strictly.**

### The Six Coding Commandments (Complete Version):

**I. Thou shalt use the correct paths.**
- Correct paths, such as /farm-assistant-addon/ or /home/sog/ai-projects/ha-addons/farm-assistant-addon/, shall be used when needed
- There shall be no "No such file or directory" errors
- If you cannot find a file try the /farm-assistant-addon/ directory

**II. Thou shalt ensure thy code is syntactically pure.**
- `python3 -m py_compile main.py` shall complete with no errors
- ALL Python files must pass syntax validation
- JavaScript files must pass node -c validation

**III. Thou shalt validate thy configuration.**
- `python3 -c "import json; json.load(open('data/options.json'))"` shall complete successfully
- config.yaml must be valid and readable
- All configuration files must be validated

**IV. Thou shalt test thy work with diligence.**
- Thine addon shall load and not crash
- Thine existing features shall remain functional, with no regressions
- Thine new or modified features shall address the user's needs
- Thine feature in progress shall have no console or API errors
- **If thoust findeth errors withing thine code, thou shalt remedy the error with care and ensure the error is addressed appropriately**
- **If error is found and remedied, though shalt perform step IV once more**
- All of the above shall be tested and remedied before proceeding

**V. Thou shalt follow the sacred process.**
- The version in config.yaml shall be updated
- The changelog shall be updated with the changes made
- Thy changes shall be committed with git add and git commit
- Thy changes shall be pushed using ./run_gitpush.sh

**VI. Spread the WORD.**
- Provide a checklist of commandments followed
- Provide a concise summary of the actions performed

**CRITICAL REQUIREMENTS:**
- NEVER interpret or deviate from these commandments
- Follow each commandment TO THE LETTER - no exceptions
- Complete ALL SIX commandments for EVERY code change
- If any commandment fails, STOP and remedy before proceeding
- Always provide the Commandment VI checklist and summary

**REMEMBER: Filter everything you do against The Six Coding Commandments!**
