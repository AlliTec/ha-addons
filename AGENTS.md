# Agent Guidelines for ha-addons

This repository contains multiple Home Assistant addons. Each addon has its own directory and specific guidelines.

## rain-predictor-addon

- **Tech Stack**: Python (Flask, NumPy), JavaScript
- **Dependencies**: `pip3 install -r rain-predictor-addon/requirements.txt`
- **Local Dev**: Run `./run_local.sh` from the `rain-predictor-addon` directory.
- **Lint/Test**: Check syntax with `python3 -m py_compile rain_predictor.py web_ui.py`.
- **Code Style**:
    - Python: PEP 8, snake_case for variables, PascalCase for classes. Use type hints and docstrings.
    - JS: ES6+, camelCase.

## farm-assistant-addon

- **Tech Stack**: Python (FastAPI)
- **Dependencies**: See `farm-assistant-addon/Dockerfile`. Uses `uvicorn` and `fastapi`.
- **Local Dev**: Run `uvicorn main:app --host 0.0.0.0 --port 8000` from the `farm-assistant-addon` directory.
- **Lint/Test**: No specific test command found. Use `pytest` for new tests.
- **Code Style**:
    - Python: PEP 8, snake_case for variables, PascalCase for classes. Use type hints.

## General

- **Repository**: https://github.com/allitec/ha-addons

- No `.cursor` or `.github/copilot` rules were found.
- Follow existing code style and conventions within each addon.
- Update Home Assistant entities using the provided APIs.

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
