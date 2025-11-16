#!/usr/bin/env python3
"""Direct VIN decoder test without any dependencies on main.py"""

import sys
import os
import asyncio
import asyncpg

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vin_decoder import VINDecoder

async def test_vin_lookup_complete():
    """Complete VIN lookup test matching frontend behavior"""
    print("=== Complete VIN Lookup Test ===")
    
    decoder = VINDecoder()
    test_vin = "6FPAAAJG33333"
    
    print(f"Testing VIN: {test_vin}")
    
    # Step 1: Decode VIN (as frontend API does)
    decoded = decoder.decode_vin(test_vin)
    print(f"\n1. VIN Decode Results:")
    print(f"   Valid: {decoded.get('valid')}")
    print(f"   Manufacturer: {decoded.get('manufacturer')}")
    print(f"   Year: {decoded.get('year')}")
    print(f"   Model Info: {decoded.get('model_info')}")
    
    if not decoded.get('valid'):
        print("❌ VIN is invalid - cannot proceed")
        return
    
    # Step 2: Extract frontend values (as populateFromVIN does)
    manufacturer = decoded.get('manufacturer', '')
    make_name = manufacturer.split(' ')[0] if manufacturer else ''
    model_info = decoded.get('model_info', {})
    model = model_info.get('model')
    year = decoded.get('year')
    body_type = model_info.get('body_type')
    trim = model_info.get('trim')
    
    print(f"\n2. Frontend Extraction:")
    print(f"   Make name: '{make_name}'")
    print(f"   Model: '{model}'")
    print(f"   Year: {year}")
    print(f"   Body type: '{body_type}'")
    print(f"   Trim: '{trim}'")
    
    # Step 3: Database verification (as frontend APIs do)
    print(f"\n3. Database Verification:")
    
    try:
        conn = await asyncpg.connect(
            host='192.168.1.130',
            port=5432,
            user='postgres',
            password='homeassistant',
            database='hal_farm_db'
        )
        
        # Test makes API equivalent
        makes = await conn.fetch('SELECT DISTINCT make FROM vehicle_data ORDER BY make')
        make_list = [row['make'] for row in makes]
        make_match = any(make_name in m for m in make_list)  # Frontend uses .includes()
        print(f"   Makes available: {make_list}")
        print(f"   Make '{make_name}' matches: {make_match}")
        
        if not make_match:
            print("❌ Make not found - frontend would fail here")
            await conn.close()
            return
        
        # Test models API equivalent  
        models = await conn.fetch('SELECT DISTINCT model FROM vehicle_data WHERE make = $1 ORDER BY model', make_name)
        model_list = [row['model'] for row in models]
        model_match = model in model_list
        print(f"   Models for {make_name}: {model_list}")
        print(f"   Model '{model}' matches: {model_match}")
        
        if not model_match:
            print("❌ Model not found - frontend would fail here")
            await conn.close()
            return
        
        # Test years API equivalent
        years = await conn.fetch('SELECT DISTINCT year_start FROM vehicle_data WHERE make = $1 AND model = $2 ORDER BY year_start', make_name, model)
        year_list = [row['year_start'] for row in years]
        year_match = year in year_list
        print(f"   Years for {make_name} {model}: {year_list}")
        print(f"   Year {year} matches: {year_match}")
        
        if not year_match:
            print("❌ Year not found - frontend would fail here")
            await conn.close()
            return
        
        # Test body types API equivalent
        body_types = await conn.fetch('SELECT DISTINCT body_type FROM vehicle_data WHERE make = $1 AND model = $2 AND ($3 BETWEEN year_start AND COALESCE(year_end, 9999)) ORDER BY body_type', make_name, model, year)
        body_type_list = [row['body_type'] for row in body_types]
        body_type_match = body_type in body_type_list
        print(f"   Body types for {make_name} {model} {year}: {body_type_list}")
        print(f"   Body type '{body_type}' matches: {body_type_match}")
        
        if not body_type_match:
            print("❌ Body type not found - frontend would fail here")
            await conn.close()
            return
        
        # Test badges API equivalent
        badges = await conn.fetch('SELECT DISTINCT badge FROM vehicle_data WHERE make = $1 AND model = $2 AND ($3 BETWEEN year_start AND COALESCE(year_end, 9999)) AND body_type = $4 AND badge IS NOT NULL AND badge != \'\' ORDER BY badge', make_name, model, year, body_type)
        badge_list = [row['badge'] for row in badges]
        trim_match = trim in badge_list
        print(f"   Badges for {make_name} {model} {year} {body_type}: {badge_list}")
        print(f"   Trim '{trim}' matches: {trim_match}")
        
        if not trim_match:
            print("❌ Trim not found - frontend would fail here")
            await conn.close()
            return
        
        print(f"\n🎉 COMPLETE SUCCESS!")
        print(f"   All frontend field matching would work correctly:")
        print(f"   - Make: {make_name} ✅")
        print(f"   - Model: {model} ✅") 
        print(f"   - Year: {year} ✅")
        print(f"   - Body Type: {body_type} ✅")
        print(f"   - Badge: {trim} ✅")
        print(f"\n   The issue must be in frontend JavaScript execution, not backend logic!")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return

if __name__ == "__main__":
    asyncio.run(test_vin_lookup_complete())