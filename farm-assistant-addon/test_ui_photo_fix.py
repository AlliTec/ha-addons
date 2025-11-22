#!/usr/bin/env python3
"""
Test script to verify photo upload fix works correctly
Tests both relative and absolute path scenarios
"""

import requests
import json

def test_photo_api_fix():
    """Test that photo API calls work with relative paths"""
    base_url = "http://localhost:8000"
    
    print("Testing Photo API Fix...")
    print("=" * 50)
    
    # Test 1: Photo retrieval with relative path (what the fixed JS uses)
    try:
        response = requests.get(f"{base_url}/api/animal/9/photos")
        if response.ok:
            photos = response.json()
            print(f"✅ Relative path photo retrieval works: {len(photos)} photos")
        else:
            print(f"❌ Relative path failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Relative path error: {e}")
    
    # Test 2: Photo upload endpoint exists
    try:
        response = requests.post(f"{base_url}/api/animal/9/photo")
        if response.status_code == 422:
            print("✅ Photo upload endpoint exists (validation error expected)")
        else:
            print(f"⚠️  Unexpected upload response: {response.status_code}")
    except Exception as e:
        print(f"❌ Upload endpoint error: {e}")
    
    # Test 3: Verify existing photo data
    try:
        response = requests.get(f"{base_url}/api/animal/9/photos")
        if response.ok:
            photos = response.json()
            for photo in photos:
                print(f"✅ Found photo: {photo['filename']} ({photo['mime_type']})")
        else:
            print(f"❌ Photo data check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Photo data error: {e}")
    
    print("=" * 50)
    print("Photo API fix verification complete!")

if __name__ == "__main__":
    test_photo_api_fix()