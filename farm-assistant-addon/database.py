
import json
import os
import sys
import asyncpg
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

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

# Load configuration
config = get_config()

# Construct database URL from config
DB_HOST = config.get("db_host")
DB_PORT = config.get("db_port", 5432)
DB_USER = config.get("db_user")
DB_PASSWORD = config.get("db_password")
DB_NAME = config.get("db_name")

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
