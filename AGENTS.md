# Agent Guidelines for ha-addons

## Build/Lint/Test Commands

### rain-predictor-addon
- Install: `pip3 install -r rain-predictor-addon/requirements.txt`
- Syntax: `python3 -m py_compile rain_predictor.py web_ui.py`
- Test single: `pytest test_file.py::test_function`
- Test all: `pytest`
- Local Dev: `cd rain-predictor-addon && ./run_local.sh`

### farm-assistant-addon
- Install: `pip3 install fastapi uvicorn asyncpg jinja2`
- Syntax: `python3 -m py_compile main.py`
- Test single: `pytest test_file.py::test_function`
- Test all: `pytest`
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

## The Seven Coding Commandments (MANDATORY)

**ALL CODE CHANGES MUST FOLLOW THE SEVEN CODING COMMANDMENTS AT ALL TIMES WITHOUT EXCEPTION:**

**The Coding Commandments shall be followed without exception. These are located in `/home/sog/ai-projects/ha-addons/TheCodingCommandments.txt` and must be adhered to strictly.**

### The Seven Coding Commandments (Complete Version):

**I. THE SINGULAR ASSUMPTION**
**RULE:** Make NO assumptions except this one: ALL code is faulty until proven otherwise through testing.
**ACTION:** Question everything. Verify everything. Test everything.
**VIOLATION:** If you catch yourself assuming a file exists, a path is correct, or code works without testing - STOP and verify first.

**II. FILE PATH PROTOCOL - ABSOLUTE PATHS ONLY**
**RULE 1:** If ANY command is repeated more than TWICE with the same error, you are in an infinite loop.

**MANDATORY ACTIONS when loop detected:**
1. STOP immediately
2. Identify the failing command
3. Execute: `cd /home/sog/ai-projects/ha-addons/farm-assistant-addon`
4. Rewrite the command with absolute path
5. If still failing, examine the root cause (missing file, wrong path, syntax error)
6. FIX the root cause before retrying

**EXAMPLE FIX:**
- ❌ LOOPING: `python3 -c "import json; json.load(open('data/options.json'))"`
- ✅ PREFERRED: `cd /home/sog/ai-projects/ha-addons/farm-assistant-addon && python3 -c "import json; json.load(open('data/options.json'))"`
- ✅ ALTERNATE: `python3 -c "import json; json.load(open('/home/sog/ai-projects/ha-addons/farm-assistant-addon/data/options.json'))"`

**RULE 2:** ALL file operations MUST use absolute paths starting from these locations:
- `/home/sog/ai-projects/ha-addons/farm-assistant-addon/`
- Shorthand acceptable: `/farm-assistant-addon/` (if within project context)

**MANDATORY ACTIONS:**
1. BEFORE any file operation, execute: `cd /home/sog/ai-projects/ha-addons/farm-assistant-addon`
2. ALWAYS use absolute paths in commands, never relative paths
3. If you encounter "No such file or directory" or "did not match any file":
   - STOP immediately
   - Execute: `cd /home/sog/ai-projects/ha-addons/farm-assistant-addon`
   - Prepend the absolute path to the file
   - Retry the command

**EXAMPLES:**
- ❌ WRONG: `python3 -m py_compile main.py`
- ✅ PREFERRED: `cd /home/sog/ai-projects/ha-addons/farm-assistant-addon && python3 -m py_compile main.py`
- ✅ ALTERNATE: `python3 -m py_compile /home/sog/ai-projects/ha-addons/farm-assistant-addon/main.py`

**III. SYNTAX VALIDATION - MANDATORY CHECK**
**RULE:** ALL Python files MUST pass syntax validation before proceeding.

**MANDATORY ACTION - Execute this command:**
```bash
cd /home/sog/ai-projects/ha-addons/farm-assistant-addon && python3 -m py_compile main.py
```

**REQUIREMENTS:**
- Command must complete with NO errors
- If ANY syntax error appears: FIX IT IMMEDIATELY
- Check ALL files in the addon for similar errors
- Re-run validation after fixes
- DO NOT PROCEED until this passes with zero errors

**IV. CONFIGURATION VALIDATION - MANDATORY CHECK**
**RULE:** Configuration files MUST be valid JSON before proceeding.

**MANDATORY ACTION - Execute this command:**
```bash
cd /home/sog/ai-projects/ha-addons/farm-assistant-addon && python3 -c "import json; json.load(open('data/options.json'))"
```

**REQUIREMENTS:**
- Command must complete with NO exceptions
- If ANY error appears: FIX IT IMMEDIATELY
- Re-run validation after fixes
- DO NOT PROCEED until this passes with zero errors

**V. COMPREHENSIVE TESTING - MANDATORY CHECKLIST**
**RULE:** ALL of the following tests MUST pass before considering work complete.

**MANDATORY TESTING CHECKLIST - Execute in order:**
1. ☐ Addon loads without crashing
2. ☐ ALL existing features still work (no regressions)
3. ☐ New/modified feature works as user requested
4. ☐ Test the feature through the UI exactly as the user will experience it
5. ☐ NO console errors generated
6. ☐ NO API errors generated
7. ☐ If ANY errors found: FIX, then restart this checklist from step 1

**DO NOT PROCEED until ALL boxes are checked.**

**VI. VERSION CONTROL PROTOCOL - MANDATORY SEQUENCE**
**RULE:** These steps MUST be executed in EXACT order after all testing passes.

**MANDATORY SEQUENCE:**
1. ☐ Update version number in `config.yaml`
2. ☐ Document changes in changelog
3. ☐ Execute: `git add .`
4. ☐ Execute: `git commit -m "descriptive message"`
5. ☐ Execute: `./run_gitpush.sh`

**DO NOT SKIP ANY STEP. Execute in order.**

**VII. COMPLETION REPORT - MANDATORY OUTPUT**
**RULE:** At task completion, provide this exact format:

**COMMANDMENTS COMPLIANCE CHECKLIST:**
- [ ] I. No assumptions made (except code is faulty until proven)
- [ ] II. Used absolute paths for all file operations
- [ ]   - No infinite loops encountered (or broke free if detected)
- [ ] III. Syntax validation passed: `python3 -m py_compile main.py`
- [ ] IV. Config validation passed: JSON validation command
- [ ] V. All 7 testing requirements passed
- [ ] VI. Version control sequence completed
- [ ] VII. This report provided

**SUMMARY OF ACTIONS:**
[Concise bullet-point list of what was done on separate lines]

**FILES MODIFIED:**
[List with absolute paths]

**TESTING RESULTS:**
[Brief summary of test outcomes]

---

## ENFORCEMENT RULES

**BEFORE starting ANY task:**
1. Read ALL commandments
2. Plan which commandments apply
3. Execute them in order

**DURING the task:**
1. Reference commandments constantly
2. Check off each requirement as completed
3. If uncertain, re-read the relevant commandment

**If you violate a commandment:**
1. STOP immediately
2. Acknowledge the violation
3. Correct it
4. Resume from the violated commandment

**THESE ARE NOT GUIDELINES. THESE ARE ABSOLUTE REQUIREMENTS.**

**THESE ARE NOT GUIDELINES. THESE ARE ABSOLUTE REQUIREMENTS.**
