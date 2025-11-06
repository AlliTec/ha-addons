
import json
import os
import sys
import asyncpg
import logging
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Database Setup ---

def get_config():
    """Loads addon configuration from /data/options.json."""
    config_path = "/data/options.json"
    if not os.path.exists(config_path):
        logging.error(f"Configuration file not found at {config_path}. Please configure the addon and start it again.")
        sys.exit(1)
    
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
        
        required_keys = ["db_host", "db_user", "db_password", "db_name"]
        if not all(key in config and config[key] for key in required_keys):
            logging.error("Database configuration is incomplete. Please provide values for db_host, db_user, db_password, and db_name.")
            sys.exit(1)
            
        return config
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON in {config_path}. Please check the file content.")
        sys.exit(1)

config = get_config()

DB_HOST = config.get("db_host")
DB_PORT = config.get("db_port", 5432)
DB_USER = config.get("db_user")
DB_PASSWORD = config.get("db_password")
DB_NAME = config.get("db_name")

logging.info(f"Database configuration loaded: Host={DB_HOST}, Port={DB_PORT}, User={DB_USER}, DB={DB_NAME}")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

async def check_connection():
    """Checks if a connection to the database can be established."""
    try:
        logging.info(f"Attempting to connect to the database at {DB_HOST}...")
        conn = await asyncpg.connect(DATABASE_URL, timeout=10)
        await conn.close()
        logging.info("Database connection successful.")
        return True
    except Exception as e:
        logging.error(f"Database connection failed. Please check your configuration. Error: {e}")
        return False

# --- FastAPI App ---

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    if not await check_connection():
        logging.error("Database connection failed. The application will not work correctly.")

app.mount("/static", StaticFiles(directory="/app/static"), name="static")
templates = Jinja2Templates(directory="/app/templates")

# --- Pydantic Models ---

class Animal(BaseModel):
    tag_id: Optional[str] = None
    name: str
    gender: Optional[str] = None
    breed: Optional[str] = None
    birth_date: Optional[str] = None
    health_status: Optional[str] = None
    notes: Optional[str] = None
    dam_id: Optional[int] = None
    sire_id: Optional[int] = None
    features: Optional[str] = None
    photo_path: Optional[str] = None
    pic: Optional[str] = None
    dod: Optional[str] = None





# --- API Endpoints ---

@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    addon_version = config.get("version", "unknown")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        records = await conn.fetch("SELECT id, tag_id, name, breed, birth_date, gender, health_status, notes, created_at, dam_id, sire_id, status, features, photo_path, pic, dod FROM livestock_records ORDER BY name")
        await conn.close()
        animals = [dict(record) for record in records]
    except Exception as e:
        animals = []
    return templates.TemplateResponse("index.html", {"request": request, "addon_version": addon_version, "animals": animals})

@app.post("/add_animal")
async def add_animal(animal: Animal):
    logging.info(f"Adding animal: {animal}")
    try:
        birth_date = datetime.fromisoformat(animal.birth_date).date() if animal.birth_date else None
        dod = datetime.fromisoformat(animal.dod).date() if animal.dod else None
    except ValueError:
        birth_date = None
        dod = None

    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("""
            INSERT INTO livestock_records (tag_id, name, gender, breed, birth_date, health_status, notes, dam_id, sire_id, features, photo_path, pic, dod, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'On Property', NOW())
        """, animal.tag_id, animal.name, animal.gender, animal.breed, birth_date, animal.health_status, animal.notes, animal.dam_id, animal.sire_id, animal.features, animal.photo_path, animal.pic, dod)
        await conn.close()
        logging.info("Animal added successfully")
        return {"message": "Animal added successfully"}
    except Exception as e:
        logging.error(f"Error adding animal: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/get_animals")
async def get_animals():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        records = await conn.fetch("SELECT id, tag_id, name, breed, birth_date, gender, health_status, notes, created_at, dam_id, sire_id, status, features, photo_path, pic, dod FROM livestock_records ORDER BY name")
        await conn.close()
        logging.info(f"Fetched {len(records)} animals from database.")
        animals = [dict(record) for record in records]
        return animals
    except Exception as e:
        logging.error(f"Error fetching animals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_animal/{animal_id}")
async def get_animal(animal_id: int):
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        record = await conn.fetchrow("SELECT id, tag_id, name, breed, birth_date, gender, health_status, notes, created_at, dam_id, sire_id, status, features, photo_path, pic, dod FROM livestock_records WHERE id = $1", animal_id)
        await conn.close()
        return dict(record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_animal/{animal_id}")
async def delete_animal(animal_id: int):
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("DELETE FROM livestock_records WHERE id = $1", animal_id)
        await conn.close()
        return {"message": "Animal deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update_animal/{animal_id}")
async def update_animal(animal_id: int, animal: Animal):
    try:
        birth_date = datetime.fromisoformat(animal.birth_date).date() if animal.birth_date else None
        dod = datetime.fromisoformat(animal.dod).date() if animal.dod else None
    except ValueError:
        birth_date = None
        dod = None

    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("""
            UPDATE livestock_records
            SET tag_id = $1, name = $2, gender = $3, breed = $4, birth_date = $5, health_status = $6, notes = $7, dam_id = $8, sire_id = $9, features = $10, photo_path = $11, pic = $12, dod = $13
            WHERE id = $14
        """, animal.tag_id, animal.name, animal.gender, animal.breed, birth_date, animal.health_status, animal.notes, animal.dam_id, animal.sire_id, animal.features, animal.photo_path, animal.pic, dod, animal_id)
        await conn.close()
        return {"message": "Animal updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
