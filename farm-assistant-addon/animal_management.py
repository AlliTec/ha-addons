
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

class Animal(BaseModel):
    animal_type: str
    name: str
    gender: str
    breed: str
    birth_date: str
    features: str

class AnimalData(BaseModel):
    animal_type: str

animal_data = {
    "Cattle": {
        "breeds": ["Santa Gertrudis", "Brahman", "Angus", "Hereford", "Other"],
        "genders": ["Bull", "Cow", "Steer", "Heifer"]
    },
    "Dog": {
        "breeds": ["Labrador", "German Shepherd", "Golden Retriever", "Other"],
        "genders": ["Male", "Female"]
    },
    "Cat": {
        "breeds": ["Domestic Shorthair", "Siamese", "Persian", "Other"],
        "genders": ["Male", "Female"]
    },
    "Chicken": {
        "breeds": ["ISA Brown", "Rhode Island Red", "Leghorn", "Other"],
        "genders": ["Rooster", "Hen"]
    },
    "Guinea Fowl": {
        "breeds": ["Pearl", "Lavender", "White", "Other"],
        "genders": ["Male", "Female"]
    }
}

@app.post("/add_animal")
async def add_animal(animal: Animal):
    try:
        conn = await asyncpg.connect("postgresql://postgres:homeassistant@77b2833f-timescaledb/hal_farm_db")
        await conn.execute("""
            INSERT INTO livestock_records (animal_type, name, gender, breed, birth_date, features, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'On Property')
        """, animal.animal_type, animal.name, animal.gender, animal.breed, animal.birth_date, animal.features)
        await conn.close()
        return {"message": "Animal added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get_animal_details")
def get_animal_details(data: AnimalData):
    return animal_data.get(data.animal_type, {})

@app.get("/get_animals")
async def get_animals():
    try:
        conn = await asyncpg.connect("postgresql://postgres:homeassistant@77b2833f-timescaledb/hal_farm_db")
        records = await conn.fetch("SELECT id, animal_type, name, gender, breed, birth_date, features, status FROM livestock_records ORDER BY name")
        await conn.close()
        animals = [dict(record) for record in records]
        return animals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_animal/{animal_id}")
async def get_animal(animal_id: int):
    try:
        conn = await asyncpg.connect("postgresql://postgres:homeassistant@77b2833f-timescaledb/hal_farm_db")
        record = await conn.fetchrow("SELECT id, animal_type, name, gender, breed, birth_date, features, status FROM livestock_records WHERE id = $1", animal_id)
        await conn.close()
        return dict(record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_animal/{animal_id}")
async def delete_animal(animal_id: int):
    try:
        conn = await asyncpg.connect("postgresql://postgres:homeassistant@77b2833f-timescaledb/hal_farm_db")
        await conn.execute("DELETE FROM livestock_records WHERE id = $1", animal_id)
        await conn.close()
        return {"message": "Animal deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update_animal/{animal_id}")
async def update_animal(animal_id: int, animal: Animal):
    try:
        conn = await asyncpg.connect("postgresql://postgres:homeassistant@77b2833f-timescaledb/hal_farm_db")
        await conn.execute("""
            UPDATE livestock_records
            SET animal_type = $1, name = $2, gender = $3, breed = $4, birth_date = $5, features = $6
            WHERE id = $7
        """, animal.animal_type, animal.name, animal.gender, animal.breed, animal.birth_date, animal.features, animal_id)
        await conn.close()
        return {"message": "Animal updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Welcome to the Farm Assistant addon!"}
