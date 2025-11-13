# Agent Guidelines for ha-addons

## Build/Lint/Test Commands

### rain-predictor-addon
- Install: `pip3 install -r rain-predictor-addon/requirements.txt`
- Syntax: `python3 -m py_compile rain_predictor.py web_ui.py`
- Test: Use `pytest` for new tests
- Local Dev: `cd rain-predictor-addon && ./run_local.sh`

### farm-assistant-addon
- Install: `pip3 install fastapi uvicorn asyncpg jinja2`
- Syntax: `python3 -m py_compile main.py`
- Test: Use `pytest` for new tests
- Local Dev: `cd farm-assistant-addon && uvicorn main:app --host 0.0.0.0 --port 8000`

## Code Style Guidelines

### Python (Both Addons)
- Style: PEP 8 compliance, snake_case variables, PascalCase classes
- Type hints required for all function signatures and class attributes
- Docstrings with triple quotes for all classes and public functions
- Imports: standard library → third-party → local imports
- Error handling: try/except with specific exceptions, log appropriately

### JavaScript (rain-predictor-addon)
- Style: ES6+, camelCase variables/functions, PascalCase classes
- Use arrow functions for callbacks, async/await over Promises
- Event delegation for dynamic DOM content

### Database (farm-assistant-addon)
- Use parameterized queries with asyncpg, close connections in try/finally
- Use Pydantic for request/response validation

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
