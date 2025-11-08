
import json
import os
import sys
import asyncpg
import logging
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Database Setup ---

def get_config():
    """Loads addon configuration from /data/options.json or local data/options.json."""
    # Try local data directory first for development
    config_path = "data/options.json"
    if not os.path.exists(config_path):
        # Fall back to production path
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

# Use local paths for development, production paths for container
static_dir = "static" if os.path.exists("static") else "/app/static"
templates_dir = "templates" if os.path.exists("templates") else "/app/templates"

app.mount("/static", StaticFiles(directory=static_dir), name="static")
templates = Jinja2Templates(directory=templates_dir)

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
    status: Optional[str] = None

def get_animal_type(gender):
    if gender in ["Cow", "Bull", "Steer", "Heifer"]:
        return "Cattle"
    elif gender in ["Bitch", "Dog"]:
        return "Dog"
    elif gender in ["Queen", "Tom"]:
        return "Cat"
    elif gender in ["Hen", "Rooster", "Cockerel", "Pullet", "Capon"]:
        return "Chicken"
    elif gender in ["Doe", "Buck", "Kid", "Wether", "Billy", "Nanny"]:
        return "Goat"
    elif gender in ["Ewe", "Ram", "Lamb", "Wether"]:
        return "Sheep"
    elif gender in ["Sow", "Boar", "Gilt", "Barrow", "Piglet"]:
        return "Pig"
    elif gender in ["Mare", "Stallion", "Gelding", "Foal", "Colt", "Filly"]:
        return "Horse"
    elif gender in ["Jack", "Jenny", "Foal", "Colt", "Filly"]:
        return "Donkey"
    elif gender in ["Female", "Stud", "Gelding"]:  # Llama and Alpaca
        return "Llama"  # Default to Llama, will be overridden by category field if available
    elif gender in ["Goose", "Gander"]:
        return "Goose"
    elif gender in ["Hen", "Drake"]:
        return "Duck"
    elif gender in ["Tom", "Hen"]:  # Turkey
        return "Turkey"
    elif gender in ["Buck", "Doe"]:  # Rabbit
        return "Rabbit"
    else:
        return None





# --- API Endpoints ---

@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    addon_version = config.get("version", "unknown")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        records = await conn.fetch("""
            SELECT
                lr.id, lr.tag_id, lr.name, lr.breed, lr.birth_date, lr.gender, lr.health_status, lr.notes, lr.created_at, 
                dam.name as dam_name, sire.name as sire_name, 
                lr.status, lr.features, lr.photo_path, lr.pic, lr.dod
            FROM livestock_records lr
            LEFT JOIN livestock_records dam ON lr.dam_id = dam.id
            LEFT JOIN livestock_records sire ON lr.sire_id = sire.id
            ORDER BY lr.name
        """)
        await conn.close()
        animals = [dict(record) for record in records]
        for animal in animals:
            animal['animal_type'] = get_animal_type(animal['gender'])
    except Exception as e:
        animals = []
    return templates.TemplateResponse("index.html", {"request": request, "addon_version": addon_version, "animals": animals})





@app.get("/get_animals")
async def get_animals():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        records = await conn.fetch("""
            SELECT
                lr.id, lr.tag_id, lr.name, lr.breed, lr.birth_date, lr.gender, lr.health_status, lr.notes, lr.created_at, 
                dam.name as dam_name, sire.name as sire_name, 
                lr.status, lr.features, lr.photo_path, lr.pic, lr.dod
            FROM livestock_records lr
            LEFT JOIN livestock_records dam ON lr.dam_id = dam.id
            LEFT JOIN livestock_records sire ON lr.sire_id = sire.id
            ORDER BY lr.name
        """)
        await conn.close()
        logging.info(f"Fetched {len(records)} animals from database.")
        animals = [dict(record) for record in records]
        for animal in animals:
            animal['animal_type'] = get_animal_type(animal['gender'])
        return animals
    except Exception as e:
        logging.error(f"Error fetching animals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/animals")
async def get_animals_for_dropdown():
    conn = await asyncpg.connect(DATABASE_URL)
    records = await conn.fetch("SELECT id, name, gender FROM livestock_records ORDER BY name")
    await conn.close()
    animals = [dict(record) for record in records]
    return animals

@app.get("/api/animal-types")
async def get_available_animal_types():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        records = await conn.fetch("SELECT gender FROM livestock_records WHERE gender IS NOT NULL ORDER BY gender")
        await conn.close()
        
        # Get all unique animal types from existing records
        animal_types = set()
        for record in records:
            animal_type = get_animal_type(record['gender'])
            if animal_type:
                animal_types.add(animal_type)
        
        # Always include "All" option
        available_types = ["All"] + sorted(list(animal_types))
        return available_types
    except Exception as e:
        logging.error(f"Error getting animal types: {e}")
        return ["All"]

@app.get("/get_animal/{animal_id}")
async def get_animal(animal_id: int):
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        record = await conn.fetchrow("SELECT id, tag_id, name, breed, birth_date, gender, health_status, notes, created_at, dam_id, sire_id, status, features, photo_path, pic, dod FROM livestock_records WHERE id = $1", animal_id)
        
        # Get offspring (animals where this animal is dam or sire)
        offspring = await conn.fetch("""
            SELECT id, name, gender, birth_date 
            FROM livestock_records 
            WHERE dam_id = $1 OR sire_id = $1
            ORDER BY birth_date DESC
        """, animal_id)
        
        await conn.close()
        animal_data = dict(record)
        animal_data['offspring'] = [dict(off) for off in offspring]
        return animal_data
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

@app.post("/add_animal")
async def add_animal(animal: Animal):
    try:
        birth_date = datetime.fromisoformat(animal.birth_date).date() if animal.birth_date else None
        dod = datetime.fromisoformat(animal.dod).date() if animal.dod else None
    except ValueError:
        birth_date = None
        dod = None

    # Clear dod if status is not 'Deceased'
    if animal.status != 'Deceased':
        dod = None

    try:
        conn = await asyncpg.connect(DATABASE_URL)
        result = await conn.fetchval("""
            INSERT INTO livestock_records 
            (tag_id, name, gender, breed, birth_date, health_status, notes, dam_id, sire_id, features, photo_path, pic, dod, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id
        """, animal.tag_id, animal.name, animal.gender, animal.breed, birth_date, animal.health_status, 
              animal.notes, animal.dam_id, animal.sire_id, animal.features, animal.photo_path, 
              animal.pic, dod, animal.status)
        await conn.close()
        return {"message": "Animal added successfully", "id": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update_animal/{animal_id}")
async def update_animal(animal_id: int, animal: Animal):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        logging.info(f"Updating animal {animal_id} with data: {animal}")
        await conn.execute("""
            UPDATE livestock_records 
            SET tag_id = $1, name = $2, gender = $3, breed = $4, 
                birth_date = $5, health_status = $6, notes = $7,
                status = $8, dam_id = $9, sire_id = $10, features = $11,
                photo_path = $12, pic = $13, dod = $14
            WHERE id = $15
        """, animal.tag_id, animal.name, animal.gender, animal.breed,
            animal.birth_date, animal.health_status, animal.notes,
            animal.status, animal.dam_id, animal.sire_id, animal.features,
            animal.photo_path, animal.pic, animal.dod, animal_id)
        logging.info(f"Animal {animal_id} updated successfully")
        return {"message": "Animal updated successfully"}
    except Exception as e:
        logging.error(f"Error updating animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

# --- Asset Management Endpoints ---

class AssetCreate(BaseModel):
    # Basic Information
    name: str
    category: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    quantity: Optional[int] = 1
    
    # Status & Location
    status: Optional[str] = "operational"
    location: Optional[str] = None
    parent_asset_id: Optional[int] = None
    
    # Purchase Information
    purchase_date: Optional[str] = None
    purchase_price: Optional[float] = None
    purchase_location: Optional[str] = None
    warranty_provider: Optional[str] = None
    warranty_expiry_date: Optional[str] = None
    
    # Registration & Insurance
    registration_no: Optional[str] = None
    registration_due: Optional[str] = None
    insurance_info: Optional[str] = None
    insurance_due: Optional[str] = None
    
    # Permits & Documentation
    permit_info: Optional[str] = None
    manual_or_doc_path: Optional[str] = None
    
    # General Notes
    notes: Optional[str] = None
    
    # Usage Information
    usage_type: Optional[str] = None
    usage_value: Optional[float] = None
    usage_notes: Optional[str] = None

class MaintenanceScheduleCreate(BaseModel):
    asset_id: int
    task_description: str
    due_date: Optional[str] = None
    completed_date: Optional[str] = None
    status: Optional[str] = "pending"
    is_unscheduled: Optional[bool] = False
    maintenance_trigger_type: Optional[str] = None
    maintenance_trigger_value: Optional[int] = None
    last_maintenance_usage: Optional[float] = None
    meter_reading: Optional[int] = None
    interval_type: Optional[str] = None
    interval_value: Optional[int] = None
    cost: Optional[float] = None
    supplier: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

@app.get("/api/assets")
async def get_assets():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        records = await conn.fetch("""
            SELECT id, name, make, model, location, status, quantity, category,
                   serial_number, purchase_date, registration_no, registration_due,
                   permit_info, insurance_info, insurance_due, warranty_provider,
                   warranty_expiry_date, purchase_price, purchase_location,
                   manual_or_doc_path, notes, parent_asset_id, created_at
            FROM asset_inventory 
            ORDER BY name
        """)
        assets = [dict(record) for record in records]
        return assets
    finally:
        await conn.close()

@app.get("/api/asset/{asset_id}")
async def get_asset(asset_id: int):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        record = await conn.fetchrow("SELECT * FROM asset_inventory WHERE id = $1", asset_id)
        if not record:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Get latest usage reading for this asset
        usage_record = await conn.fetchrow("""
            SELECT usage_type, usage_value, timestamp
            FROM asset_usage_log 
            WHERE asset_id = $1 
            ORDER BY timestamp DESC 
            LIMIT 1
        """, asset_id)
        
        asset_data = dict(record)
        if usage_record:
            asset_data['latest_usage'] = {
                'usage_type': usage_record['usage_type'],
                'usage_value': usage_record['usage_value'],
                'timestamp': usage_record['timestamp'].isoformat()
            }
        
        return asset_data
    finally:
        await conn.close()

@app.post("/api/asset")
async def add_asset(asset: AssetCreate):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        async with conn.transaction():
            # Insert asset with all fields
            result = await conn.fetchrow("""
                INSERT INTO asset_inventory 
                (name, category, make, model, serial_number, purchase_date, status,
                 parent_asset_id, location, quantity, registration_no, registration_due,
                 permit_info, insurance_info, insurance_due, warranty_provider,
                 warranty_expiry_date, purchase_price, purchase_location,
                 manual_or_doc_path, notes, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
                RETURNING id
            """, asset.name, asset.category, asset.make, asset.model, asset.serial_number,
                asset.purchase_date, asset.status, asset.parent_asset_id, asset.location,
                asset.quantity, asset.registration_no, asset.registration_due, asset.permit_info,
                asset.insurance_info, asset.insurance_due, asset.warranty_provider,
                asset.warranty_expiry_date, asset.purchase_price, asset.purchase_location,
                asset.manual_or_doc_path, asset.notes)
            
            asset_id = result["id"]
            
            # Add usage log entry if usage data provided
            if asset.usage_type and asset.usage_value is not None:
                await conn.execute("""
                    INSERT INTO asset_usage_log 
                    (asset_id, timestamp, usage_type, usage_value, notes)
                    VALUES ($1, NOW(), $2, $3, $4)
                """, asset_id, asset.usage_type, asset.usage_value, asset.usage_notes)
                
        return {"message": "Asset added successfully", "id": asset_id}
    finally:
        await conn.close()

@app.put("/api/asset/{asset_id}")
async def update_asset(asset_id: int, asset: AssetCreate):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        async with conn.transaction():
            # Update asset with all fields
            await conn.execute("""
                UPDATE asset_inventory 
                SET name = $1, category = $2, make = $3, model = $4, serial_number = $5,
                    purchase_date = $6, status = $7, parent_asset_id = $8, location = $9,
                    quantity = $10, registration_no = $11, registration_due = $12,
                    permit_info = $13, insurance_info = $14, insurance_due = $15,
                    warranty_provider = $16, warranty_expiry_date = $17, purchase_price = $18,
                    purchase_location = $19, manual_or_doc_path = $20, notes = $21
                WHERE id = $22
            """, asset.name, asset.category, asset.make, asset.model, asset.serial_number,
                asset.purchase_date, asset.status, asset.parent_asset_id, asset.location,
                asset.quantity, asset.registration_no, asset.registration_due, asset.permit_info,
                asset.insurance_info, asset.insurance_due, asset.warranty_provider,
                asset.warranty_expiry_date, asset.purchase_price, asset.purchase_location,
                asset.manual_or_doc_path, asset.notes, asset_id)
            
            # Add usage log entry if usage data provided
            if asset.usage_type and asset.usage_value is not None:
                await conn.execute("""
                    INSERT INTO asset_usage_log 
                    (asset_id, timestamp, usage_type, usage_value, notes)
                    VALUES ($1, NOW(), $2, $3, $4)
                """, asset_id, asset.usage_type, asset.usage_value, asset.usage_notes)
                
        return {"message": "Asset updated successfully"}
    finally:
        await conn.close()

@app.post("/api/maintenance-schedule")
async def create_maintenance_schedule(schedule: MaintenanceScheduleCreate):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Insert maintenance schedule
        query = """
            INSERT INTO maintenance_schedules (
                asset_id, task_description, due_date, completed_date, status, 
                is_unscheduled, maintenance_trigger_type, maintenance_trigger_value,
                last_maintenance_usage, meter_reading, interval_type, interval_value,
                cost, supplier, invoice_number, notes
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            ) RETURNING id
        """
        
        result = await conn.fetchrow(
            query,
            schedule.asset_id,
            schedule.task_description,
            schedule.due_date,
            schedule.completed_date,
            schedule.status,
            schedule.is_unscheduled,
            schedule.maintenance_trigger_type,
            schedule.maintenance_trigger_value,
            schedule.last_maintenance_usage,
            schedule.meter_reading,
            schedule.interval_type,
            schedule.interval_value,
            schedule.cost,
            schedule.supplier,
            schedule.invoice_number,
            schedule.notes
        )
        
        return {"message": "Maintenance schedule created successfully", "id": result['id']}
    finally:
        await conn.close()

@app.delete("/api/asset/{asset_id}")
async def delete_asset(asset_id: int):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        await conn.execute("DELETE FROM asset_inventory WHERE id = $1", asset_id)
        return {"message": "Asset deleted successfully"}
    finally:
        await conn.close()
