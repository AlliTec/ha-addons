#!/usr/bin/env python3
"""
Test script to verify the asset edit functionality works end-to-end
"""

import asyncio
import aiohttp
import json

async def test_asset_edit_flow():
    """Test the complete asset edit flow"""
    
    # Base URL
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        
        # Step 1: Get current asset details
        print("Step 1: Getting current asset details...")
        async with session.get(f"{base_url}/api/asset/7") as response:
            if response.status == 200:
                asset_data = await response.json()
                print(f"✓ Current asset: {asset_data['name']}")
                print(f"✓ Current notes: {asset_data['notes']}")
            else:
                print(f"✗ Failed to get asset: {response.status}")
                return False
        
        # Step 2: Update asset with test data
        print("\nStep 2: Updating asset...")
        update_data = {
            "name": "Amarok",
            "make": "Volkswagen", 
            "model": "Amarok",
            "location": "210 Woodswallow Moolboolaman Qld 6571",
            "status": "operational",
            "quantity": 1,
            "category": "Vehicle",
            "serial_number": "WV1ZZZ2HZDA061221",
            "purchase_date": "2024-05-09",
            "registration_no": "804KC9",
            "registration_due": "2026-05-13",
            "permit_info": "",
            "insurance_info": "Bingle CAR016221645",
            "insurance_due": None,
            "warranty_provider": "N/A",
            "warranty_expiry_date": None,
            "purchase_price": 7000.0,
            "purchase_location": "Grays.com Brisbane",
            "manual_or_doc_path": "",
            "notes": "Test edit - notes updated via API test",
            "parent_asset_id": None,
            "body_feature": "Ute",
            "badge": "Comfortline"
        }
        
        async with session.put(f"{base_url}/api/asset/7", json=update_data) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✓ Update successful: {result}")
            else:
                print(f"✗ Update failed: {response.status}")
                error_text = await response.text()
                print(f"Error: {error_text}")
                return False
        
        # Step 3: Verify the update was saved
        print("\nStep 3: Verifying update was saved...")
        await asyncio.sleep(0.1)  # Small delay to ensure DB commit
        
        async with session.get(f"{base_url}/api/asset/7") as response:
            if response.status == 200:
                updated_asset = await response.json()
                print(f"✓ Updated notes: {updated_asset['notes']}")
                
                if "Test edit - notes updated via API test" in updated_asset['notes']:
                    print("✓ Update verified successfully!")
                    return True
                else:
                    print("✗ Update not reflected in data")
                    return False
            else:
                print(f"✗ Failed to get updated asset: {response.status}")
                return False

if __name__ == "__main__":
    print("Testing Asset Edit Flow...")
    print("=" * 40)
    
    success = asyncio.run(test_asset_edit_flow())
    
    print("\n" + "=" * 40)
    if success:
        print("✓ ALL TESTS PASSED - Asset edit functionality works correctly!")
    else:
        print("✗ TESTS FAILED - Asset edit functionality has issues")