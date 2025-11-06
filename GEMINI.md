# Project Overview

This repository contains a collection of Home Assistant addons.

## Addons

### Farm Assistant

*   **Purpose:** A simple addon to manage a farm's livestock data.
*   **Technologies:** Python, FastAPI
*   **Configuration:** The addon is configured through the `config.yaml` file.
*   **Source Code:** The main source code is in `farm-assistant-addon/main.py`.

### Rain Predictor

*   **Purpose:** An advanced rain prediction addon that uses radar image analysis to predict rain arrival.
*   **Technologies:** Python, FastAPI
*   **Configuration:** The addon is configured through a web UI.
*   **Source Code:** The main source code is in `rain-predictor-addon/rain-predictor-addon/rain_predictor.py` and `rain-predictor-addon/rain-predictor-addon/web_ui.py`.
*   **Documentation:** The addon has extensive documentation in `rain-predictor-addon/README.md`.

## Development

### Building and Running

Each addon has a `Dockerfile` that can be used to build the addon. The `run.sh` script in each addon's directory is used to run the addon.

### Testing

There are no specific testing instructions in the repository.

### Conventions

The addons are written in Python and use FastAPI for the web UI. The configuration is done through `config.yaml` files or a web UI.
