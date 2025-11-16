
import json
import os
import sys
import asyncpg
import logging
from datetime import datetime, timedelta
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

class Event(BaseModel):
    date: str
    time: str
    category: str  # 'livestock' or 'asset'
    item_id: int
    title: str
    duration: float
    notes: Optional[str] = None
    status: str = 'scheduled'  # scheduled, in_progress, completed, cancelled
    priority: str = 'medium'  # low, medium, high, urgent

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
    # Read version from config.yaml for cache-busting
    import os
    addon_version = "unknown"
    
    # Try multiple possible paths for config.yaml
    config_paths = [
        'config.yaml',  # Relative path
        '/data/config.yaml',  # Home Assistant data path
        os.path.join(os.path.dirname(__file__), 'config.yaml'),  # Script directory
        '/home/sog/ai-projects/ha-addons/farm-assistant-addon/config.yaml'  # Absolute fallback
    ]
    
    for config_path in config_paths:
        try:
            with open(config_path, 'r') as f:
                for line in f:
                    if line.startswith('version:'):
                        addon_version = line.split(':')[1].strip().strip('"')
                        break
                if addon_version != "unknown":
                    break
        except:
            continue
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
    return templates.TemplateResponse("index.html", {"request": request, "addon_version": addon_version, "animals": animals, "timestamp": int(datetime.now().timestamp() * 1000)})





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
        record = await conn.fetchrow("""
            SELECT id, tag_id, name, breed, birth_date, gender, health_status, notes, created_at, 
                   dam_id, sire_id, status, features, photo_path, pic, dod,
                   (SELECT name FROM livestock_records WHERE id = lr.dam_id) as dam_name,
                   (SELECT name FROM livestock_records WHERE id = lr.sire_id) as sire_name
            FROM livestock_records lr 
            WHERE lr.id = $1
        """, animal_id)
        
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
        
        # Convert string dates to date objects for database
        birth_date = datetime.strptime(animal.birth_date, '%Y-%m-%d').date() if animal.birth_date else None
        dod = datetime.strptime(animal.dod, '%Y-%m-%d').date() if animal.dod else None
        
        await conn.execute("""
            UPDATE livestock_records 
            SET tag_id = $1, name = $2, gender = $3, breed = $4, 
                birth_date = $5, health_status = $6, notes = $7,
                status = $8, dam_id = $9, sire_id = $10, features = $11,
                photo_path = $12, pic = $13, dod = $14
            WHERE id = $15
        """, animal.tag_id, animal.name, animal.gender, animal.breed,
            birth_date, animal.health_status, animal.notes,
            animal.status, animal.dam_id, animal.sire_id, animal.features,
            animal.photo_path, animal.pic, dod, animal_id)
        logging.info(f"Animal {animal_id} updated successfully")
        return {"message": "Animal updated successfully"}
    except Exception as e:
        logging.error(f"Error updating animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

# --- Event Management Endpoints ---

@app.post("/api/events")
async def add_event(event: Event):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        logging.info(f"Adding event: {event}")
        
        # Combine date and time into full timestamp
        event_datetime = f"{event.date} {event.time}:00"
        
        if event.category == 'livestock':
            # Add to animal_history table
            event_date = datetime.strptime(event.date, '%Y-%m-%d').date()
            event_time = datetime.strptime(event.time, '%H:%M').time()
            await conn.execute("""
                INSERT INTO animal_history 
                (animal_id, event_date, event_time, title, duration_hours, notes, status, priority, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            """, event.item_id, event_date, event_time, event.title, event.duration, 
                  event.notes, event.status, event.priority)
            
            # Also add to calendar for display
            await conn.execute("""
                INSERT INTO calendar_entries 
                (entry_date, event_time, duration_hours, entry_type, category, title, description, related_id, related_name, created_at)
                VALUES ($1, $2, $3, 'event', $4, $5, $6, $7, 
                        (SELECT name || ' (' || tag_id || ')' FROM livestock_records WHERE id = $7), NOW())
            """, event_date, datetime.strptime(event.time, '%H:%M').time(), event.duration, 'livestock', event.title, event.notes, event.item_id)
            
        elif event.category == 'asset':
            # Add to maintenance_history table
            event_date = datetime.strptime(event.date, '%Y-%m-%d').date()
            await conn.execute("""
                INSERT INTO maintenance_history 
                (asset_id, maintenance_type, start_date, completion_date, duration_hours, notes, status, priority, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            """, event.item_id, event.title, event_date, 
                  event_date if event.status == 'completed' else None, 
                  event.duration, event.notes, event.status, event.priority)
            
            # Also add to calendar for display
            await conn.execute("""
                INSERT INTO calendar_entries 
                (entry_date, event_time, duration_hours, entry_type, category, title, description, related_id, related_name, created_at)
                VALUES ($1, $2, $3, 'event', $4, $5, $6, $7, 
                        (SELECT name || ' (' || make || ' ' || COALESCE(model, '') || ')' FROM asset_inventory WHERE id = $7), NOW())
            """, event_date, datetime.strptime(event.time, '%H:%M').time(), event.duration, 'asset', event.title, event.notes, event.item_id)
        
        logging.info(f"Event added successfully for {event.category} item {event.item_id}")
        return {"message": "Event added successfully", "id": "success"}

    except Exception as e:
        logging.error(f"Error adding event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.delete("/api/events/{event_id}")
async def delete_event(event_id: int):
    """Delete a calendar event by ID"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        logging.info(f"Deleting event with ID: {event_id}")
        
        # Delete from calendar_entries table
        result = await conn.execute("""
            DELETE FROM calendar_entries 
            WHERE id = $1
        """, event_id)
        
        # Also delete from animal_history if it exists there
        await conn.execute("""
            DELETE FROM animal_history 
            WHERE id = $1
        """, event_id)
        
        # Also delete from maintenance_history if it exists there  
        await conn.execute("""
            DELETE FROM maintenance_history 
            WHERE id = $1
        """, event_id)
        
        logging.info(f"Event {event_id} deleted successfully")
        return {"message": "Event deleted successfully"}

    except Exception as e:
        logging.error(f"Error deleting event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.get("/api/events/{event_id}")
async def get_event(event_id: int):
    """Get a specific calendar event by ID"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        logging.info(f"Fetching event with ID: {event_id}")
        
        # Get event from calendar_entries table
        event = await conn.fetchrow("""
            SELECT id, entry_date as date, event_time as time, duration_hours as duration,
                   category, title, description as notes, related_id as item_id,
                   entry_type
            FROM calendar_entries 
            WHERE id = $1
        """, event_id)
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Convert to dict and format time
        event_dict = dict(event)
        if event_dict['time']:
            event_dict['time'] = event_dict['time'].strftime('%H:%M')
        
        # Add default values for fields that don't exist in calendar_entries
        event_dict['status'] = 'scheduled'
        event_dict['priority'] = 'medium'
        
        logging.info(f"Event {event_id} retrieved successfully")
        return event_dict
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.put("/api/events/{event_id}")
async def update_event(event_id: int, event: Event):
    """Update a calendar event by ID"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        logging.info(f"Updating event {event_id}: {event}")
        
        # Combine date and time into full timestamp
        event_datetime = f"{event.date} {event.time}:00"
        
        # Update calendar_entries table
        event_date = datetime.strptime(event.date, '%Y-%m-%d').date()
        event_time = datetime.strptime(event.time, '%H:%M').time() if event.time else None
        await conn.execute("""
            UPDATE calendar_entries 
            SET entry_date = $1, event_time = $2, duration_hours = $3, category = $4, 
                title = $5, description = $6, related_id = $7, updated_at = NOW()
            WHERE id = $8
        """, event_date, event_time, event.duration, 
              event.category, event.title, event.notes, event.item_id, event_id)
        
        # Update animal_history if it's a livestock event
        if event.category == 'livestock':
            event_date = datetime.strptime(event.date, '%Y-%m-%d').date()
            event_time = datetime.strptime(event.time, '%H:%M').time()
            await conn.execute("""
                UPDATE animal_history 
                SET event_date = $1, event_time = $2, title = $3, duration_hours = $4, 
                    notes = $5, status = $6, priority = $7, updated_at = NOW()
                WHERE id = $8
            """, event_date, event_time, event.title, event.duration, 
                  event.notes, event.status, event.priority, event_id)
        
        # Update maintenance_history if it's an asset event
        elif event.category == 'asset':
            event_date = datetime.strptime(event.date, '%Y-%m-%d').date()
            await conn.execute("""
                UPDATE maintenance_history 
                SET maintenance_type = $1, start_date = $2, completion_date = $3, 
                    duration_hours = $4, notes = $5, status = $6, priority = $7, updated_at = NOW()
                WHERE id = $8
            """, event.title, event_date, 
                  event_date if event.status == 'completed' else None, 
                  event.duration, event.notes, event.status, event.priority, event_id)
        
        logging.info(f"Event {event_id} updated successfully")
        return {"message": "Event updated successfully"}
        
    except Exception as e:
        logging.error(f"Error updating event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

class MaintenanceScheduleCreate(BaseModel):
    asset_id: int
    task_description: str
    due_date: str  # Mandatory field
    completed_date: Optional[str] = None
    status: Optional[str] = "pending"
    is_unscheduled: Optional[bool] = False
    maintenance_trigger_type: Optional[str] = None
    maintenance_trigger_value: Optional[int] = None
    last_maintenance_usage: Optional[float] = None
    meter_reading: Optional[int] = None
    interval_type: str  # Mandatory field
    interval_value: int  # Mandatory field
    cost: Optional[float] = None
    supplier: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

@app.post("/api/maintenance-schedule")
async def create_maintenance_schedule(schedule: MaintenanceScheduleCreate):
    # Create the maintenance schedule
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Convert date strings to date objects for asyncpg
        # due_date is now mandatory
        due_date_obj = datetime.strptime(schedule.due_date, '%Y-%m-%d').date()
        completed_date_obj = None
        
        if schedule.completed_date:
            completed_date_obj = datetime.strptime(schedule.completed_date, '%Y-%m-%d').date()
        
        # Convert empty strings to None for database constraints
        maintenance_trigger_type = schedule.maintenance_trigger_type.strip() if schedule.maintenance_trigger_type and schedule.maintenance_trigger_type.strip() else None
        # interval_type is now mandatory
        interval_type = schedule.interval_type.strip() if schedule.interval_type else None
        supplier = schedule.supplier.strip() if schedule.supplier and schedule.supplier.strip() else None
        invoice_number = schedule.invoice_number.strip() if schedule.invoice_number and schedule.invoice_number.strip() else None
        notes = schedule.notes.strip() if schedule.notes and schedule.notes.strip() else None
        
        # Insert maintenance schedule
        query = """
            INSERT INTO maintenance_schedules (
                asset_id, task_description, due_date, completed_date, status, 
                is_unscheduled, maintenance_trigger_type, maintenance_trigger_value,
                last_maintenance_usage, meter_reading, interval_type, interval_value,
                cost, supplier, invoice_number, notes
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            ) RETURNING id
        """
        
        result = await conn.fetchrow(
            query,
            schedule.asset_id,
            schedule.task_description,
            due_date_obj,
            completed_date_obj,
            schedule.status,
            schedule.is_unscheduled,
            maintenance_trigger_type,
            schedule.maintenance_trigger_value,
            schedule.last_maintenance_usage,
            schedule.meter_reading,
            interval_type,
            schedule.interval_value,
            schedule.cost,
            supplier,
            invoice_number,
            notes
        )
        
        return {"message": "Maintenance schedule created successfully", "id": result['id']}
    finally:
        await conn.close()

@app.post("/api/maintenance/check-schedule")
async def trigger_maintenance_scheduling():
    """Manually trigger maintenance scheduling check"""
    return await check_and_schedule_maintenance()

@app.post("/api/migrate/animal_history")
async def migrate_animal_history():
    """Create animal_history table if it doesn't exist"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Read and execute migration script
        with open('create_animal_history_table.sql', 'r') as f:
            migration_sql = f.read()
        
        await conn.execute(migration_sql)
        logging.info("Animal history table migration completed successfully")
        return {"message": "Animal history table created successfully"}
        
    except Exception as e:
        logging.error(f"Error running animal history migration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.post("/api/migrate/calendar_entries")
async def migrate_calendar_entries():
    """Create calendar_entries table if it doesn't exist"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Read and execute migration script
        with open('create_calendar_entries_table.sql', 'r') as f:
            migration_sql = f.read()
        
        await conn.execute(migration_sql)
        logging.info("Calendar entries table migration completed successfully")
        return {"message": "Calendar entries table created successfully"}
        
    except Exception as e:
        logging.error(f"Error running calendar entries migration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.post("/api/migrate/asset_year_body")
async def migrate_asset_year_body():
    """Add year and body_feature fields to asset_inventory table"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Read and execute migration script
        with open('add_year_body_feature_to_assets.sql', 'r') as f:
            migration_sql = f.read()
        
        await conn.execute(migration_sql)
        logging.info("Asset year and body_feature migration completed successfully")
        return {"message": "Asset year and body_feature fields added successfully"}
        
    except Exception as e:
        logging.error(f"Error running asset year/body migration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.post("/api/migrate/vehicle_data")
async def migrate_vehicle_data():
    """Create vehicle_data table and populate with data"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Create vehicle_data table
        with open('create_vehicle_data_table.sql', 'r') as f:
            migration_sql = f.read()
        await conn.execute(migration_sql)
        
        # Populate vehicle_data table
        with open('populate_vehicle_data.sql', 'r') as f:
            migration_sql = f.read()
        await conn.execute(migration_sql)
        
        logging.info("Vehicle data table migration completed successfully")
        return {"message": "Vehicle data table created and populated successfully"}
        
    except Exception as e:
        logging.error(f"Error running vehicle data migration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.post("/api/migrate/badge-feature")
async def migrate_badge_feature():
    """Add badge/trim level support to vehicle_data table"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Read and execute the badge migration script
        with open('add_badge_feature_to_vehicle_data.sql', 'r') as f:
            migration_sql = f.read()
        
        await conn.execute(migration_sql)
        
        logging.info("Badge feature migration completed successfully")
        return {"message": "Badge feature added to vehicle data successfully"}
    except Exception as e:
        logging.error(f"Error running badge feature migration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.post("/api/migrate/all")
async def migrate_all():
    """Run all pending migrations"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Run animal history migration
        with open('create_animal_history_table.sql', 'r') as f:
            migration_sql = f.read()
        await conn.execute(migration_sql)
        
        # Run calendar entries migration
        with open('create_calendar_entries_table.sql', 'r') as f:
            migration_sql = f.read()
        await conn.execute(migration_sql)
        
        # Run asset year/body migration
        with open('add_year_body_feature_to_assets.sql', 'r') as f:
            migration_sql = f.read()
        await conn.execute(migration_sql)
        
        # Create vehicle_data table
        with open('create_vehicle_data_table.sql', 'r') as f:
            migration_sql = f.read()
        await conn.execute(migration_sql)
        
        # Populate vehicle_data table
        with open('populate_vehicle_data.sql', 'r') as f:
            migration_sql = f.read()
        await conn.execute(migration_sql)
        
        logging.info("All migrations completed successfully")
        return {"message": "All migrations completed successfully"}
        
    except Exception as e:
        logging.error(f"Error running migrations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

# --- VIN Decoder Service ---
from vin_decoder import decode_vin, lookup_vehicle_specifications, validate_vin

# --- Vehicle Data Endpoints ---

@app.get("/api/vehicle/makes")
async def get_vehicle_makes():
    """Get all vehicle makes"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        makes = await conn.fetch(
            "SELECT DISTINCT make FROM vehicle_data ORDER BY make"
        )
        return [make['make'] for make in makes]
    finally:
        await conn.close()

@app.get("/api/vehicle/models")
async def get_vehicle_models(make: str = None):
    """Get vehicle models, optionally filtered by make"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        if make:
            models = await conn.fetch(
                "SELECT DISTINCT model FROM vehicle_data WHERE make = $1 ORDER BY model",
                make
            )
        else:
            models = await conn.fetch(
                "SELECT DISTINCT model FROM vehicle_data ORDER BY model"
            )
        return [model['model'] for model in models]
    finally:
        await conn.close()

@app.get("/api/vehicle/years")
async def get_vehicle_years(make: str = None, model: str = None):
    """Get vehicle years, optionally filtered by make and model"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        if make and model:
            years = await conn.fetch(
                """SELECT DISTINCT year_start, year_end 
                   FROM vehicle_data 
                   WHERE make = $1 AND model = $2 
                   ORDER BY year_start""",
                make, model
            )
        elif make:
            years = await conn.fetch(
                """SELECT DISTINCT year_start, year_end 
                   FROM vehicle_data 
                   WHERE make = $1 
                   ORDER BY year_start""",
                make
            )
        else:
            years = await conn.fetch(
                """SELECT DISTINCT year_start, year_end 
                   FROM vehicle_data 
                   ORDER BY year_start"""
            )
        return [{"year_start": year['year_start'], "year_end": year['year_end']} for year in years]
    finally:
        await conn.close()

@app.get("/api/vehicle/body-types")
async def get_vehicle_body_types(make: str = None, model: str = None, year: int = None):
    """Get vehicle body types, optionally filtered by make, model, and year"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        query = "SELECT DISTINCT body_type FROM vehicle_data WHERE 1=1"
        params = []
        param_count = 0
        
        if make:
            param_count += 1
            query += f" AND make = ${param_count}"
            params.append(make)
        
        if model:
            param_count += 1
            query += f" AND model = ${param_count}"
            params.append(model)
        
        if year:
            param_count += 1
            query += f" AND (${param_count} BETWEEN year_start AND COALESCE(year_end, 9999))"
            params.append(year)
        
        query += " ORDER BY body_type"
        
        body_types = await conn.fetch(query, *params)
        return [body_type['body_type'] for body_type in body_types]
    finally:
        await conn.close()

@app.get("/api/vehicle/badges")
async def get_vehicle_badges(make: str = None, model: str = None, year: int = None, body_type: str = None):
    """Get vehicle badges/trim levels, optionally filtered by make, model, year, and body type"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        query = "SELECT DISTINCT badge FROM vehicle_data WHERE badge IS NOT NULL AND badge != ''"
        params = []
        param_count = 0
        
        if make:
            param_count += 1
            query += f" AND make = ${param_count}"
            params.append(make)
        
        if model:
            param_count += 1
            query += f" AND model = ${param_count}"
            params.append(model)
        
        if year:
            param_count += 1
            query += f" AND (${param_count} BETWEEN year_start AND COALESCE(year_end, 9999))"
            params.append(year)
        
        if body_type:
            param_count += 1
            query += f" AND body_type = ${param_count}"
            params.append(body_type)
        
        query += " ORDER BY badge"
        
        badges = await conn.fetch(query, *params)
        return [badge['badge'] for badge in badges]
    finally:
        await conn.close()

@app.get("/api/vin/decode/{vin}")
async def decode_vin_endpoint(vin: str):
    """Decode VIN and return basic vehicle information"""
    try:
        decoded = decode_vin(vin)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error decoding VIN: {str(e)}")

@app.get("/api/vin/specifications/{vin}")
async def get_vehicle_specifications(vin: str):
    """Get detailed vehicle specifications from VIN"""
    try:
        specs = lookup_vehicle_specifications(vin)
        return specs
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error getting specifications: {str(e)}")

@app.post("/api/vin/validate")
async def validate_vin_endpoint(request: dict):
    """Validate VIN format and checksum"""
    vin = request.get("vin", "")
    if not vin:
        raise HTTPException(status_code=400, detail="VIN is required")
    
    try:
        is_valid = validate_vin(vin)
        return {"vin": vin, "valid": is_valid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error validating VIN: {str(e)}")

@app.get("/api/vehicle/search")
async def search_vehicles(make: str = None, model: str = None, year: int = None, body_type: str = None, badge: str = None):
    """Search vehicles with multiple filters"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        query = "SELECT make, model, year_start, year_end, body_type, badge, category FROM vehicle_data WHERE 1=1"
        params = []
        param_count = 0
        
        if make:
            param_count += 1
            query += f" AND make = ${param_count}"
            params.append(make)
        
        if model:
            param_count += 1
            query += f" AND model = ${param_count}"
            params.append(model)
        
        if year:
            param_count += 1
            query += f" AND (${param_count} BETWEEN year_start AND COALESCE(year_end, 9999))"
            params.append(year)
        
        if body_type:
            param_count += 1
            query += f" AND body_type = ${param_count}"
            params.append(body_type)
        
        if badge:
            param_count += 1
            query += f" AND badge = ${param_count}"
            params.append(badge)
        
        query += " ORDER BY make, model, year_start"
        
        vehicles = await conn.fetch(query, *params)
        return [
            {
                "make": v['make'],
                "model": v['model'],
                "year_start": v['year_start'],
                "year_end": v['year_end'],
                "body_type": v['body_type'],
                "badge": v['badge'],
                "category": v['category']
            }
            for v in vehicles
        ]
    finally:
        await conn.close()

# --- Asset Management Endpoints ---

class AssetCreate(BaseModel):
    # Basic Information
    name: str
    category: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    body_feature: Optional[str] = None
    badge: Optional[str] = None
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



def get_next_saturday():
    """Get the date of the next Saturday"""
    today = datetime.now().date()
    days_until_saturday = (5 - today.weekday()) % 7  # Saturday is weekday 5
    if days_until_saturday == 0:
        # Today is Saturday, schedule for next Saturday
        days_until_saturday = 7
    return today + timedelta(days=days_until_saturday)

async def check_and_schedule_maintenance():
    """Check all maintenance schedules and create calendar events for due maintenance"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Get all maintenance schedules with interval-based triggers
        schedules = await conn.fetch("""
            SELECT ms.*, ai.name as asset_name, ai.make, ai.model
            FROM maintenance_schedules ms
            JOIN asset_inventory ai ON ms.asset_id = ai.id
            WHERE ms.interval_type IS NOT NULL 
            AND ms.interval_value IS NOT NULL
            AND ms.status != 'completed'
        """)
        
        for schedule in schedules:
            # Get latest usage for this asset
            latest_usage = await conn.fetchrow("""
                SELECT usage_value, usage_type, timestamp 
                FROM asset_usage_log 
                WHERE asset_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 1
            """, schedule['asset_id'])
            
            if not latest_usage:
                logging.info(f"No usage records found for asset {schedule['asset_name']}")
                continue
            
            current_usage = latest_usage['usage_value']
            last_maintenance_usage = schedule['last_maintenance_usage'] or 0
            
            # Calculate usage since last maintenance
            usage_since_last = current_usage - last_maintenance_usage
            
            # Calculate 10% threshold
            threshold = schedule['interval_value'] * 0.1
            remaining_usage = schedule['interval_value'] - usage_since_last
            
            logging.info(f"Asset {schedule['asset_name']}: "
                       f"current={current_usage}, last_maintenance={last_maintenance_usage}, "
                       f"usage_since_last={usage_since_last}, "
                       f"interval={schedule['interval_value']}, "
                       f"remaining={remaining_usage}, threshold={threshold}")
            
            # Check if asset is within 10% of interval
            if remaining_usage <= threshold and remaining_usage > 0:
                # Check if we already have a scheduled event for this maintenance
                existing_event = await conn.fetchrow("""
                    SELECT id FROM calendar_entries 
                    WHERE related_id = $1 
                    AND category = 'asset'
                    AND entry_date >= CURRENT_DATE
                    AND title = $2
                """, schedule['asset_id'], schedule['task_description'])
                
                if existing_event:
                    logging.info(f"Event already scheduled for {schedule['asset_name']} - {schedule['task_description']}")
                    continue
                
                # Schedule maintenance for next Saturday
                next_saturday = get_next_saturday()
                
                # Create calendar event
                await conn.execute("""
                    INSERT INTO calendar_entries (
                        entry_date, category, title, description, related_id, 
                        related_name, entry_type, created_at, updated_at
                    ) VALUES (
                        $1, 'asset', $2, $3, $4, $5, 'event', NOW(), NOW()
                    )
                """, next_saturday, schedule['task_description'], 
                      f"Scheduled maintenance for {schedule['asset_name']}. "
                      f"Current usage: {current_usage:.1f}, Interval: {schedule['interval_value']} {schedule['interval_type']}",
                      schedule['asset_id'], f"{schedule['asset_name']} - {schedule['make']} {schedule['model']}")
                
                logging.info(f"Scheduled maintenance for {schedule['asset_name']} on {next_saturday}: {schedule['task_description']}")
                
                # Update maintenance schedule to mark as scheduled
                await conn.execute("""
                    UPDATE maintenance_schedules 
                    SET status = 'scheduled', due_date = $1
                    WHERE id = $2
                """, next_saturday, schedule['id'])
        
        return {"message": "Maintenance scheduling check completed"}
        
    except Exception as e:
        logging.error(f"Error in maintenance scheduling: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@app.get("/api/assets")
async def get_assets(parent_id: Optional[int] = None):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        if parent_id is not None:
            # Return only child assets of the specified parent
            print(f"Fetching assets with parent_id: {parent_id}")
            records = await conn.fetch("""
                SELECT id, name, make, model, location, status, quantity, category,
                       serial_number, purchase_date, registration_no, registration_due,
                       permit_info, insurance_info, insurance_due, warranty_provider,
                       warranty_expiry_date, purchase_price, purchase_location,
                       manual_or_doc_path, notes, parent_asset_id, badge, created_at
                FROM asset_inventory 
                WHERE parent_asset_id = $1
                ORDER BY name
            """, parent_id)
        else:
            # Return all assets
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

@app.get("/api/asset/{asset_id}/maintenance")
async def get_asset_maintenance_history(asset_id: int):
    """Get maintenance history for a specific asset"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Get completed maintenance records
        maintenance_records = await conn.fetch("""
            SELECT 'maintenance' as record_type, id, task_description, completed_date, supplier, cost, meter_reading, status,
                   notes, invoice_number, due_date, is_unscheduled, maintenance_trigger_type,
                   maintenance_trigger_value, last_maintenance_usage, interval_type, interval_value
            FROM maintenance_schedules 
            WHERE asset_id = $1 
            ORDER BY completed_date DESC
        """, asset_id)
        
        # Get scheduled calendar events for this asset
        scheduled_events = await conn.fetch("""
            SELECT 'scheduled' as record_type, id, title as task_description, entry_date as completed_date, 
                   NULL as supplier, NULL as cost, NULL as meter_reading, 
                   CASE WHEN entry_date < CURRENT_DATE THEN 'overdue' ELSE 'scheduled' END as status,
                   description as notes, NULL as invoice_number, NULL as due_date, 
                   NULL as is_unscheduled, NULL as maintenance_trigger_type,
                   NULL as maintenance_trigger_value, NULL as last_maintenance_usage, 
                   NULL as interval_type, NULL as interval_value,
                   event_time, duration_hours
            FROM calendar_entries 
            WHERE related_id = $1 AND category = 'asset' AND entry_type = 'event'
            ORDER BY entry_date DESC, event_time DESC
        """, asset_id)
        
        # Combine and sort all records by date
        all_records = []
        
        # Add maintenance records
        for record in maintenance_records:
            all_records.append(dict(record))
        
        # Add scheduled events
        for record in scheduled_events:
            all_records.append(dict(record))
        
        # Sort by date (scheduled events with future dates come after completed ones)
        all_records.sort(key=lambda x: (x['completed_date'] or '9999-12-31'), reverse=True)
        
        return all_records
    finally:
        await conn.close()

@app.get("/api/livestock/{animal_id}/history")
async def get_livestock_history(animal_id: int):
    """Get history for a specific animal"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Get completed animal history records
        history_records = await conn.fetch("""
            SELECT 'history' as record_type, id, title as task_description, event_date as completed_date, 
                   NULL as supplier, NULL as cost, NULL as meter_reading, status,
                   notes, NULL as invoice_number, NULL as due_date, 
                   NULL as is_unscheduled, NULL as maintenance_trigger_type,
                   NULL as maintenance_trigger_value, NULL as last_maintenance_usage, 
                   NULL as interval_type, NULL as interval_value,
                   event_time, duration_hours
            FROM animal_history 
            WHERE animal_id = $1 
            ORDER BY event_date DESC
        """, animal_id)
        
        # Get scheduled calendar events for this animal
        scheduled_events = await conn.fetch("""
            SELECT 'scheduled' as record_type, id, title as task_description, entry_date as completed_date, 
                   NULL as supplier, NULL as cost, NULL as meter_reading, 
                   CASE WHEN entry_date < CURRENT_DATE THEN 'overdue' ELSE 'scheduled' END as status,
                   description as notes, NULL as invoice_number, NULL as due_date, 
                   NULL as is_unscheduled, NULL as maintenance_trigger_type,
                   NULL as maintenance_trigger_value, NULL as last_maintenance_usage, 
                   NULL as interval_type, NULL as interval_value,
                   event_time, duration_hours
            FROM calendar_entries 
            WHERE related_id = $1 AND category = 'livestock' AND entry_type = 'event'
            ORDER BY entry_date DESC, event_time DESC
        """, animal_id)
        
        # Combine and sort all records by date
        all_records = []
        
        # Add history records
        for record in history_records:
            all_records.append(dict(record))
        
        # Add scheduled events
        for record in scheduled_events:
            all_records.append(dict(record))
        
        # Sort by date (scheduled events with future dates come after completed ones)
        all_records.sort(key=lambda x: (x['completed_date'] or '9999-12-31'), reverse=True)
        
        return all_records
    finally:
        await conn.close()

@app.post("/api/asset")
async def add_asset(asset: AssetCreate):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        async with conn.transaction():
            # Convert date strings to date objects
            purchase_date = datetime.strptime(asset.purchase_date, '%Y-%m-%d').date() if asset.purchase_date else None
            registration_due = datetime.strptime(asset.registration_due, '%Y-%m-%d').date() if asset.registration_due else None
            insurance_due = datetime.strptime(asset.insurance_due, '%Y-%m-%d').date() if asset.insurance_due else None
            warranty_expiry_date = datetime.strptime(asset.warranty_expiry_date, '%Y-%m-%d').date() if asset.warranty_expiry_date else None
            
            # Convert empty strings to None for unique constraint fields
            serial_number = asset.serial_number.strip() if asset.serial_number and asset.serial_number.strip() else None
            registration_no = asset.registration_no.strip() if asset.registration_no and asset.registration_no.strip() else None
            
            # Insert asset with all fields
            result = await conn.fetchrow("""
                INSERT INTO asset_inventory 
                (name, category, make, model, year, body_feature, badge, serial_number, purchase_date, status,
                 parent_asset_id, location, quantity, registration_no, registration_due,
                 permit_info, insurance_info, insurance_due, warranty_provider,
                 warranty_expiry_date, purchase_price, purchase_location,
                 manual_or_doc_path, notes, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW())
                RETURNING id
            """, asset.name, asset.category, asset.make, asset.model, asset.year, asset.body_feature, 
                asset.badge, serial_number, purchase_date, asset.status, asset.parent_asset_id, asset.location,
                asset.quantity, registration_no, registration_due, asset.permit_info,
                asset.insurance_info, insurance_due, asset.warranty_provider,
                warranty_expiry_date, asset.purchase_price, asset.purchase_location,
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
            # Convert date strings to date objects
            purchase_date = datetime.strptime(asset.purchase_date, '%Y-%m-%d').date() if asset.purchase_date else None
            registration_due = datetime.strptime(asset.registration_due, '%Y-%m-%d').date() if asset.registration_due else None
            insurance_due = datetime.strptime(asset.insurance_due, '%Y-%m-%d').date() if asset.insurance_due else None
            warranty_expiry_date = datetime.strptime(asset.warranty_expiry_date, '%Y-%m-%d').date() if asset.warranty_expiry_date else None
            
            # Convert empty strings to None for unique constraint fields
            serial_number = asset.serial_number.strip() if asset.serial_number and asset.serial_number.strip() else None
            registration_no = asset.registration_no.strip() if asset.registration_no and asset.registration_no.strip() else None
            
            # Update asset with all fields
            await conn.execute("""
                UPDATE asset_inventory 
                SET name = $1, category = $2, make = $3, model = $4, year = $5, body_feature = $6,
                    badge = $7, serial_number = $8, purchase_date = $9, status = $10, parent_asset_id = $11, location = $12,
                    quantity = $13, registration_no = $14, registration_due = $15,
                    permit_info = $16, insurance_info = $17, insurance_due = $18,
                    warranty_provider = $19, warranty_expiry_date = $20, purchase_price = $21,
                    purchase_location = $22, manual_or_doc_path = $23, notes = $24
                WHERE id = $25
            """, asset.name, asset.category, asset.make, asset.model, asset.year, asset.body_feature,
                asset.badge, serial_number, purchase_date, asset.status, asset.parent_asset_id, asset.location,
                asset.quantity, registration_no, registration_due, asset.permit_info,
                asset.insurance_info, insurance_due, asset.warranty_provider,
                warranty_expiry_date, asset.purchase_price, asset.purchase_location,
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
        # Convert date strings to date objects for asyncpg
        due_date_obj = None
        completed_date_obj = None
        
        if schedule.due_date:
            due_date_obj = datetime.strptime(schedule.due_date, '%Y-%m-%d').date()
        
        if schedule.completed_date:
            completed_date_obj = datetime.strptime(schedule.completed_date, '%Y-%m-%d').date()
        
        # Convert empty strings to None for database constraints
        maintenance_trigger_type = schedule.maintenance_trigger_type.strip() if schedule.maintenance_trigger_type and schedule.maintenance_trigger_type.strip() else None
        interval_type = schedule.interval_type.strip() if schedule.interval_type and schedule.interval_type.strip() else None
        supplier = schedule.supplier.strip() if schedule.supplier and schedule.supplier.strip() else None
        invoice_number = schedule.invoice_number.strip() if schedule.invoice_number and schedule.invoice_number.strip() else None
        notes = schedule.notes.strip() if schedule.notes and schedule.notes.strip() else None
        
        # Insert maintenance schedule
        query = """
            INSERT INTO maintenance_schedules (
                asset_id, task_description, due_date, completed_date, status, 
                is_unscheduled, maintenance_trigger_type, maintenance_trigger_value,
                last_maintenance_usage, meter_reading, interval_type, interval_value,
                cost, supplier, invoice_number, notes
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            ) RETURNING id
        """
        
        result = await conn.fetchrow(
            query,
            schedule.asset_id,
            schedule.task_description,
            due_date_obj,
            completed_date_obj,
            schedule.status,
            schedule.is_unscheduled,
            maintenance_trigger_type,
            schedule.maintenance_trigger_value,
            schedule.last_maintenance_usage,
            schedule.meter_reading,
            interval_type,
            schedule.interval_value,
            schedule.cost,
            supplier,
            invoice_number,
            notes
        )
        
        return {"message": "Maintenance schedule created successfully", "id": result['id']}
    finally:
        await conn.close()

@app.get("/api/maintenance-schedule/{schedule_id}")
async def get_maintenance_schedule(schedule_id: int):
    """Get a single maintenance schedule for editing"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        record = await conn.fetchrow("SELECT * FROM maintenance_schedules WHERE id = $1", schedule_id)
        if not record:
            raise HTTPException(status_code=404, detail="Maintenance schedule not found")
        return dict(record)
    finally:
        await conn.close()

@app.put("/api/maintenance-schedule/{schedule_id}")
async def update_maintenance_schedule(schedule_id: int, schedule: MaintenanceScheduleCreate):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Convert date strings to date objects for asyncpg
        # due_date is now mandatory
        due_date_obj = datetime.strptime(schedule.due_date, '%Y-%m-%d').date()
        completed_date_obj = None
        
        if schedule.completed_date:
            completed_date_obj = datetime.strptime(schedule.completed_date, '%Y-%m-%d').date()
        
        # Convert empty strings to None for database constraints
        maintenance_trigger_type = schedule.maintenance_trigger_type.strip() if schedule.maintenance_trigger_type and schedule.maintenance_trigger_type.strip() else None
        # interval_type is now mandatory
        interval_type = schedule.interval_type.strip() if schedule.interval_type else None
        supplier = schedule.supplier.strip() if schedule.supplier and schedule.supplier.strip() else None
        invoice_number = schedule.invoice_number.strip() if schedule.invoice_number and schedule.invoice_number.strip() else None
        notes = schedule.notes.strip() if schedule.notes and schedule.notes.strip() else None
        
        # Update maintenance schedule
        await conn.execute("""
            UPDATE maintenance_schedules 
            SET asset_id = $1, task_description = $2, due_date = $3, completed_date = $4, status = $5, 
                is_unscheduled = $6, maintenance_trigger_type = $7, maintenance_trigger_value = $8,
                last_maintenance_usage = $9, meter_reading = $10, interval_type = $11, interval_value = $12,
                cost = $13, supplier = $14, invoice_number = $15, notes = $16
            WHERE id = $17
        """, schedule.asset_id, schedule.task_description, due_date_obj, completed_date_obj, schedule.status,
            schedule.is_unscheduled, maintenance_trigger_type, schedule.maintenance_trigger_value,
            schedule.last_maintenance_usage, schedule.meter_reading, interval_type, schedule.interval_value,
            schedule.cost, supplier, invoice_number, notes, schedule_id)
        
        return {"message": "Maintenance schedule updated successfully"}
    finally:
        await conn.close()

@app.delete("/api/maintenance-schedule/{schedule_id}")
async def delete_maintenance_schedule(schedule_id: int):
    """Delete a maintenance schedule"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        await conn.execute("DELETE FROM maintenance_schedules WHERE id = $1", schedule_id)
        return {"message": "Maintenance schedule deleted successfully"}
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

# --- Calendar Endpoints ---

class CalendarEvent(BaseModel):
    title: str
    date: str
    entry_type: str  # "informational" or "action"
    category: str  # "livestock" or "asset"
    description: str
    related_id: Optional[int] = None
    related_name: Optional[str] = None

@app.get("/api/calendar")
async def get_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    filter_type: Optional[str] = "month",  # year, quarter, month, fortnight, week, day
    entry_type: Optional[str] = None,  # informational, action, or None for all
    category: Optional[str] = None  # livestock, asset, or None for all
):
    """Get calendar events from both livestock and asset registers"""
    print(f"Calendar API called with: start_date={start_date}, end_date={end_date}, filter_type={filter_type}")
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        events = []
        
        # Calculate date range based on filter type
        today = datetime.now().date()
        
        if not start_date or not end_date:
            if filter_type == "day":
                start_date = today.isoformat()
                end_date = today.isoformat()
            elif filter_type == "week":
                start_date = (today - timedelta(days=today.weekday())).isoformat()
                end_date = (today + timedelta(days=6-today.weekday())).isoformat()
            elif filter_type == "fortnight":
                week_num = today.isocalendar()[1]
                if week_num % 2 == 0:
                    start_date = (today - timedelta(days=today.weekday() + 7)).isoformat()
                    end_date = (today + timedelta(days=6-today.weekday())).isoformat()
                else:
                    start_date = (today - timedelta(days=today.weekday())).isoformat()
                    end_date = (today + timedelta(days=13-today.weekday())).isoformat()
            elif filter_type == "month":
                start_date = today.replace(day=1).isoformat()
                next_month = today.replace(day=28) + timedelta(days=4)
                end_date = next_month.replace(day=1) - timedelta(days=1)
                end_date = end_date.isoformat()
            elif filter_type == "quarter":
                quarter = (today.month - 1) // 3 + 1
                start_month = (quarter - 1) * 3 + 1
                start_date = today.replace(month=start_month, day=1).isoformat()
                if quarter == 4:
                    end_date = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    end_date = today.replace(month=start_month + 3, day=1) - timedelta(days=1)
                end_date = end_date.isoformat()
            elif filter_type == "year":
                start_date = today.replace(month=1, day=1).isoformat()
                end_date = today.replace(month=12, day=31).isoformat()
        
        # Livestock events
        livestock_query = """
            SELECT 
                id, name, birth_date, dod, health_status, gender,
                'livestock' as category,
                CASE 
                    WHEN dod IS NOT NULL THEN 'informational'
                    WHEN birth_date IS NOT NULL THEN 'informational'
                    ELSE 'informational'
                END as entry_type
            FROM livestock_records 
            WHERE (birth_date BETWEEN $1 AND $2 
                   OR dod BETWEEN $1 AND $2)
        """
        
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        print(f"Parsed dates: start_date_obj={start_date_obj}, end_date_obj={end_date_obj}")
        
        livestock_records = await conn.fetch(livestock_query, start_date_obj, end_date_obj)
        
        for record in livestock_records:
            # Birth date event
            if record['birth_date']:
                # Validate date is reasonable (between 1900 and current year + 1)
                current_year = datetime.now().year
                if record['birth_date'].year >= 1900 and record['birth_date'].year <= current_year + 1:
                    birth_date_str = record['birth_date'].isoformat()
                    print(f"Processing livestock birth: {record['name']}, birth_date={record['birth_date']}, birth_date_str={birth_date_str}")
                    if start_date <= birth_date_str <= end_date:
                        print(f"Adding birth event for {record['name']} on {birth_date_str}")
                        events.append({
                            "title": f"Birth: {record['name']}",
                            "date": birth_date_str,
                            "entry_type": "informational",
                            "category": "livestock",
                            "description": f"{record['gender']} - {record.get('health_status', 'Unknown status')}",
                            "related_id": record['id'],
                            "related_name": record['name']
                        })
                    else:
                        print(f"Skipping birth event for {record['name']} - date {birth_date_str} not in range {start_date} to {end_date}")
                else:
                    print(f"Skipping invalid birth date for {record['name']}: {record['birth_date']} (year out of range)")
            
            # Death date event
            if record['dod']:
                # Validate date is reasonable (between 1900 and current year + 1)
                current_year = datetime.now().year
                if record['dod'].year >= 1900 and record['dod'].year <= current_year + 1:
                    dod_date_str = record['dod'].isoformat()
                    print(f"Processing livestock death: {record['name']}, dod={record['dod']}, dod_date_str={dod_date_str}")
                    if start_date <= dod_date_str <= end_date:
                        print(f"Adding death event for {record['name']} on {dod_date_str}")
                        events.append({
                            "title": f"Deceased: {record['name']}",
                            "date": dod_date_str,
                            "entry_type": "informational",
                            "category": "livestock",
                            "description": f"{record['gender']} - {record.get('health_status', 'Unknown status')}",
                            "related_id": record['id'],
                            "related_name": record['name']
                        })
                    else:
                        print(f"Skipping death event for {record['name']} - date {dod_date_str} not in range {start_date} to {end_date}")
                else:
                    print(f"Skipping invalid death date for {record['name']}: {record['dod']} (year out of range)")
        
        # Asset events
        asset_query = """
            SELECT 
                id, name, purchase_date, registration_due, insurance_due, 
                warranty_expiry_date, status, category,
                'asset' as category,
                CASE 
                    WHEN registration_due IS NOT NULL THEN 'action'
                    WHEN insurance_due IS NOT NULL THEN 'action'
                    WHEN warranty_expiry_date IS NOT NULL THEN 'action'
                    ELSE 'informational'
                END as entry_type
            FROM asset_inventory 
            WHERE (purchase_date BETWEEN $1 AND $2 
                   OR registration_due BETWEEN $1 AND $2
                   OR insurance_due BETWEEN $1 AND $2
                   OR warranty_expiry_date BETWEEN $1 AND $2)
        """
        
        asset_records = await conn.fetch(asset_query, datetime.strptime(start_date, '%Y-%m-%d').date(), datetime.strptime(end_date, '%Y-%m-%d').date())
        
        for record in asset_records:
            # Purchase date event
            if record['purchase_date']:
                purchase_date_str = record['purchase_date'].isoformat()
                if start_date <= purchase_date_str <= end_date:
                    events.append({
                        "title": f"Purchased: {record['name']}",
                        "date": purchase_date_str,
                        "entry_type": "informational",
                        "category": "asset",
                        "description": f"{record.get('category', 'Unknown category')} - {record.get('status', 'Unknown status')}",
                        "related_id": record['id'],
                        "related_name": record['name']
                    })
            
            # Registration due event
            if record['registration_due']:
                # Validate date is reasonable (between 1900 and 2100)
                if record['registration_due'].year >= 1900 and record['registration_due'].year <= 2100:
                    reg_date_str = record['registration_due'].isoformat()
                    print(f"Processing asset registration: {record['name']}, registration_due={record['registration_due']}, reg_date_str={reg_date_str}")
                    if start_date <= reg_date_str <= end_date:
                        print(f"Adding registration event for {record['name']} on {reg_date_str}")
                        events.append({
                            "title": f"Registration Due: {record['name']}",
                            "date": reg_date_str,
                            "entry_type": "action",
                            "category": "asset",
                            "description": f"Registration renewal required for {record.get('category', 'asset')}",
                            "related_id": record['id'],
                            "related_name": record['name']
                        })
                    else:
                        print(f"Skipping registration event for {record['name']} - date {reg_date_str} not in range {start_date} to {end_date}")
                else:
                    print(f"Skipping invalid registration date for {record['name']}: {record['registration_due']} (year out of range)")
            
            # Insurance due event
            if record['insurance_due']:
                # Validate date is reasonable (between 1900 and 2100)
                if record['insurance_due'].year >= 1900 and record['insurance_due'].year <= 2100:
                    insurance_date_str = record['insurance_due'].isoformat()
                    if start_date <= insurance_date_str <= end_date:
                        events.append({
                            "title": f"Insurance Due: {record['name']}",
                            "date": insurance_date_str,
                            "entry_type": "action",
                            "category": "asset",
                            "description": f"Insurance renewal required for {record.get('category', 'asset')}",
                            "related_id": record['id'],
                            "related_name": record['name']
                        })
                else:
                    print(f"Skipping invalid insurance date for {record['name']}: {record['insurance_due']} (year out of range)")
            
            # Warranty expiry event
            if record['warranty_expiry_date']:
                # Validate date is reasonable (between 1900 and 2100)
                if record['warranty_expiry_date'].year >= 1900 and record['warranty_expiry_date'].year <= 2100:
                    warranty_date_str = record['warranty_expiry_date'].isoformat()
                    if start_date <= warranty_date_str <= end_date:
                        events.append({
                            "title": f"Warranty Expiry: {record['name']}",
                            "date": warranty_date_str,
                            "entry_type": "action",
                            "category": "asset",
                            "description": f"Warranty expiring for {record.get('category', 'asset')}",
                            "related_id": record['id'],
                            "related_name": record['name']
                        })
                else:
                    print(f"Skipping invalid warranty date for {record['name']}: {record['warranty_expiry_date']} (year out of range)")
        
        # Maintenance events
        maintenance_query = """
            SELECT 
                ms.id, ms.asset_id, ms.task_description, ms.due_date, 
                ms.completed_date, ms.status, ai.name as asset_name,
                'asset' as category,
                CASE 
                    WHEN ms.status = 'pending' THEN 'action'
                    WHEN ms.status = 'overdue' THEN 'action'
                    ELSE 'informational'
                END as entry_type
            FROM maintenance_schedules ms
            JOIN asset_inventory ai ON ms.asset_id = ai.id
            WHERE (ms.due_date BETWEEN $1 AND $2 
                   OR ms.completed_date BETWEEN $1 AND $2)
        """
        
        maintenance_records = await conn.fetch(maintenance_query, datetime.strptime(start_date, '%Y-%m-%d').date(), datetime.strptime(end_date, '%Y-%m-%d').date())
        
        for record in maintenance_records:
            # Due date event - only show if maintenance is not completed
            if record['due_date'] and start_date <= record['due_date'].isoformat() <= end_date and record['status'] != 'completed':
                events.append({
                    "title": f"Maintenance Due: {record['asset_name']}",
                    "date": record['due_date'].isoformat(),
                    "entry_type": "action",
                    "category": "asset",
                    "description": record['task_description'],
                    "related_id": record['asset_id'],
                    "related_name": record['asset_name'],
                    "maintenance_id": record['id'],
                    "status": record['status']
                })
            
            # Completed date event
            if record['completed_date'] and start_date <= record['completed_date'].isoformat() <= end_date:
                events.append({
                    "title": f"Maintenance Completed: {record['asset_name']}",
                    "date": record['completed_date'].isoformat(),
                    "entry_type": "informational",
                    "category": "asset",
                    "description": record['task_description'],
                    "related_id": record['asset_id'],
                    "related_name": record['asset_name'],
                    "maintenance_id": record['id'],
                    "status": record['status']
                    })
        
        # Calendar events (user-created events)
        calendar_events_query = """
            SELECT 
                id, entry_date, event_time, duration_hours, title, description, entry_type, 
                category, related_id, related_name
            FROM calendar_entries 
            WHERE entry_date BETWEEN $1 AND $2
        """
        
        calendar_records = await conn.fetch(calendar_events_query, datetime.strptime(start_date, '%Y-%m-%d').date(), datetime.strptime(end_date, '%Y-%m-%d').date())
        
        for record in calendar_records:
            events.append({
                "id": record['id'],
                "title": record['title'],
                "date": record['entry_date'].isoformat(),
                "time": record['event_time'].isoformat() if record['event_time'] else None,
                "duration": float(record['duration_hours']) if record['duration_hours'] else 1.0,
                "entry_type": record['entry_type'],
                "category": record['category'],
                "description": record['description'] or '',
                "related_id": record['related_id'],
                "related_name": record['related_name'] or 'Unknown'
            })
        
        # Apply filters
        if entry_type:
            events = [e for e in events if e['entry_type'] == entry_type]
        
        if category:
            events = [e for e in events if e['category'] == category]
        
        # Sort by date
        events.sort(key=lambda x: x['date'])
        
        return events
    finally:
        await conn.close()
