import csv
import os
import json
import asyncpg

def get_config():
    config_path = "/data/options.json"
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found at {config_path}")
    with open(config_path, "r") as f:
        config = json.load(f)
    required_keys = ["db_host", "db_user", "db_password", "db_name"]
    if not all(key in config and config[key] for key in required_keys):
        raise ValueError("Database configuration is incomplete.")
    return config

async def import_data():
    config = get_config()
    DB_HOST = config.get("db_host")
    DB_PORT = config.get("db_port", 5432)
    DB_USER = config.get("db_user")
    DB_PASSWORD = config.get("db_password")
    DB_NAME = config.get("db_name")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    conn = await asyncpg.connect(DATABASE_URL)
    try:
        with open("data.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                await conn.execute("""
                    INSERT INTO livestock_records (id, tag_id, name, species, breed, birth_date, gender, health_status, notes, created_at, dam_id, sire_id, status, features, photo_path, pic, dod)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                    ON CONFLICT (id) DO NOTHING
                """, int(row['id']), row['tag_id'], row['name'], row['species'], row['breed'], row['birth_date'], row['gender'], row['health_status'], row['notes'], row['created_at'], int(row['dam_id']) if row['dam_id'] else None, int(row['sire_id']) if row['sire_id'] else None, row['status'], row['features'], row['photo_path'], row['pic'], row['dod'])
        print("Data imported successfully.")
    finally:
        await conn.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(import_data())</content>
</xai:function_call ><xai:function_call name="edit">
<parameter name="filePath">farm-assistant-addon/Dockerfile