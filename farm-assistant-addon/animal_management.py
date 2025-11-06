import os
import asyncpg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = os.environ.get("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

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

@router.post("/add_animal")
async def add_animal(animal: Animal):
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("""
            INSERT INTO livestock_records (animal_type, name, gender, breed, birth_date, features, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'On Property')
        """, animal.animal_type, animal.name, animal.gender, animal.breed, animal.birth_date, animal.features)
        await conn.close()
        return {"message": "Animal added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_animal_details")
def get_animal_details(data: AnimalData):
    return animal_data.get(data.animal_type, {})

@router.get("/get_animals")
async def get_animals():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        records = await conn.fetch("SELECT id, animal_type, name, gender, breed, birth_date, features, status FROM livestock_records ORDER BY name")
        await conn.close()
        animals = [dict(record) for record in records]
        return animals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_animal/{animal_id}")
async def get_animal(animal_id: int):
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        record = await conn.fetchrow("SELECT id, animal_type, name, gender, breed, birth_date, features, status FROM livestock_records WHERE id = $1", animal_id)
        await conn.close()
        return dict(record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete_animal/{animal_id}")
async def delete_animal(animal_id: int):
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("DELETE FROM livestock_records WHERE id = $1", animal_id)
        await conn.close()
        return {"message": "Animal deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update_animal/{animal_id}")
async def update_animal(animal_id: int, animal: Animal):
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("""
            UPDATE livestock_records
            SET animal_type = $1, name = $2, gender = $3, breed = $4, birth_date = $5, features = $6
            WHERE id = $7
        """, animal.animal_type, animal.name, animal.gender, animal.breed, animal.birth_date, animal.features, animal_id)
        await conn.close()
        return {"message": "Animal updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def read_root():
    return {"message": "Welcome to the Farm Assistant addon!"}
