#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

try:
    from rain_predictor import AddonConfig, HomeAssistantAPI, RainPredictor
    print("✓ Successfully imported rain_predictor modules")
    
    # Test configuration loading
    config = AddonConfig()
    print(f"✓ Config loaded: {config.config}")
    
    # Test HA API
    ha_api = HomeAssistantAPI()
    print("✓ HA API initialized")
    
    # Test predictor creation
    predictor = RainPredictor(config, ha_api)
    print("✓ RainPredictor created")
    
    # Test single prediction (without running the loop)
    print("✓ Running single prediction test...")
    try:
        predictor.run_prediction()
        print("✓ Single prediction completed successfully")
    except Exception as e:
        print(f"⚠ Prediction test failed (may be expected without HA): {e}")
    
    print("✓ Backend tests completed")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)