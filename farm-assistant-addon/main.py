from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import asyncio

from animal_management import router as animal_router
from database import check_connection

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    if not await check_connection():
        # In a real scenario, you might want to prevent the app from starting
        # or repeatedly try to connect. For now, we'll just log the error.
        print("Database connection failed. The application will not work correctly.")

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

app.include_router(animal_router)
