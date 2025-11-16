#!/usr/bin/env python3
"""Test the complete VIN lookup flow as the frontend would execute it"""

import asyncio
import aiohttp
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_vin_frontend_flow():
    """Test the complete VIN lookup flow"""
    
    # Test data
    vin = "6FPAAAJG33333"
    base_url = "http://127.0.0.1:8000"
    
    print(f"=== Testing VIN Frontend Flow for: {vin} ===\n")
    
    async with aiohttp.ClientSession() as session:
        try:
            # Step 1: Lookup VIN specifications (what frontend does)
            print("Step 1: Looking up VIN specifications...")
            async with session.get(f"{base_url}/api/vin/specifications/{vin}") as response:
                if not response.ok:
                    print(f"❌ VIN lookup failed: {response.status}")
                    return
                
                specs = await response.json()
                print(f"✅ VIN specs received:")
                print(f"   Manufacturer: {specs.get('manufacturer')}")
                print(f"   Year: {specs.get('year')} (type: {type(specs.get('year'))})")
                print(f"   Model info: {specs.get('model_info')}")
                
                if not specs.get('valid'):
                    print("❌ VIN marked as invalid")
                    return
            
            # Step 2: Extract make name (as frontend does)
            print("\nStep 2: Extracting make name...")
            manufacturer = specs.get('manufacturer', '')
            make_name = manufacturer.split(' ')[0] if manufacturer else ''
            print(f"   Extracted make: '{make_name}'")
            
            # Step 3: Get body types for this make/model/year (as frontend does)
            print("\nStep 3: Getting body types...")
            model_info = specs.get('model_info', {})
            model = model_info.get('model', '')
            year = specs.get('year')
            
            if not make_name or not model or not year:
                print(f"❌ Missing required data: make={make_name}, model={model}, year={year}")
                return
            
            body_types_url = f"{base_url}/api/vehicle/body-types?make={make_name}&model={model}&year={year}"
            async with session.get(body_types_url) as response:
                if not response.ok:
                    print(f"❌ Body types API failed: {response.status}")
                    return
                
                body_types = await response.json()
                print(f"✅ Body types available: {body_types}")
            
            # Step 4: Check if VIN's body_type matches available options
            print("\nStep 4: Matching body type...")
            vin_body_type = model_info.get('body_type')
            print(f"   VIN body type: '{vin_body_type}'")
            
            if vin_body_type and vin_body_type in body_types:
                print(f"✅ Body type '{vin_body_type}' found in options")
            else:
                print(f"❌ Body type '{vin_body_type}' not found in {body_types}")
                return
            
            # Step 5: Get badges for this combination (as frontend does)
            print("\nStep 5: Getting badges...")
            badges_url = f"{base_url}/api/vehicle/badges?make={make_name}&model={model}&year={year}&body_type={vin_body_type}"
            async with session.get(badges_url) as response:
                if not response.ok:
                    print(f"❌ Badges API failed: {response.status}")
                    return
                
                badges = await response.json()
                print(f"✅ Badges available: {badges}")
            
            # Step 6: Check if VIN's trim matches available badges
            print("\nStep 6: Matching badge/trim...")
            vin_trim = model_info.get('trim')
            print(f"   VIN trim: '{vin_trim}'")
            
            if vin_trim and vin_trim in badges:
                print(f"✅ Trim '{vin_trim}' found in badges")
            else:
                print(f"❌ Trim '{vin_trim}' not found in {badges}")
                return
            
            print("\n🎉 COMPLETE SUCCESS! All fields should populate correctly:")
            print(f"   Make: {make_name}")
            print(f"   Model: {model}")
            print(f"   Year: {year}")
            print(f"   Body Type: {vin_body_type}")
            print(f"   Badge: {vin_trim}")
            
        except aiohttp.ClientError as e:
            print(f"❌ Connection error: {e}")
            print("   Make sure the server is running on http://127.0.0.1:8000")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    # Start server in background if not running
    import threading
    import uvicorn
    import time
    
    def start_server():
        uvicorn.run('main:app', host='127.0.0.1', port=8000, log_level='error')
    
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(3)  # Wait for server to start
    
    # Run the test
    asyncio.run(test_vin_frontend_flow())