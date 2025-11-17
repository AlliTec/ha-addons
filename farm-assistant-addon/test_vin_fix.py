#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vin_decoder import decode_vin

def test_vin_decoder():
    print("Testing VIN decoder fixes...")
    
    # Test problematic VIN
    result1 = decode_vin('WV1ZZZ2HZDA061221')
    print(f"WV1ZZZ2HZDA061221: {result1['model_info']['model']}")
    
    # Test a known Crafter VIN (different pattern)
    result2 = decode_vin('WV1ZZZ2HAB123456')  # Different specific code
    print(f"WV1ZZZ2HAB123456: {result2['model_info']['model']}")
    
    # Test a known Transporter pattern
    result3 = decode_vin('WV1ZZZ2AB123456')  # Should be Transporter
    print(f"WV1ZZZ2AB123456: {result3['model_info']['model']}")
    
    print("\nFull decode for problematic VIN:")
    print(f"Manufacturer: {result1['manufacturer']}")
    print(f"Year: {result1['year']}")
    print(f"Model: {result1['model_info']['model']}")
    print(f"Body Type: {result1['model_info']['body_type']}")
    
    # Verify the fix worked
    if result1['model_info']['model'] != 'Crafter':
        print("\n✓ SUCCESS: VIN no longer incorrectly identified as Crafter")
        return True
    else:
        print("\n✗ FAILED: VIN still incorrectly identified as Crafter")
        return False

if __name__ == '__main__':
    success = test_vin_decoder()
    sys.exit(0 if success else 1)