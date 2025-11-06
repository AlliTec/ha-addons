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
