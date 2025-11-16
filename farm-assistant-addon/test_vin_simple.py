#!/usr/bin/env python3
"""Simple VIN lookup test without full server setup"""

import sys
import os
import json

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock the configuration for testing
class MockConfig:
    def __init__(self):
        self.db_host = "192.168.1.130"
        self.db_port = 5432
        self.db_user = "postgres"
        self.db_password = "homeassistant"
        self.db_name = "hal_farm_db"

# Mock the get_config function
def get_config():
    return MockConfig()

# Replace the get_config function before importing main
import main
main.get_config = get_config

# Now test the VIN decoder directly
from vin_decoder import VINDecoder

async def test_vin_lookup():
    """Test VIN lookup functionality"""
    print("=== VIN Lookup Test ===")
    
    decoder = VINDecoder()
    test_vin = "6FPAAAJG33333"
    
    print(f"Testing VIN: {test_vin}")
    
    # Test VIN decode
    decoded = decoder.decode_vin(test_vin)
    print(f"Decoded VIN: {json.dumps(decoded, indent=2, default=str)}")
    
    if decoded.get('valid'):
        print("✅ VIN is valid")
        
        # Test what the frontend would need to populate
        manufacturer = decoded.get('manufacturer', '')
        make_name = manufacturer.split(' ')[0] if manufacturer else ''
        model_info = decoded.get('model_info', {})
        
        print(f"Make name for frontend: '{make_name}'")
        print(f"Model: '{model_info.get('model')}'")
        print(f"Year: {decoded.get('year')}")
        print(f"Body type: '{model_info.get('body_type')}'")
        print(f"Badge/trim: '{model_info.get('trim')}'")
        
        # Now test database queries to verify matching data exists
        try:
            import asyncpg
            
            conn = await asyncpg.connect(
                host=main.DATABASE_URL.split('@')[1].split(':')[0],
                port=main.DATABASE_URL.split(':')[3].split('/')[0],
                user=main.DATABASE_URL.split('//')[1].split(':')[0],
                password=main.DATABASE_URL.split(':')[2].split('@')[0],
                database=main.DATABASE_URL.split('/')[-1]
            )
            
            print("\n=== Database Verification ===")
            
            # Check makes
            makes = await conn.fetch('SELECT DISTINCT make FROM vehicle_data ORDER BY make')
            make_list = [row['make'] for row in makes]
            print(f"Available makes: {make_list}")
            print(f"Make '{make_name}' found: {make_name in make_list}")
            
            # Check models for this make
            if make_name in make_list:
                models = await conn.fetch('SELECT DISTINCT model FROM vehicle_data WHERE make = $1 ORDER BY model', make_name)
                model_list = [row['model'] for row in models]
                print(f"Available models for {make_name}: {model_list}")
                
                model = model_info.get('model')
                print(f"Model '{model}' found: {model in model_list}")
                
                # Check body types for this make/model/year
                if model in model_list:
                    year = decoded.get('year')
                    body_types = await conn.fetch('SELECT DISTINCT body_type FROM vehicle_data WHERE make = $1 AND model = $2 AND ($3 BETWEEN year_start AND COALESCE(year_end, 9999)) ORDER BY body_type', make_name, model, year)
                    body_type_list = [row['body_type'] for row in body_types]
                    print(f"Available body types for {make_name} {model} {year}: {body_type_list}")
                    
                    body_type = model_info.get('body_type')
                    print(f"Body type '{body_type}' found: {body_type in body_type_list}")
                    
                    # Check badges for this combination
                    if body_type in body_type_list:
                        badges = await conn.fetch('SELECT DISTINCT badge FROM vehicle_data WHERE make = $1 AND model = $2 AND ($3 BETWEEN year_start AND COALESCE(year_end, 9999)) AND body_type = $4 AND badge IS NOT NULL AND badge != '' ORDER BY badge', make_name, model, year, body_type)
                        badge_list = [row['badge'] for row in badges]
                        print(f"Available badges for {make_name} {model} {year} {body_type}: {badge_list}")
                        
                        trim = model_info.get('trim')
                        print(f"Trim '{trim}' found: {trim in badge_list}")
                        
                        if trim in badge_list:
                            print("\n🎉 SUCCESS! All fields should populate correctly in frontend!")
                        else:
                            print(f"\n❌ ISSUE: Trim '{trim}' not found in available badges")
                    else:
                        print(f"\n❌ ISSUE: Body type '{body_type}' not found in available options")
                else:
                    print(f"\n❌ ISSUE: Model '{model}' not found for make {make_name}")
            else:
                print(f"\n❌ ISSUE: Make '{make_name}' not found in database")
            
            await conn.close()
            
        except Exception as e:
            print(f"Database error: {e}")
    else:
        print("❌ VIN is invalid")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_vin_lookup())