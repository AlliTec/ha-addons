#!/usr/bin/env python3
"""
Database migration script to add badge column to asset_inventory table
"""

import asyncio
import asyncpg
import os

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/farm_assistant')

async def run_migration():
    """Add badge column to asset_inventory table"""
    try:
        print("Connecting to database...")
        conn = await asyncpg.connect(DATABASE_URL)
        
        print("Adding badge column to asset_inventory table...")
        try:
            await conn.execute('ALTER TABLE asset_inventory ADD COLUMN IF NOT EXISTS badge VARCHAR(100)')
            print("✓ Badge column added successfully")
        except Exception as e:
            print(f"Error adding badge column: {e}")
        
        print("Adding comment to badge column...")
        try:
            await conn.execute('COMMENT ON COLUMN asset_inventory.badge IS $1', 
                             'Vehicle badge or trim level (e.g., XR6 Turbo, GT, Limited, Sport)')
            print("✓ Badge column comment added")
        except Exception as e:
            print(f"Error adding comment: {e}")
        
        print("Creating index on badge column...")
        try:
            await conn.execute('CREATE INDEX IF NOT EXISTS idx_asset_inventory_badge ON asset_inventory(badge)')
            print("✓ Badge index created")
        except Exception as e:
            print(f"Error creating index: {e}")
        
        print("Updating timestamp for existing records...")
        try:
            await conn.execute('UPDATE asset_inventory SET updated_at = CURRENT_TIMESTAMP WHERE badge IS NOT NULL')
            print("✓ Timestamps updated")
        except Exception as e:
            print(f"Error updating timestamps: {e}")
        
        await conn.close()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(run_migration())