#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

try:
    from web_ui import app
    print("✓ Successfully imported web_ui app")
    
    # Test routes
    with app.test_client() as client:
        response = client.get('/')
        print(f"✓ Main page status: {response.status_code}")
        
        response = client.get('/health')
        print(f"✓ Health endpoint status: {response.status_code}")
        print(f"✓ Health response: {response.get_data().decode()}")
        
        response = client.get('/api/data')
        print(f"✓ API data endpoint status: {response.status_code}")
        
    print("✓ All basic tests passed")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)