#!/usr/bin/env python3

import asyncio
import sys
import os
import json
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI app
from main import app

def test_vin_lookup_api():
    """Test the full VIN lookup API endpoint"""
    client = TestClient(app)
    
    # Test VIN
    vin = '6FPAAAJGCM9A59898'
    
    print(f'Testing VIN lookup API with VIN: {vin}')
    print('=' * 50)
    
    # Call the API endpoint
    response = client.get(f'/api/vin/vehicle-data/{vin}')
    
    print(f'Status Code: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print('Response Data:')
        print(json.dumps(data, indent=2))
        
        # Check if all expected fields are populated
        expected_fields = ['make', 'model', 'year', 'body_type', 'badge']
        missing_fields = []
        empty_fields = []
        
        for field in expected_fields:
            if field not in data:
                missing_fields.append(field)
            elif not data[field] or data[field] == '':
                empty_fields.append(field)
        
        if missing_fields:
            print(f'\n✗ FAILED: Missing fields: {missing_fields}')
            return False
        elif empty_fields:
            print(f'\n✗ FAILED: Empty fields: {empty_fields}')
            return False
        else:
            print(f'\n✓ SUCCESS: All fields populated correctly')
            return True
    else:
        print(f'Error Response: {response.text}')
        return False

def test_vin_decoder_direct():
    """Test VIN decoder directly"""
    from vin_decoder import decode_vin
    
    vin = '6FPAAAJGCM9A59898'
    result = decode_vin(vin)
    
    print(f'\nDirect VIN Decoder Test for: {vin}')
    print('=' * 50)
    
    for key, value in result.items():
        print(f'  {key}: {value}')
    
    # Check if year is correctly identified as 2009
    expected_year = 2009
    actual_year = result.get('year')
    
    if actual_year == expected_year:
        print(f'\n✓ SUCCESS: VIN correctly decoded as year {actual_year}')
        return True
    else:
        print(f'\n✗ FAILED: VIN decoded as year {actual_year}, expected {expected_year}')
        return False

if __name__ == '__main__':
    print('Testing VIN Decoder Fix')
    print('=' * 50)
    
    # Test direct VIN decoder
    decoder_success = test_vin_decoder_direct()
    
    # Test full API
    api_success = test_vin_lookup_api()
    
    overall_success = decoder_success and api_success
    
    print(f'\nOverall Result: {"SUCCESS" if overall_success else "FAILED"}')
    sys.exit(0 if overall_success else 1)