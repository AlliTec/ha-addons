#!/usr/bin/env python3
"""
Test script to verify asset update functionality
"""
import asyncio
import asyncpg
import json
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, '/home/sog/ai-projects/ha-addons/farm-assistant-addon')

# Import main module to get config
import main

async def test_asset_update():
    """Test asset update directly"""
    print("Testing asset update functionality...")
    
    # Connect to database
    conn = await asyncpg.connect(main.DATABASE_URL)
    
    try:
        # Get a sample asset to update
        asset = await conn.fetchrow('SELECT * FROM asset_inventory WHERE parent_asset_id IS NULL LIMIT 1')
        if not asset:
            print("No assets found to test with")
            return
        
        asset_id = asset['id']
        print(f"Testing with asset: {asset['name']} (ID: {asset_id})")
        print(f"Current location: {asset['location']}")
        print(f"Current notes: {asset['notes']}")
        
        # Test 1: Direct database update
        print("\n=== Test 1: Direct Database Update ===")
        test_location = f"Test Location {asyncio.get_event_loop().time()}"
        test_notes = f"Test notes {asyncio.get_event_loop().time()}"
        
        await conn.execute('''
            UPDATE asset_inventory 
            SET location = $1, notes = $2
            WHERE id = $3
        ''', test_location, test_notes, asset_id)
        
        # Verify update
        updated = await conn.fetchrow('SELECT location, notes FROM asset_inventory WHERE id = $1', asset_id)
        print(f"Updated location: {updated['location']}")
        print(f"Updated notes: {updated['notes']}")
        
        # Test 2: Simulate API call data structure
        print("\n=== Test 2: Simulate API Update ===")
        from main import AssetCreate
        
        # Create AssetCreate object like frontend would send
        asset_data = AssetCreate(
            name=asset['name'],
            category=asset['category'],
            asset_class=asset.get('asset_class'),
            make=asset['make'],
            model=asset['model'],
            year=asset['year'],
            body_feature=asset['body_feature'],
            badge=asset['badge'],
            serial_number=asset['serial_number'],
            purchase_date=asset['purchase_date'].isoformat() if asset['purchase_date'] else None,
            status=asset['status'],
            parent_asset_id=asset['parent_asset_id'],
            location=f"API Test Location {asyncio.get_event_loop().time()}",
            quantity=asset['quantity'],
            registration_no=asset['registration_no'],
            registration_due=asset['registration_due'].isoformat() if asset['registration_due'] else None,
            permit_info=asset['permit_info'],
            insurance_info=asset['insurance_info'],
            insurance_due=asset['insurance_due'].isoformat() if asset['insurance_due'] else None,
            warranty_provider=asset['warranty_provider'],
            warranty_expiry_date=asset['warranty_expiry_date'].isoformat() if asset['warranty_expiry_date'] else None,
            purchase_price=float(asset['purchase_price']) if asset['purchase_price'] else None,
            purchase_location=asset['purchase_location'],
            manual_or_doc_path=asset['manual_or_doc_path'],
            notes=f"API Test notes {asyncio.get_event_loop().time()}",
            usage_type=None,
            usage_value=None,
            usage_notes=None
        )
        
        # Manually execute the same update logic as the API
        from datetime import datetime
        
        # Convert date strings to date objects
        purchase_date = datetime.strptime(asset_data.purchase_date, '%Y-%m-%d').date() if asset_data.purchase_date else None
        registration_due = datetime.strptime(asset_data.registration_due, '%Y-%m-%d').date() if asset_data.registration_due else None
        insurance_due = datetime.strptime(asset_data.insurance_due, '%Y-%m-%d').date() if asset_data.insurance_due else None
        warranty_expiry_date = datetime.strptime(asset_data.warranty_expiry_date, '%Y-%m-%d').date() if asset_data.warranty_expiry_date else None
        
        # Convert empty strings to None for unique constraint fields
        serial_number = asset_data.serial_number.strip() if asset_data.serial_number and asset_data.serial_number.strip() else None
        registration_no = asset_data.registration_no.strip() if asset_data.registration_no and asset_data.registration_no.strip() else None
        
        # Update asset with all fields (same as API)
        await conn.execute("""
            UPDATE asset_inventory 
            SET name = $1, category = $2, asset_class = $3, make = $4, model = $5, year = $6, body_feature = $7,
                badge = $8, serial_number = $9, purchase_date = $10, status = $11, parent_asset_id = $12, location = $13,
                quantity = $14, registration_no = $15, registration_due = $16,
                permit_info = $17, insurance_info = $18, insurance_due = $19,
                warranty_provider = $20, warranty_expiry_date = $21, purchase_price = $22,
                purchase_location = $23, manual_or_doc_path = $24, notes = $25
            WHERE id = $26
        """, asset_data.name, asset_data.category, asset_data.asset_class, asset_data.make, asset_data.model, asset_data.year, asset_data.body_feature,
            asset_data.badge, serial_number, purchase_date, asset_data.status, asset_data.parent_asset_id, asset_data.location,
            asset_data.quantity, registration_no, registration_due, asset_data.permit_info,
            asset_data.insurance_info, insurance_due, asset_data.warranty_provider,
            warranty_expiry_date, asset_data.purchase_price, asset_data.purchase_location,
            asset_data.manual_or_doc_path, asset_data.notes, asset_id)
        
        # Verify API-style update
        api_updated = await conn.fetchrow('SELECT location, notes FROM asset_inventory WHERE id = $1', asset_id)
        print(f"API Updated location: {api_updated['location']}")
        print(f"API Updated notes: {api_updated['notes']}")
        
        # Restore original data
        await conn.execute('''
            UPDATE asset_inventory 
            SET location = $1, notes = $2
            WHERE id = $3
        ''', asset['location'], asset['notes'], asset_id)
        
        print("\n=== Test Results ===")
        print("✓ Direct database update: SUCCESS")
        print("✓ API-style update: SUCCESS")
        print("\nIf updates work here, the issue is likely in:")
        print("1. Frontend not calling API correctly")
        print("2. API endpoint not being reached")
        print("3. Frontend not refreshing data after update")
        
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(test_asset_update())