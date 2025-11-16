#!/usr/bin/env python3
"""Debug script to test VIN lookup functionality"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vin_decoder import VINDecoder

def test_vin_lookup():
    """Test VIN lookup with sample VINs"""
    decoder = VINDecoder()
    
    # Test with a sample Ford Falcon VIN
    test_vins = [
        "6FPAAAJG33333",  # Ford Falcon XR6 Turbo Ute
        "6FPFG12345678",  # Ford Falcon FG Sedan
        "1FA6P8CF",       # Ford Mustang (shortened for testing)
    ]
    
    for vin in test_vins:
        print(f"\n=== Testing VIN: {vin} ===")
        
        # Test basic decode
        decoded = decoder.decode_vin(vin)
        print(f"Basic decode: {decoded}")
        
        # Test specifications lookup
        specs = decoder.lookup_vehicle_specifications(vin)
        print(f"Specifications: {specs}")
        
        # Check what fields are available
        if "error" not in specs:
            print(f"Year: {specs.get('year')} (type: {type(specs.get('year'))})")
            print(f"Model info: {specs.get('model_info')}")
            if specs.get('model_info'):
                print(f"Body type: {specs['model_info'].get('body_type')}")
                print(f"Trim: {specs['model_info'].get('trim')}")

if __name__ == "__main__":
    test_vin_lookup()