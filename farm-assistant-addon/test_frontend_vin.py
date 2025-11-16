#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

def test_frontend_vin_logic():
    """Test the frontend VIN lookup logic by simulating the API call"""
    client = TestClient(app)
    
    # Test the VIN lookup endpoint that frontend calls
    response = client.get('/api/vin/vehicle-data/6FPAAAJGCM9A59898')
    
    print(f'Status Code: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print('Response Data:')
        print(f'  make: {data.get("make")}')
        print(f'  model: {data.get("model")}')
        print(f'  year: {data.get("year")}')
        print(f'  body_type: {data.get("body_type")}')
        print(f'  badge: {data.get("badge")}')
        
        # Test that all required fields are present and non-empty
        required_fields = ['make', 'model', 'year', 'body_type', 'badge']
        missing_fields = []
        empty_fields = []
        
        for field in required_fields:
            if field not in data:
                missing_fields.append(field)
            elif not data[field] or data[field] == '':
                empty_fields.append(field)
        
        if missing_fields:
            print(f'✗ FAILED: Missing fields: {missing_fields}')
            return False
        elif empty_fields:
            print(f'✗ FAILED: Empty fields: {empty_fields}')
            return False
        else:
            print('✓ SUCCESS: All fields populated correctly')
            return True
    else:
        print(f'✗ FAILED: API returned {response.status_code}')
        return False

if __name__ == '__main__':
    success = test_frontend_vin_logic()
    sys.exit(0 if success else 1)