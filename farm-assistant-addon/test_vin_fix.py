#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vin_decoder import decode_vin

def test_vin_decoder():
    """Test the VIN decoder with our problematic VIN"""
    vin = '6FPAAAJGCM9A59898'
    result = decode_vin(vin)
    
    print('VIN decode result:')
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
    success = test_vin_decoder()
    sys.exit(0 if success else 1)