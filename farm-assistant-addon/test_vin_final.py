#!/usr/bin/env python3
"""Final comprehensive test of VIN lookup functionality"""

import sys
import os
import asyncio
import asyncpg

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vin_decoder import VINDecoder

async def test_vin_lookup_final():
    """Final comprehensive test matching real user scenario"""
    print("=== FINAL VIN LOOKUP TEST ===")
    print("Testing the exact scenario user reported as not working")
    print("Expected: All fields should populate correctly\n")
    
    decoder = VINDecoder()
    test_vin = "6FPAAAJG33333"
    
    print(f"🔍 Testing VIN: {test_vin}")
    
    # Test 1: VIN decode
    decoded = decoder.decode_vin(test_vin)
    print(f"\n📋 Step 1 - VIN Decode Results:")
    print(f"   Valid: {decoded.get('valid')}")
    print(f"   Manufacturer: {decoded.get('manufacturer')}")
    print(f"   Year: {decoded.get('year')}")
    print(f"   Model Info: {decoded.get('model_info')}")
    
    if not decoded.get('valid'):
        print("❌ FAIL: VIN is invalid")
        return False
    
    # Test 2: Extract frontend values
    manufacturer = decoded.get('manufacturer', '')
    make_name = manufacturer.split(' ')[0] if manufacturer else ''
    model_info = decoded.get('model_info', {})
    model = model_info.get('model')
    year = decoded.get('year')
    body_type = model_info.get('body_type')
    trim = model_info.get('trim')
    
    print(f"\n🎯 Step 2 - Frontend Value Extraction:")
    print(f"   Make name: '{make_name}'")
    print(f"   Model: '{model}'")
    print(f"   Year: {year}")
    print(f"   Body type: '{body_type}'")
    print(f"   Trim: '{trim}'")
    
    # Test 3: Database verification
    print(f"\n🗄️ Step 3 - Database Verification:")
    
    try:
        conn = await asyncpg.connect(
            host='192.168.1.130',
            port=5432,
            user='postgres',
            password='homeassistant',
            database='hal_farm_db'
        )
        
        # Verify make exists
        makes = await conn.fetch('SELECT DISTINCT make FROM vehicle_data ORDER BY make')
        make_list = [row['make'] for row in makes]
        make_match = any(make_name in m for m in make_list)
        print(f"   Make '{make_name}' in database: {make_match} ✅" if make_match else f"   Make '{make_name}' NOT in database: {make_match} ❌")
        
        # Verify model exists
        models = await conn.fetch('SELECT DISTINCT model FROM vehicle_data WHERE make = $1 ORDER BY model', make_name)
        model_list = [row['model'] for row in models]
        model_match = model in model_list
        print(f"   Model '{model}' in database: {model_match} ✅" if model_match else f"   Model '{model}' NOT in database: {model_match} ❌")
        
        # Verify year exists
        years = await conn.fetch('SELECT DISTINCT year_start FROM vehicle_data WHERE make = $1 AND model = $2 ORDER BY year_start', make_name, model)
        year_list = [row['year_start'] for row in years]
        year_match = year in year_list
        print(f"   Year {year} in database: {year_match} ✅" if year_match else f"   Year {year} NOT in database: {year_match} ❌")
        
        # Verify body type exists
        body_types = await conn.fetch('SELECT DISTINCT body_type FROM vehicle_data WHERE make = $1 AND model = $2 AND ($3 BETWEEN year_start AND COALESCE(year_end, 9999)) ORDER BY body_type', make_name, model, year)
        body_type_list = [row['body_type'] for row in body_types]
        body_type_match = body_type in body_type_list
        print(f"   Body type '{body_type}' in database: {body_type_match} ✅" if body_type_match else f"   Body type '{body_type}' NOT in database: {body_type_match} ❌")
        
        # Verify badge exists
        badges = await conn.fetch('SELECT DISTINCT badge FROM vehicle_data WHERE make = $1 AND model = $2 AND ($3 BETWEEN year_start AND COALESCE(year_end, 9999)) AND body_type = $4 AND badge IS NOT NULL AND badge != \'\' ORDER BY badge', make_name, model, year, body_type)
        badge_list = [row['badge'] for row in badges]
        trim_match = trim in badge_list
        print(f"   Badge '{trim}' in database: {trim_match} ✅" if trim_match else f"   Badge '{trim}' NOT in database: {trim_match} ❌")
        
        await conn.close()
        
        # Final result
        all_match = make_match and model_match and year_match and body_type_match and trim_match
        
        print(f"\n🏁 FINAL RESULT:")
        if all_match:
            print("✅ ALL TESTS PASSED!")
            print("✅ VIN lookup should work perfectly!")
            print("✅ All fields should populate correctly!")
            print("\n📋 SUMMARY:")
            print(f"   • Make: {make_name}")
            print(f"   • Model: {model}")
            print(f"   • Year: {year}")
            print(f"   • Body Type: {body_type}")
            print(f"   • Badge: {trim}")
            print("\n🔧 If user still reports issues:")
            print("   1. Check browser console for JavaScript errors")
            print("   2. Ensure user clicks 'Lookup VIN' button after entering VIN")
            print("   3. Verify all dropdowns are populated before VIN lookup")
            print("   4. Check that user has proper network connectivity")
            return True
        else:
            print("❌ SOME TESTS FAILED!")
            print("❌ VIN lookup will not work correctly!")
            return False
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_vin_lookup_final())
    sys.exit(0 if result else 1)