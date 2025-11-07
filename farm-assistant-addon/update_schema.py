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

async def update_schema():
    config = get_config()
    DB_HOST = config.get("db_host")
    DB_PORT = config.get("db_port", 5432)
    DB_USER = config.get("db_user")
    DB_PASSWORD = config.get("db_password")
    DB_NAME = config.get("db_name")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    conn = await asyncpg.connect(DATABASE_URL)
    try:
        await conn.execute("ALTER TABLE livestock_records ADD COLUMN species VARCHAR(255)")
        print("Schema updated successfully.")
    finally:
        await conn.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(update_schema())