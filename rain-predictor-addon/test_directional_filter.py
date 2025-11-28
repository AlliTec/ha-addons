#!/usr/bin/env python3
"""
Test script for directional filtering logic in rain predictor
"""

import sys
import os
sys.path.append('/home/sog/ai-projects/ha-addons/rain-predictor-addon')

from rain_predictor import RainPredictor

# Mock config and HA API for testing
test_config = {
    'latitude': -27.4,
    'longitude': 152.9,
    'run_interval_minutes': 3,
    'api_url': 'https://api.rainviewer.com/public/weather-maps.json'
}

class MockHAAPI:
    def __init__(self):
        pass
    
    def update_entity(self, entity_id, value, attributes=None):
        pass

def test_directional_filtering():
    """Test the directional filtering logic"""
    print("=== TESTING DIRECTIONAL FILTERING LOGIC ===\n")
    
    # Initialize predictor
    predictor = RainPredictor(test_config, MockHAAPI())
    
    # Test Case 1: Cell moving AWAY from user (should be filtered out)
    print("TEST CASE 1: Cell moving AWAY from user")
    print("User location: -27.4, 152.9")
    print("Cell location: -27.5, 152.8 (SW of user)")
    print("Cell direction: 32° (NNE)")
    print("Expected: FILTERED OUT (moving opposite direction)")
    
    # Create a mock cell moving away from user
    from rain_predictor import RainCell
    import datetime
    
    cell_away = RainCell(1, -27.5, 152.8, datetime.datetime.now(), 70)
    # Add positions to simulate movement away from user (with proper time gaps)
    now = datetime.datetime.now()
    cell_away.add_position(-27.49, 152.81, now + datetime.timedelta(minutes=2), 70)  # Moving NNE
    cell_away.add_position(-27.48, 152.82, now + datetime.timedelta(minutes=4), 70)  # Moving NNE
    
    predictor.tracked_cells = {1: cell_away}
    
    result_away = predictor._find_threatening_cell()
    print(f"Result: {result_away}")
    print(f"PASS: {result_away is None}\n")
    
    # Test Case 2: Cell moving TOWARD user (should pass filter)
    print("TEST CASE 2: Cell moving TOWARD user")
    print("User location: -27.4, 152.9")
    print("Cell location: -27.3, 152.7 (NE of user)")
    print("Cell direction: 212° (SSW)")
    print("Expected: PASS FILTER (moving toward user)")
    
    cell_toward = RainCell(2, -27.3, 152.7, datetime.datetime.now(), 70)
    # Add positions to simulate movement toward user (with proper time gaps)
    now = datetime.datetime.now()
    cell_toward.add_position(-27.31, 152.69, now + datetime.timedelta(minutes=2), 70)  # Moving SSW
    cell_toward.add_position(-27.32, 152.68, now + datetime.timedelta(minutes=4), 70)  # Moving SSW
    
    predictor.tracked_cells = {2: cell_toward}
    
    result_toward = predictor._find_threatening_cell()
    print(f"Result: {result_toward}")
    print(f"PASS: {result_toward is not None}\n")
    
    # Test Case 3: Multiple cells with different directions
    print("TEST CASE 3: Multiple cells - should select the one moving toward user")
    
    predictor.tracked_cells = {1: cell_away, 2: cell_toward}
    
    result_mixed = predictor._find_threatening_cell()
    print(f"Result: {result_mixed}")
    print(f"PASS: {result_mixed is not None and result_mixed['distance_km'] < 50.0}\n")
    
    print("=== TEST SUMMARY ===")
    print(f"Test 1 (away): {'PASS' if result_away is None else 'FAIL'}")
    print(f"Test 2 (toward): {'PASS' if result_toward is not None else 'FAIL'}")
    print(f"Test 3 (mixed): {'PASS' if result_mixed is not None and result_mixed['distance_km'] < 50.0 else 'FAIL'}")
    
    all_passed = (
        result_away is None and 
        result_toward is not None and 
        result_mixed is not None and result_mixed['distance_km'] < 50.0
    )
    
    print(f"\nOVERALL: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    return all_passed

if __name__ == "__main__":
    test_directional_filtering()